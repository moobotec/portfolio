<?php
/**
 * track.php
 * Tracking minimaliste (portfolio) – RGPD friendly
 * - pageview / click / view_section
 * - IP anonymisée
 * - pays uniquement (approx.)
 * - sans cookie / sans ID utilisateur
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

/* =========================
   Fonctions utilitaires
   ========================= */

function ip_anonymize(string $ip): string {
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $p = explode('.', $ip);
        $p[3] = '0';
        return implode('.', $p);
    }
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $parts = explode(':', $ip);
        for ($i = 3; $i < count($parts); $i++) {
            $parts[$i] = '0000';
        }
        return implode(':', $parts);
    }
    return '0.0.0.0';
}

function get_client_ip(): string {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '';
}

function get_country_from_ip(string $ip): ?string {
    if (!$ip) return null;

    // API simple, gratuite, suffisante pour un portfolio
    $url = "http://ip-api.com/json/{$ip}?fields=status,countryCode";
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 1,
            'header'  => "User-Agent: PortfolioTracker/1.0\r\n"
        ]
    ]);

    $json = @file_get_contents($url, false, $ctx);
    if (!$json) return null;

    $data = json_decode($json, true);
    if (($data['status'] ?? '') !== 'success') return null;

    return $data['countryCode'] ?? null;
}

/* =========================
   Lecture payload
   ========================= */

$payload = json_decode(file_get_contents('php://input') ?: '[]', true) ?: [];

$event   = substr((string)($payload['event']   ?? 'pageview'), 0, 40);
$page    = substr((string)($payload['page']    ?? ''), 0, 300);
$href    = substr((string)($payload['href']    ?? ''), 0, 400);
$label   = substr((string)($payload['label']   ?? ''), 0, 120);
$section = substr((string)($payload['section'] ?? ''), 0, 80);
$ref     = substr((string)($payload['ref']     ?? ''), 0, 300);
$clientTs = substr((string)($payload['client_ts'] ?? ''), 0, 40);
$clientTz = substr((string)($payload['client_tz'] ?? ''), 0, 80);
$clientHour = isset($payload['client_hour']) ? (int)$payload['client_hour'] : null;

/* =========================
   Infos serveur
   ========================= */

$ua    = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300);
$lang  = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '', 0, 80);

$rawIp   = get_client_ip();
$ipAnon  = ip_anonymize($rawIp);
$country = get_country_from_ip($rawIp);

$ts = date('c');

$source = substr((string)($payload['source'] ?? ''), 0, 30);

/* =========================
   Log entry
   ========================= */

$entry = [
    'ts'       => $ts,
    'event'    => $event,
    'page'     => $page ?: null,
    'section'  => $section ?: null,
    'href'     => $href ?: null,
    'source' => $source ?: null,
    'label'    => $label ?: null,
    'ref'      => $ref ?: null,
    'client_ts' => $clientTs ?: null,
    'client_tz' => $clientTz ?: null,
    'client_hour' => ($clientHour !== null && $clientHour >= 0 && $clientHour <= 23) ? $clientHour : null,
    'country'  => $country,
    'ip'       => $ipAnon,
    'lang'     => $lang ?: null,
    'ua'       => $ua ?: null
];

/* =========================
   Écriture fichier
   ========================= */

$dir = __DIR__ . '/logs';
if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
}

// Log par jour (YYYY-MM-DD)
$file = $dir . '/visits-' . date('Y-m-d') . '.log';

file_put_contents(
    $file,
    json_encode($entry, JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

/* =========================
   Réponse
   ========================= */

echo json_encode(['ok' => true], JSON_UNESCAPED_SLASHES);
