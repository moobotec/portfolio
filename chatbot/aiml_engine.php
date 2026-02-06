<?php
declare(strict_types=1);

final class AimlNode
{
    /** @var array<string, AimlNode> */
    public array $children = [];
    public ?AimlNode $underscore = null;
    public ?AimlNode $star = null;
    public ?string $templateXml = null;

    public function add(array $tokens, string $templateXml): void
    {
        if ($tokens === []) {
            $this->templateXml = $templateXml;
            return;
        }

        $token = array_shift($tokens);
        if ($token === '_') {
            if (!$this->underscore) {
                $this->underscore = new AimlNode();
            }
            $this->underscore->add($tokens, $templateXml);
            return;
        }
        if ($token === '*') {
            if (!$this->star) {
                $this->star = new AimlNode();
            }
            $this->star->add($tokens, $templateXml);
            return;
        }
        if (!isset($this->children[$token])) {
            $this->children[$token] = new AimlNode();
        }
        $this->children[$token]->add($tokens, $templateXml);
    }
}

final class AimlSession
{
    /** @var array<string, string> */
    public array $predicates = [];
    public string $topic = '*';
    public string $that = '*';
    public string $lastInput = '';

    /** @var string[] */
    public array $star = [];
    /** @var string[] */
    public array $thatStar = [];
    /** @var string[] */
    public array $topicStar = [];

    /** @var string[] */
    public array $previousUserInputs = [];
    /** @var array<int, array<int, string>> */
    public array $previousBotResponses = [];
    /** @var array<int, array<int, string>> */
    public array $previousBotResponsesWithPunct = [];
}

final class AimlEngine
{
    private AimlNode $root;
    private string $fallback;
    private int $maxRecursion;
    private string $learnBaseDir;
    private int $maxResponseTimeMs;
    private float $deadline = 0.0;
    private bool $debugEnabled = false;
    private ?string $debugLog = null;
    private int $loadedCategories = 0;
    private int $loadedFiles = 0;
    /** @var array<string, string> */
    private array $botProperties = [];
    /** @var array<string, array{default:string,set_return:string}> */
    private array $predicateDefs = [];
    /** @var array<int, array{find:string,replace:string}> */
    private array $inputSubstitutions = [];
    /** @var array<int, array{find:string,replace:string}> */
    private array $genderSubstitutions = [];
    /** @var array<int, array{find:string,replace:string}> */
    private array $personSubstitutions = [];
    /** @var array<int, array{find:string,replace:string}> */
    private array $person2Substitutions = [];
    /** @var string[] */
    private array $sentenceSplitters = ['.', '!', '?', ';'];
    /** @var string[] */
    private array $previousSrai = [];

    public function __construct(array $config)
    {
        $this->root = new AimlNode();
        $this->fallback = (string)($config['fallback'] ?? "Je n'ai pas compris.");
        $this->maxRecursion = (int)($config['max_recursion'] ?? 10);
        $this->learnBaseDir = (string)($config['learn_base_dir'] ?? __DIR__ . '/..');
        $this->maxResponseTimeMs = max(100, (int)($config['max_response_time_ms'] ?? 1500));
        $this->debugEnabled = (bool)($config['debug_enabled'] ?? false);
        $this->debugLog = isset($config['debug_log']) ? (string)$config['debug_log'] : null;
        if ($this->debugEnabled) {
            $this->logDebug('init', [
                'fallback' => $this->fallback,
                'max_recursion' => $this->maxRecursion,
                'max_response_time_ms' => $this->maxResponseTimeMs,
            ]);
        }
        $dirs = $config['aiml_dirs'] ?? [];
        foreach ($dirs as $dir) {
            $this->loadAimlDir((string)$dir);
        }
        $confDir = (string)($config['conf_dir'] ?? '');
        if ($confDir !== '' && is_dir($confDir)) {
            $this->loadConfDir($confDir);
        } elseif ($confDir !== '') {
            $this->logDebug('conf_dir_missing', ['dir' => $confDir]);
        }
        if ($this->debugEnabled) {
            $this->logDebug('loaded', [
                'files' => $this->loadedFiles,
                'categories' => $this->loadedCategories,
            ]);
        }
    }

