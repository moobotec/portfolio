<?php
declare(strict_types=1);

/**
 * activities.php
 * Lit un export Garmin Activities.csv et renvoie un JSON compatible cal-heatmap:
 *   [{ "date": "YYYY-MM-DD", "value": 3 }, ...]
 *
 * Paramètres:
 *   metric=count|distance|duration|tss   (défaut: count)
 *   onlyRunning=1|0                     (défaut: 1)
 *
 * Cache:
 *   écrit cache/activity.<metric>.<onlyRunning>.json
 *   régénère si le CSV a changé (filemtime)
 */

header('Content-Type: application/json; charset=utf-8');

// =====================
// CONFIG
// =====================
$csvPath  = __DIR__ . '/api/activities.csv';      // <-- adapte si besoin
$cacheDir = __DIR__ . '/cache';
$metric   = $_GET['metric'] ?? 'count';
$onlyRunning = (($_GET['onlyRunning'] ?? '1') !== '0');

$metric = in_array($metric, ['count','distance','duration','tss'], true) ? $metric : 'count';

if (!is_file($csvPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'CSV introuvable', 'path' => $csvPath], JSON_UNESCAPED_UNICODE);
    exit;
}

// =====================
// CACHE
// =====================
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0775, true);
}
$cacheFile = $cacheDir . '/activity.' . $metric . '.' . ($onlyRunning ? 'run' : 'all') . '.json';
$metaFile  = $cacheFile . '.meta.json';

$csvMtime = filemtime($csvPath) ?: 0;

if (is_file($cacheFile) && is_file($metaFile)) {
    $meta = json_decode((string)file_get_contents($metaFile), true);
    if (is_array($meta) && ($meta['csv_mtime'] ?? 0) === $csvMtime) {
        // cache OK
        readfile($cacheFile);
        exit;
    }
}

// =====================
// HELPERS
// =====================
function normalizeHeader(string $h): string {
    $h = trim(mb_strtolower($h));
    $h = str_replace(['é','è','ê','ë'], 'e', $h);
    $h = str_replace(['à','â'], 'a', $h);
    $h = str_replace(['î','ï'], 'i', $h);
    $h = str_replace(['ô'], 'o', $h);
    $h = str_replace(['ù','û','ü'], 'u', $h);
    $h = preg_replace('~[^a-z0-9]+~', '_', $h);
    return trim($h, '_');
}

function findColumnIndex(array $headersNorm, array $candidates): ?int {
    foreach ($candidates as $cand) {
        $candN = normalizeHeader($cand);
        foreach ($headersNorm as $i => $h) {
            if ($h === $candN) return $i;
        }
    }
    // fallback "contient"
    foreach ($candidates as $cand) {
        $candN = normalizeHeader($cand);
        foreach ($headersNorm as $i => $h) {
            if (str_contains($h, $candN)) return $i;
        }
    }
    return null;
}

function detectDelimiter(string $line): string {
    $delims = [',', ';', "\t"];
    $best = ',';
    $bestCount = -1;
    foreach ($delims as $d) {
        $c = substr_count($line, $d);
        if ($c > $bestCount) { $bestCount = $c; $best = $d; }
    }
    return $best;
}

function parseDateToYmd(string $s): ?string {
    $s = trim($s);
    if ($s === '') return null;

    // ISO direct
    if (preg_match('~^\d{4}-\d{2}-\d{2}~', $s)) {
        return substr($s, 0, 10);
    }

    $formats = [
        'd/m/Y', 'd/m/Y H:i', 'd/m/Y H:i:s',
        'Y/m/d', 'Y/m/d H:i', 'Y/m/d H:i:s',
        'm/d/Y', 'm/d/Y H:i', 'm/d/Y H:i:s',
        'd-m-Y', 'd-m-Y H:i', 'd-m-Y H:i:s',
        'Y-m-d', 'Y-m-d H:i', 'Y-m-d H:i:s',
    ];

    foreach ($formats as $fmt) {
        $dt = DateTime::createFromFormat($fmt, $s);
        if ($dt instanceof DateTime) return $dt->format('Y-m-d');
    }

    $ts = strtotime($s);
    if ($ts !== false) return date('Y-m-d', $ts);

    return null;
}

function parseNumber(string $s): ?float {
    $s = trim($s);
    if ($s === '') return null;
    $s = str_replace(["\u{00A0}", ' '], '', $s); // espaces
    $s = str_replace(',', '.', $s);              // virgule décimale
    $s = preg_replace('~[^0-9\.\-]+~', '', $s);  // unités
    if ($s === '' || $s === '.' || $s === '-') return null;
    return (float)$s;
}

