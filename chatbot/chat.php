<?php
declare(strict_types=1);
ini_set('memory_limit', '512M');
ini_set('max_execution_time', '120');
set_time_limit(120);

require __DIR__ . '/aiml_engine.php';
$config = require __DIR__ . '/config.php';

session_start();

$origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
if ($origin !== '') {
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = (string)($_SERVER['HTTP_HOST'] ?? '');
    $allowedOrigin = $scheme . '://' . $host;
    if (strcasecmp($origin, $allowedOrigin) !== 0) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Origin non autorisée.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    header('Access-Control-Allow-Origin: ' . $allowedOrigin);
    header('Vary: Origin');
}

header('X-Content-Type-Options: nosniff');

if (!isset($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && (string)($_GET['action'] ?? '') === 'token') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['token' => $_SESSION['csrf_token']], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Méthode non autorisée.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$defaultLang = strtolower((string)($config['default_lang'] ?? 'fr'));
$lang = strtolower(trim((string)($_POST['lang'] ?? $_GET['lang'] ?? $defaultLang)));
$dirsByLang = $config['aiml_dirs_by_lang'] ?? [];
if (!is_array($dirsByLang) || !array_key_exists($lang, $dirsByLang)) {
    $lang = $defaultLang;
}

$config['aiml_dirs'] = $config['aiml_dirs_by_lang'][$lang] ?? [];
$fallbackByLang = $config['fallback_by_lang'] ?? [];
$config['fallback'] = $fallbackByLang[$lang] ?? ($config['fallback'] ?? "Je n'ai pas compris.");

$reset = (string)($_POST['reset'] ?? '');
$csrf = (string)($_POST['csrf'] ?? '');
if (!hash_equals($_SESSION['csrf_token'], $csrf)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'CSRF invalide.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($reset === '1' || strtolower($reset) === 'true') {
    $sessionKey = 'aiml_session_' . $lang;
    unset($_SESSION[$sessionKey]);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 10240) {
    http_response_code(413);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Payload trop volumineux.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateDir = (string)($config['rate_limit_dir'] ?? __DIR__ . '/../cache/ratelimit');
$rateLimit = (int)($config['rate_limit_max'] ?? 30);
$rateWindow = (int)($config['rate_limit_window_sec'] ?? 60);
if (!is_dir($rateDir)) {
    @mkdir($rateDir, 0777, true);
}
$rateFile = rtrim($rateDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . preg_replace('/[^a-zA-Z0-9_.-]/', '_', $ip) . '.json';
$now = time();
$timestamps = [];
if (is_file($rateFile)) {
    $raw = @file_get_contents($rateFile);
    if ($raw !== false) {
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            $timestamps = $decoded;
        }
    }
}
$timestamps = array_values(array_filter($timestamps, fn($t) => is_int($t) && ($now - $t) <= $rateWindow));
if (count($timestamps) >= $rateLimit) {
    http_response_code(429);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Trop de requêtes.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$timestamps[] = $now;
@file_put_contents($rateFile, json_encode($timestamps), LOCK_EX);

$engine = null;
$cacheFile = null;
$cacheEnabled = (bool)($config['cache_enabled'] ?? false);
$debugEnabled = (bool)($config['debug_enabled'] ?? false);
$debugLog = isset($config['debug_log']) ? (string)$config['debug_log'] : null;
if ($debugEnabled && $debugLog) {
    @file_put_contents($debugLog, date('Y-m-d H:i:s') . ' | request | ' . json_encode([
        'lang' => $lang,
        'cache' => $cacheEnabled,
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND);
}
if ($cacheEnabled) {
    $cacheDir = (string)($config['cache_dir'] ?? __DIR__ . '/../cache');
    $cacheTtl = (int)($config['cache_ttl_sec'] ?? 3600);
    $cacheVersion = (string)($config['cache_version'] ?? '1');
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0777, true);
    }
    $cacheFile = rtrim($cacheDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'aiml_engine_' . $lang . '_v' . $cacheVersion . '.ser';
    if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtl) {
        $cached = @file_get_contents($cacheFile);
        if ($cached !== false) {
            $obj = @unserialize($cached, ['allowed_classes' => [AimlEngine::class, AimlNode::class]]);
            if ($obj instanceof AimlEngine) {
                $engine = $obj;
            }
        }
    }
}

$sessionKey = 'aiml_session_' . $lang;
if (!isset($_SESSION[$sessionKey])) {
    $_SESSION[$sessionKey] = serialize(new AimlSession());
}

$session = @unserialize($_SESSION[$sessionKey], ['allowed_classes' => [AimlSession::class]]);
if (!$session instanceof AimlSession) {
    $session = new AimlSession();
}

if (!$engine instanceof AimlEngine) {
    $engine = new AimlEngine($config);
    if ($cacheEnabled && $cacheFile) {
        @file_put_contents($cacheFile, serialize($engine), LOCK_EX);
    }
}

$input = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = (string)($_POST['message'] ?? '');
} else {
    $input = (string)($_GET['message'] ?? '');
}

$input = trim($input);
if ($input === '') {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'Message vide.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$reply = $engine->respond($input, $session);
$_SESSION[$sessionKey] = serialize($session);

header('Content-Type: application/json; charset=utf-8');
echo json_encode(['reply' => $reply], JSON_UNESCAPED_UNICODE);