    public function respond(string $input, ?AimlSession $session = null, int $depth = 0): string
    {
        if ($session === null) {
            $session = $this->createDefaultSession();
        }
        $this->deadline = microtime(true) + ($this->maxResponseTimeMs / 1000);
        $this->previousSrai = [];

        return $this->respondInternal($input, $session, true, $depth);
    }

    private function respondInternal(string $input, AimlSession $session, bool $keepPreviousUserInput, int $depth): string
    {
        if ($this->isTimedOut()) {
            return $this->fallback;
        }
        if ($depth > $this->maxRecursion) {
            return $this->fallback;
        }

        $session->lastInput = $input;

        if ($keepPreviousUserInput) {
            array_unshift($session->previousUserInputs, $input);
            if (count($session->previousUserInputs) > 10) {
                $session->previousUserInputs = array_slice($session->previousUserInputs, 0, 10);
            }
        }

        $input = $this->applyInputSubstitutions($input);
        $sentences = $this->splitSentences($input);
        $responses = [];

        foreach ($sentences as $sentence) {
            if ($this->isTimedOut()) {
                return $this->fallback;
            }
            $sentence = trim($sentence);
            if ($sentence === '') {
                continue;
            }

            $templateXml = $this->matchTemplate($sentence, $session);
            if ($templateXml === null) {
                $responses[] = $this->fallback;
                continue;
            }
            $this->logDebug('match_template', ['input' => $sentence, 'template_len' => strlen($templateXml)]);

            $reply = $this->renderTemplate($templateXml, $session, $depth);
            if ($reply !== '') {
                $responses[] = $reply;
                $this->updateThatAndHistory($reply, $session);
            }
        }

        if ($responses === []) {
            return $this->fallback;
        }

        $out = trim(implode(' ', $responses));
        return $out === '' ? $this->fallback : $out;
    }
    private function matchTemplate(string $sentence, AimlSession $session): ?string
    {
        $session->star = [];
        $session->thatStar = [];
        $session->topicStar = [];

        $inputTokens = $this->tokenizeWords($sentence);
        $thatTokens = $this->tokenizeWords($session->that !== '' ? $session->that : '*');
        $topicValue = $session->predicates['topic'] ?? $session->topic ?? '*';
        $topicTokens = $this->tokenizeWords($topicValue !== '' ? $topicValue : '*');

        $tokens = array_merge(
            $inputTokens,
            ['<THAT>'],
            $thatTokens,
            ['<TOPIC>'],
            $topicTokens
        );

        $result = $this->matchNode($this->root, $tokens, 0, 'default', $session->star, $session->thatStar, $session->topicStar);
        if ($result === null) {
            return null;
        }

        $session->star = $result['star'];
        $session->thatStar = $result['thatStar'];
        $session->topicStar = $result['topicStar'];

        return $result['template'];
    }

    private function matchNode(AimlNode $node, array $tokens, int $pos, string $mode, array $star, array $thatStar, array $topicStar): ?array
    {
        if ($this->isTimedOut()) {
            return null;
        }
        if ($pos >= count($tokens)) {
            if ($node->templateXml !== null) {
                return [
                    'template' => $node->templateXml,
                    'star' => $star,
                    'thatStar' => $thatStar,
                    'topicStar' => $topicStar,
                ];
            }
            return null;
        }

        $word = $tokens[$pos];
        $nextMode = $mode;
        if ($word === '<THAT>') {
            $nextMode = 'that';
        } elseif ($word === '<TOPIC>') {
            $nextMode = 'topic';
        }

        if ($node->underscore) {
            $res = $this->matchWildcardBranch($node->underscore, $tokens, $pos + 1, $nextMode, $word, $star, $thatStar, $topicStar);
            if ($res !== null) {
                return $res;
            }
        }

        if ($word !== '*') {
            $child = $node->children[$word] ?? null;
            if ($child) {
                $res = $this->matchNode($child, $tokens, $pos + 1, $nextMode, $star, $thatStar, $topicStar);
                if ($res !== null) {
                    return $res;
                }
            }
        }

        if ($node->star) {
            $seed = $word === '*' ? '' : $word;
            $res = $this->matchWildcardBranch($node->star, $tokens, $pos + 1, $nextMode, $seed, $star, $thatStar, $topicStar);
            if ($res !== null) {
                return $res;
            }
        }

        return null;
    }