function parseDurationToMinutes(string $s): ?float {
    $s = trim($s);
    if ($s === '') return null;

    if (preg_match('~^(\d+):(\d{2}):(\d{2})$~', $s, $m)) {
        $h = (int)$m[1]; $min = (int)$m[2]; $sec = (int)$m[3];
        return $h * 60 + $min + ($sec / 60);
    }
    if (preg_match('~^(\d+):(\d{2})$~', $s, $m)) {
        $min = (int)$m[1]; $sec = (int)$m[2];
        return $min + ($sec / 60);
    }

    // fallback nombre (secondes/minutes)
    $n = parseNumber($s);
    if ($n === null) return null;
    return ($n > 1000) ? ($n / 60.0) : $n;
}

function isRunningType(string $typeRaw): bool {
    $t = mb_strtolower(trim($typeRaw));

    // Garmin FR : "Trail", "Course à pied", "Course à pied sur tapis roulant"
    // Garmin EN : "Trail Running", "Running", "Treadmill Running"
    $keywords = [
        'trail',
        'course',
        'running',
        'tapis',      // tapis roulant
        'treadmill',
        'footing',    // parfois
        'run',        // "run" EN
    ];

    foreach ($keywords as $kw) {
        if (str_contains($t, $kw)) return true;
    }
    return false;
}

// =====================
// READ CSV
// =====================
$fh = fopen($csvPath, 'rb');
if ($fh === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d’ouvrir le CSV'], JSON_UNESCAPED_UNICODE);
    exit;
}

$firstLine = fgets($fh);
if ($firstLine === false) {
    fclose($fh);
    echo json_encode([]);
    exit;
}
$delimiter = detectDelimiter($firstLine);
rewind($fh);

// Headers
$rawHeaders = fgetcsv($fh, 0, $delimiter, '"', '\\');
if (!is_array($rawHeaders)) {
    fclose($fh);
    echo json_encode([]);
    exit;
}

$headersNorm = array_map(fn($h) => normalizeHeader((string)$h), $rawHeaders);

// Indices colonnes (FR + EN)
$idxDate = findColumnIndex($headersNorm, ['Date', 'Activity Date', 'Start Time', 'Date/Heure']);
$idxType = findColumnIndex($headersNorm, ["Type d'activité", 'Activity Type', 'Type', 'Sport']);
$idxDist = findColumnIndex($headersNorm, ['Distance', 'Distance (km)', 'Distance (mi)']);
$idxDur  = findColumnIndex($headersNorm, ['Durée', 'Duree', 'Duration', 'Time', 'Temps écoulé', 'Elapsed Time']);
$idxTss  = findColumnIndex($headersNorm, ['Training Stress Score® (TSS®)', 'TSS', 'Training Stress Score']);

// Agrégation par jour
$byDay = []; // 'YYYY-MM-DD' => float

while (($row = fgetcsv($fh, 0, $delimiter, '"', '\\')) !== false) {
    if (!is_array($row) || count($row) < 2) continue;

    // Date
    if ($idxDate === null || !isset($row[$idxDate])) continue;
    $ymd = parseDateToYmd((string)$row[$idxDate]);
    if ($ymd === null) continue;

    // Filtre running/trail/tapis
    if ($onlyRunning && $idxType !== null) {
        $typeRaw = (string)($row[$idxType] ?? '');
        if (!isRunningType($typeRaw)) continue;
    }

    // Value selon metric
    $v = null;

    if ($metric === 'distance') {
        if ($idxDist !== null) $v = parseNumber((string)($row[$idxDist] ?? ''));
    } elseif ($metric === 'duration') {
        if ($idxDur !== null) $v = parseDurationToMinutes((string)($row[$idxDur] ?? ''));
    } elseif ($metric === 'tss') {
        if ($idxTss !== null) $v = parseNumber((string)($row[$idxTss] ?? ''));
    } else { // count
        $v = 1.0;
    }

    if ($v === null) continue;

    if (!isset($byDay[$ymd])) $byDay[$ymd] = 0.0;
    $byDay[$ymd] += (float)$v;
}

fclose($fh);

ksort($byDay);

// JSON cal-heatmap
$out = [];
foreach ($byDay as $date => $value) {
    $out[] = [
        'date'  => $date,
        'value' => ($metric === 'count') ? (int)round($value) : round($value, 2),
    ];
}

// Ecriture cache
file_put_contents($cacheFile, json_encode($out, JSON_UNESCAPED_UNICODE));
file_put_contents($metaFile, json_encode([
    'csv_mtime' => $csvMtime,
    'delimiter' => $delimiter,
    'metric' => $metric,
    'onlyRunning' => $onlyRunning,
    'generated_at' => date('c'),
], JSON_UNESCAPED_UNICODE));

echo json_encode($out, JSON_UNESCAPED_UNICODE);