    private function matchWildcardBranch(AimlNode $node, array $tokens, int $pos, string $mode, string $starSeed, array $star, array $thatStar, array $topicStar): ?array
    {
        $starText = $starSeed;
        $tempPos = $pos;

        while (true) {
            $res = $this->matchNode($node, $tokens, $tempPos, $mode, $star, $thatStar, $topicStar);
            if ($res !== null) {
                $res = $this->pushStarToResult($res, $mode, $starText);
                return $res;
            }
            if ($tempPos >= count($tokens)) {
                break;
            }
            $starText = $starText === '' ? $tokens[$tempPos] : ($starText . ' ' . $tokens[$tempPos]);
            $tempPos++;
        }

        if ($node->templateXml !== null) {
            $res = [
                'template' => $node->templateXml,
                'star' => $star,
                'thatStar' => $thatStar,
                'topicStar' => $topicStar,
            ];
            return $this->pushStarToResult($res, $mode, $starText);
        }

        return null;
    }

    private function pushStarToResult(array $res, string $mode, string $starText): array
    {
        if ($starText === '') {
            return $res;
        }
        if ($mode === 'that') {
            $res['thatStar'][] = $starText;
        } elseif ($mode === 'topic') {
            $res['topicStar'][] = $starText;
        } else {
            $res['star'][] = $starText;
        }
        return $res;
    }

    private function updateThatAndHistory(string $response, AimlSession $session): void
    {
        [$sentences, $sentencesWithPunct] = $this->splitResponseWithPunct($response);
        if ($sentences !== []) {
            $session->that = $this->removePunctuation($sentences[0]);
        }
        array_unshift($session->previousBotResponses, $sentences);
        array_unshift($session->previousBotResponsesWithPunct, $sentencesWithPunct);
        if (count($session->previousBotResponses) > 10) {
            $session->previousBotResponses = array_slice($session->previousBotResponses, 0, 10);
            $session->previousBotResponsesWithPunct = array_slice($session->previousBotResponsesWithPunct, 0, 10);
        }
    }

    private function loadAimlDir(string $dir): void
    {
        if (!is_dir($dir)) {
            $this->logDebug('aiml_dir_missing', ['dir' => $dir]);
            return;
        }
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS)
        );
        foreach ($iterator as $file) {
            if (!$file->isFile()) {
                continue;
            }
            $path = $file->getPathname();
            if (strtolower(pathinfo($path, PATHINFO_EXTENSION)) !== 'aiml') {
                continue;
            }
            $this->loadAimlFile($path);
        }
    }

    private function loadAimlFile(string $path): void
    {
        $doc = $this->loadXmlDocument($path);
        if (!$doc) {
            $this->logDebug('aiml_file_load_failed', ['file' => $path]);
            return;
        }
        $this->loadedFiles++;
        $categories = $doc->getElementsByTagName('category');
        foreach ($categories as $categoryNode) {
            if (!$categoryNode instanceof DOMElement) {
                continue;
            }
            $patternNode = $categoryNode->getElementsByTagName('pattern')->item(0);
            $templateNode = $categoryNode->getElementsByTagName('template')->item(0);
            if (!$patternNode || !$templateNode) {
                continue;
            }

            $pattern = $this->normalizePatternString($patternNode->textContent);
            $templateXml = $this->getInnerXml($templateNode);

            $thatNode = $categoryNode->getElementsByTagName('that')->item(0);
            $that = $thatNode ? $this->normalizePatternString($thatNode->textContent) : '*';

            $topic = $this->getTopicFromCategory($categoryNode);

            $tokens = array_merge(
                $this->tokenizePattern($pattern),
                ['<THAT>'],
                $this->tokenizePattern($that !== '' ? $that : '*'),
                ['<TOPIC>'],
                $this->tokenizePattern($topic !== '' ? $topic : '*')
            );

            $this->root->add($tokens, $templateXml);
            $this->loadedCategories++;
        }
    }

    private function getTopicFromCategory(DOMElement $categoryNode): string
    {
        $node = $categoryNode->parentNode;
        while ($node) {
            if ($node instanceof DOMElement && strtolower($node->tagName) === 'topic') {
                $name = $node->getAttribute('name');
                $name = $this->normalizePatternString($name);
                return $name !== '' ? $name : '*';
            }
            $node = $node->parentNode;
        }
        return '*';
    }
    private function loadConfDir(string $dir): void
    {
        $botsPath = rtrim($dir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'bots.xml';
        if (is_file($botsPath)) {
            $this->loadBotsFile($botsPath, $dir);
        } else {
            $this->loadPropertiesFile($dir . DIRECTORY_SEPARATOR . 'properties.xml');
            $this->loadPredicatesFile($dir . DIRECTORY_SEPARATOR . 'predicates.xml');
            $this->loadSubstitutionsFile($dir . DIRECTORY_SEPARATOR . 'substitutions.xml');
            $this->loadSentenceSplittersFile($dir . DIRECTORY_SEPARATOR . 'sentence-splitters.xml');
        }
    }

    private function loadBotsFile(string $path, string $confDir): void
    {
        $doc = new DOMDocument();
        if (!@$doc->load($path)) {
            return;
        }
        $bots = $doc->getElementsByTagName('bot');
        if ($bots->length === 0) {
            return;
        }
        $bot = $bots->item(0);
        if (!$bot) {
            return;
        }
        foreach ($bot->childNodes as $child) {
            if (!$child instanceof DOMElement) {
                continue;
            }
            $href = $child->getAttribute('href');
            if ($href === '') {
                continue;
            }
            $file = rtrim($confDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $href;
            switch (strtolower($child->tagName)) {
                case 'properties':
                    $this->loadPropertiesFile($file);
                    break;
                case 'predicates':
                    $this->loadPredicatesFile($file);
                    break;
                case 'substitutions':
                    $this->loadSubstitutionsFile($file);
                    break;
                case 'sentence-splitters':
                    $this->loadSentenceSplittersFile($file);
                    break;
            }
        }
    }

    private function loadPropertiesFile(string $path): void
    {
        $doc = $this->loadXmlDocument($path);
        if (!$doc) {
            return;
        }
        $props = $doc->getElementsByTagName('property');
        foreach ($props as $prop) {
            if (!$prop instanceof DOMElement) {
                continue;
            }
            $name = strtolower(trim($prop->getAttribute('name')));
            $value = (string)$prop->getAttribute('value');
            if ($name !== '') {
                $this->botProperties[$name] = $value;
            }
        }
    }

    private function loadPredicatesFile(string $path): void
    {
        $doc = $this->loadXmlDocument($path);
        if (!$doc) {
            return;
        }
        $preds = $doc->getElementsByTagName('predicate');
        foreach ($preds as $pred) {
            if (!$pred instanceof DOMElement) {
                continue;
            }
            $name = strtolower(trim($pred->getAttribute('name')));
            if ($name === '') {
                continue;
            }
            $default = (string)$pred->getAttribute('default');
            $setReturn = strtolower((string)$pred->getAttribute('set-return'));
            if ($setReturn !== 'name' && $setReturn !== 'value') {
                $setReturn = 'value';
            }
            $this->predicateDefs[$name] = [
                'default' => $default,
                'set_return' => $setReturn,
            ];
        }
    }

    private function loadSubstitutionsFile(string $path): void
    {
        $doc = $this->loadXmlDocument($path);
        if (!$doc) {
            return;
        }
        $this->inputSubstitutions = $this->loadSubstitutionGroup($doc, 'input');
        $this->genderSubstitutions = $this->loadSubstitutionGroup($doc, 'gender');
        $this->personSubstitutions = $this->loadSubstitutionGroup($doc, 'person');
        $this->person2Substitutions = $this->loadSubstitutionGroup($doc, 'person2');
    }

    /**
     * @return array<int, array{find:string,replace:string}>
     */
    private function loadSubstitutionGroup(DOMDocument $doc, string $group): array
    {
        $nodes = $doc->getElementsByTagName($group);
        if ($nodes->length === 0) {
            return [];
        }
        $node = $nodes->item(0);
        if (!$node) {
            return [];
        }
        $items = [];
        foreach ($node->getElementsByTagName('substitute') as $sub) {
            if (!$sub instanceof DOMElement) {
                continue;
            }
            $find = (string)$sub->getAttribute('find');
            $replace = (string)$sub->getAttribute('replace');
            if ($find !== '') {
                $items[] = ['find' => $find, 'replace' => $replace];
            }
        }
        return $items;
    }

    private function loadSentenceSplittersFile(string $path): void
    {
        $doc = $this->loadXmlDocument($path);
        if (!$doc) {
            return;
        }
        $this->sentenceSplitters = [];
        foreach ($doc->getElementsByTagName('splitter') as $splitter) {
            if (!$splitter instanceof DOMElement) {
                continue;
            }
            $value = (string)$splitter->getAttribute('value');
            if ($value !== '') {
                $this->sentenceSplitters[] = $value;
            }
        }
        if ($this->sentenceSplitters === []) {
            $this->sentenceSplitters = ['.', '!', '?', ';'];
        }
    }

    private function createDefaultSession(): AimlSession
    {
        $session = new AimlSession();
        foreach ($this->predicateDefs as $name => $def) {
            $session->predicates[$name] = $def['default'];
        }
        $session->that = '*';
        $session->topic = '*';
        $session->predicates['topic'] = '*';
        return $session;
    }

    private function tokenizePattern(string $pattern): array
    {
        $tokens = preg_split('/\s+/', trim($pattern));
        if ($tokens === false) {
            return [];
        }
        $out = [];
        foreach ($tokens as $token) {
            $token = $this->normalizePatternString($token);
            if ($token !== '') {
                $out[] = $token;
            }
        }
        return $out;
    }

    private function tokenizeWords(string $text): array
    {
        $tokens = preg_split('/\s+/', trim($text));
        if ($tokens === false) {
            return [];
        }
        $out = [];
        foreach ($tokens as $token) {
            $token = $this->normalizePatternString($token);
            if ($token !== '') {
                $out[] = $token;
            }
        }
        return $out;
    }

    private function normalizePatternString(string $text): string
    {
        $text = trim($text);
        if ($text === '') {
            return '';
        }
        return mb_strtoupper($text, 'UTF-8');
    }

    private function renderTemplate(string $templateXml, AimlSession $session, int $depth): string
    {
        if ($this->isTimedOut()) {
            return $this->fallback;
        }
        $doc = new DOMDocument('1.0', 'UTF-8');
        $wrapped = '<template>' . $templateXml . '</template>';
        if (!@$doc->loadXML($wrapped)) {
            $out = strip_tags($templateXml);
            return trim(preg_replace('/\s+/', ' ', $out));
        }
        $out = $this->renderNode($doc->documentElement, $session, $depth);
        return trim(preg_replace('/\s+/', ' ', $out));
    }

    private function renderNode(DOMNode $node, AimlSession $session, int $depth): string
    {
        if ($this->isTimedOut()) {
            return '';
        }
        if ($node instanceof DOMText) {
            return $node->wholeText;
        }
        if (!($node instanceof DOMElement)) {
            $out = '';
            foreach ($node->childNodes as $child) {
                $out .= $this->renderNode($child, $session, $depth);
            }
            return $out;
        }

        $tag = strtolower($node->tagName);
        switch ($tag) {
            case 'template':
                $out = '';
                foreach ($node->childNodes as $child) {
                    $out .= $this->renderNode($child, $session, $depth);
                }
                return $out;
            case 'star':
                return $this->getStarValue($session->star, $node->getAttribute('index'));
            case 'thatstar':
                return $this->getStarValue($session->thatStar, $node->getAttribute('index'));
            case 'topicstar':
                return $this->getStarValue($session->topicStar, $node->getAttribute('index'));
            case 'that':
                return $this->getPreviousBotResponseWithPunct($session, $node->getAttribute('index'));
            case 'input':
                return $this->getPreviousUserInput($session, $node->getAttribute('index'));
            case 'get':
                $name = strtolower($node->getAttribute('name'));
                if ($name === '') {
                    return '';
                }
                return $session->predicates[$name] ?? ($this->predicateDefs[$name]['default'] ?? '');
            case 'set':
                $name = strtolower($node->getAttribute('name'));
                if ($name === '') {
                    return '';
                }
                $value = '';
                foreach ($node->childNodes as $child) {
                    $value .= $this->renderNode($child, $session, $depth);
                }
                $value = trim($value);
                $session->predicates[$name] = $value;
                if ($name === 'topic') {
                    $session->topic = $value !== '' ? $value : '*';
                    $session->predicates['topic'] = $session->topic;
                }
                $mode = $this->predicateDefs[$name]['set_return'] ?? 'value';
                return $mode === 'name' ? $name : $value;
            case 'bot':
                $name = strtolower($node->getAttribute('name'));
                if ($name === '') {
                    return '';
                }
                return $this->botProperties[$name] ?? '';
            case 'think':
                foreach ($node->childNodes as $child) {
                    $this->renderNode($child, $session, $depth);
                }
                return '';
            case 'random':
                $lis = [];
                foreach ($node->childNodes as $child) {
                    if ($child instanceof DOMElement && strtolower($child->tagName) === 'li') {
                        $lis[] = $child;
                    }
                }
                if ($lis === []) {
                    return '';
                }
                $picked = $lis[array_rand($lis)];
                return $this->renderNode($picked, $session, $depth);
            case 'condition':
                return $this->renderCondition($node, $session, $depth);
            case 'srai':
                if ($depth >= $this->maxRecursion) {
                    return '';
                }
                $inner = '';
                foreach ($node->childNodes as $child) {
                    $inner .= $this->renderNode($child, $session, $depth);
                }
                $inner = trim($inner);
                if ($inner === '') {
                    return '';
                }
                return $this->respondSrai($inner, $session, $depth + 1);
            case 'sr':
                if ($depth >= $this->maxRecursion) {
                    return '';
                }
                $star = $this->getStarValue($session->star, '1');
                return $this->respondSrai($star, $session, $depth + 1);
            case 'topic':
                $value = '';
                foreach ($node->childNodes as $child) {
                    $value .= $this->renderNode($child, $session, $depth);
                }
                $value = $this->normalizePatternString($value);
                $session->topic = $value !== '' ? $value : '*';
                $session->predicates['topic'] = $session->topic;
                return '';
            case 'li':
                $out = '';
                foreach ($node->childNodes as $child) {
                    $out .= $this->renderNode($child, $session, $depth);
                }
                return $out;
            case 'learn':
                $path = '';
                foreach ($node->childNodes as $child) {
                    $path .= $this->renderNode($child, $session, $depth);
                }
                $path = trim($path);
                if ($path === '') {
                    return '';
                }
                $this->learnFromPath($path);
                return '';
            case 'person':
                $text = $this->renderNodeListOrStar($node, $session, $depth);
                return $this->applySubstitutionGroup($text, $this->personSubstitutions);
            case 'person2':
                $text = $this->renderNodeListOrStar($node, $session, $depth);
                return $this->applySubstitutionGroup($text, $this->person2Substitutions);
            case 'gender':
                $text = $this->renderNodeListOrStar($node, $session, $depth);
                return $this->applySubstitutionGroup($text, $this->genderSubstitutions);
        }

        $out = '';
        foreach ($node->childNodes as $child) {
            $out .= $this->renderNode($child, $session, $depth);
        }
        return $out;
    }
    private function renderCondition(DOMElement $node, AimlSession $session, int $depth): string
    {
        if ($this->isTimedOut()) {
            return '';
        }
        $name = strtolower($node->getAttribute('name'));
        $value = $node->getAttribute('value');
        if ($name !== '' && $value !== '') {
            $current = $session->predicates[$name] ?? ($this->predicateDefs[$name]['default'] ?? '');
            if ($this->normalizePatternString($current) === $this->normalizePatternString($value)) {
                $out = '';
                foreach ($node->childNodes as $child) {
                    $out .= $this->renderNode($child, $session, $depth);
                }
                return $out;
            }
            return '';
        }

        $lis = [];
        foreach ($node->childNodes as $child) {
            if ($child instanceof DOMElement && strtolower($child->tagName) === 'li') {
                $lis[] = $child;
            }
        }
        if ($lis === []) {
            return '';
        }
        $default = null;
        foreach ($lis as $li) {
            $liName = strtolower($li->getAttribute('name'));
            $liValue = $li->getAttribute('value');
            if ($liName === '' && $liValue === '') {
                $default = $li;
                continue;
            }
            $targetName = $liName !== '' ? $liName : $name;
            if ($targetName === '') {
                continue;
            }
            $current = $session->predicates[$targetName] ?? ($this->predicateDefs[$targetName]['default'] ?? '');
            if ($liValue === '' || $this->normalizePatternString($current) === $this->normalizePatternString($liValue)) {
                return $this->renderNode($li, $session, $depth);
            }
        }
        if ($default) {
            return $this->renderNode($default, $session, $depth);
        }
        return '';
    }

    private function getStarValue(array $stars, string $indexAttr): string
    {
        $idx = 1;
        if ($indexAttr !== '') {
            $idx = (int)$indexAttr;
        }
        if ($idx <= 0 || $idx > count($stars)) {
            return '';
        }
        return $stars[count($stars) - $idx] ?? '';
    }

    private function getPreviousUserInput(AimlSession $session, string $indexAttr): string
    {
        [$respIndex, $sentenceIndex] = $this->parseIndexAttr($indexAttr);
        $respIndex = max(1, $respIndex);
        $sentenceIndex = max(1, $sentenceIndex);
        $input = $session->previousUserInputs[$respIndex - 1] ?? '';
        if ($input === '') {
            return '';
        }
        $sentences = $this->splitSentences($this->applyInputSubstitutions($input));
        return $sentences[$sentenceIndex - 1] ?? '';
    }

    private function getPreviousBotResponseWithPunct(AimlSession $session, string $indexAttr): string
    {
        [$respIndex, $sentenceIndex] = $this->parseIndexAttr($indexAttr);
        $respIndex = max(1, $respIndex);
        $sentenceIndex = max(1, $sentenceIndex);
        $responses = $session->previousBotResponsesWithPunct[$respIndex - 1] ?? [];
        return $responses[$sentenceIndex - 1] ?? '';
    }

    private function parseIndexAttr(string $indexAttr): array
    {
        if ($indexAttr === '') {
            return [1, 1];
        }
        $parts = array_map('trim', explode(',', $indexAttr));
        $a = isset($parts[0]) && $parts[0] !== '' ? (int)$parts[0] : 1;
        $b = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : 1;
        return [$a, $b];
    }

    private function respondSrai(string $input, AimlSession $session, int $depth): string
    {
        foreach ($this->previousSrai as $seen) {
            if ($seen === $input) {
                $this->logDebug('srai_loop', ['input' => $input, 'depth' => $depth]);
                return $this->fallback;
            }
        }
        $this->previousSrai[] = $input;

        $star = $session->star;
        $thatStar = $session->thatStar;
        $topicStar = $session->topicStar;

        $response = $this->respondInternal($input, $session, false, $depth);

        $session->star = $star;
        $session->thatStar = $thatStar;
        $session->topicStar = $topicStar;

        return $response;
    }

    private function splitSentences(string $text): array
    {
        if ($text === '') {
            return [];
        }
        $splitters = array_map(fn($s) => preg_quote($s, '/'), $this->sentenceSplitters);
        $regex = '/(?:' . implode('|', $splitters) . ')+/u';
        $parts = preg_split($regex, $text);
        if ($parts === false) {
            return [$text];
        }
        $out = [];
        foreach ($parts as $p) {
            $p = trim($p);
            if ($p !== '') {
                $out[] = $p;
            }
        }
        return $out;
    }

    private function splitResponseWithPunct(string $text): array
    {
        $sentences = [];
        $sentencesWithPunct = [];
        if ($text === '') {
            return [$sentences, $sentencesWithPunct];
        }
        $splitters = array_map(fn($s) => preg_quote($s, '/'), $this->sentenceSplitters);
        $regex = '/(' . implode('|', $splitters) . ')/u';
        $parts = preg_split($regex, $text, -1, PREG_SPLIT_DELIM_CAPTURE);
        if ($parts === false) {
            return [[$text], [$text]];
        }
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }
            $isSplitter = false;
            foreach ($this->sentenceSplitters as $s) {
                if ($part === $s) {
                    $isSplitter = true;
                    break;
                }
            }
            if ($isSplitter) {
                if ($sentencesWithPunct !== []) {
                    $sentencesWithPunct[0] .= $part;
                }
                continue;
            }
            $chunk = trim($part);
            if ($chunk === '') {
                continue;
            }
            array_unshift($sentences, $chunk);
            array_unshift($sentencesWithPunct, $chunk);
        }
        return [$sentences, $sentencesWithPunct];
    }

    private function removePunctuation(string $text): string
    {
        $out = $text;
        foreach ($this->sentenceSplitters as $splitter) {
            $out = str_replace($splitter, '', $out);
        }
        $out = str_replace(',', '', $out);
        return trim($out);
    }

    private function getInnerXml(DOMNode $node): string
    {
        $xml = '';
        foreach ($node->childNodes as $child) {
            $xml .= $node->ownerDocument->saveXML($child);
        }
        return $xml;
    }

    private function applyInputSubstitutions(string $text): string
    {
        $out = $text;
        foreach ($this->inputSubstitutions as $sub) {
            $find = $sub['find'];
            $replace = $sub['replace'];
            $pattern = $this->makeRegexPattern($find);
            $out = preg_replace($pattern, $replace, $out) ?? $out;
        }
        return $out;
    }

    private function applySubstitutionGroup(string $text, array $subs): string
    {
        $out = $text;
        foreach ($subs as $sub) {
            $find = $sub['find'];
            $replace = $sub['replace'];
            $pattern = $this->makeRegexPattern($find);
            $out = preg_replace($pattern, $replace, $out) ?? $out;
        }
        return $out;
    }

    private function makeRegexPattern(string $find): string
    {
        $safe = str_replace('~', '\\~', $find);
        return '~' . $safe . '~i';
    }
    private function renderNodeListOrStar(DOMElement $node, AimlSession $session, int $depth): string
    {
        if ($node->childNodes->length === 0) {
            return $this->getStarValue($session->star, '1');
        }
        $out = '';
        foreach ($node->childNodes as $child) {
            $out .= $this->renderNode($child, $session, $depth);
        }
        return $out;
    }

    private function learnFromPath(string $path): void
    {
        $resolved = $path;
        if (!preg_match('/^[a-zA-Z]:[\\\\\/]/', $path) && !str_starts_with($path, '/')) {
            $resolved = rtrim($this->learnBaseDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $path;
        }
        $matches = glob($resolved, GLOB_BRACE);
        if ($matches === false || $matches === []) {
            if (is_file($resolved)) {
                $this->loadAimlFile($resolved);
            } elseif (is_dir($resolved)) {
                $this->loadAimlDir($resolved);
            }
            return;
        }
        foreach ($matches as $m) {
            if (is_file($m)) {
                $this->loadAimlFile($m);
            } elseif (is_dir($m)) {
                $this->loadAimlDir($m);
            }
        }
    }

    private function loadXmlDocument(string $path): ?DOMDocument
    {
        $doc = new DOMDocument();
        $doc->preserveWhiteSpace = false;
        $doc->formatOutput = false;
        if (@$doc->load($path)) {
            return $doc;
        }
        $raw = @file_get_contents($path);
        if ($raw === false) {
            return null;
        }
        $converted = mb_convert_encoding($raw, 'UTF-8', 'Windows-1252');
        if (@$doc->loadXML($converted)) {
            return $doc;
        }
        $converted = mb_convert_encoding($raw, 'UTF-8', 'ISO-8859-1');
        if (@$doc->loadXML($converted)) {
            return $doc;
        }
        return null;
    }

    private function isTimedOut(): bool
    {
        return $this->deadline > 0 && microtime(true) > $this->deadline;
    }

    private function logDebug(string $event, array $data = []): void
    {
        if (!$this->debugEnabled || !$this->debugLog) {
            return;
        }
        $line = date('Y-m-d H:i:s') . ' | ' . $event;
        if ($data !== []) {
            $line .= ' | ' . json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
        @file_put_contents($this->debugLog, $line . PHP_EOL, FILE_APPEND);
    }
}
