<?php
declare(strict_types=1);

error_reporting(E_ERROR | E_PARSE);

$baseUrl = 'http://localhost:3000/chatbot/chat.php';
$cookieJar = __DIR__ . '/.chatbot_test_cookies.txt';
$cookieHeader = '';

function out(string $name, bool $ok, string $details): void {
    $status = $ok ? 'OK' : 'FAIL';
    echo "[$status] $name - $details\n";
}

function req(string $method, string $url, array $headers = [], array $body = []): array {
    global $cookieJar, $cookieHeader;
    $ch = curl_init();
    $respHeaders = [];
    $opts = [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HEADER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_COOKIEJAR => $cookieJar,
        CURLOPT_COOKIEFILE => $cookieJar,
        CURLOPT_USERAGENT => 'chatbot-security-test',
        CURLOPT_TIMEOUT => 10,
    ];
    if ($cookieHeader !== '') {
        $headers['Cookie'] = $cookieHeader;
    }
    if ($headers) {
        $hdrs = [];
        foreach ($headers as $k => $v) {
            $hdrs[] = $k . ': ' . $v;
        }
        $opts[CURLOPT_HTTPHEADER] = $hdrs;
    }
    if ($method !== 'GET') {
        $opts[CURLOPT_POSTFIELDS] = http_build_query($body);
    }
    curl_setopt_array($ch, $opts);
    $resp = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $rawHeaders = $resp !== false ? substr($resp, 0, $headerSize) : '';
    $bodyText = $resp !== false ? substr($resp, $headerSize) : '';
    if ($rawHeaders !== '') {
        foreach (explode("\r\n", $rawHeaders) as $line) {
            if (stripos($line, 'Set-Cookie:') === 0) {
                $cookieHeader = trim(substr($line, strlen('Set-Cookie:')));
                $semi = strpos($cookieHeader, ';');
                if ($semi !== false) {
                    $cookieHeader = substr($cookieHeader, 0, $semi);
                }
                break;
            }
        }
    }
    return ['status' => $status, 'body' => $bodyText];
}

echo "Chatbot security tests against: $baseUrl\n";

// 1) Method not allowed
$r1 = req('GET', $baseUrl);
out('Method GET', $r1['status'] === 405, "status={$r1['status']} expected=405");

// 2) Get CSRF token
$t = req('GET', $baseUrl . '?action=token');
$token = '';
if ($t['status'] === 200) {
    $json = json_decode($t['body'], true);
    if (is_array($json) && isset($json['token'])) {
        $token = (string)$json['token'];
    }
}
out('CSRF token', $token !== '', 'token received');

// 2.5) Valid CSRF quick check
$r2 = req('POST', $baseUrl, ['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/index.html'], ['message' => 'ping', 'lang' => 'fr', 'csrf' => $token]);
out('CSRF valid', $r2['status'] === 200, "status={$r2['status']} expected=200 body={$r2['body']}");

// 3) Missing CSRF
$r3 = req('POST', $baseUrl, [], ['message' => 'test', 'lang' => 'fr']);
out('Missing CSRF', $r3['status'] === 403, "status={$r3['status']} expected=403");

// 4) Bad Origin
$r4 = req('POST', $baseUrl, ['Origin' => 'http://evil.local'], ['message' => 'test', 'lang' => 'fr', 'csrf' => $token]);
out('Bad Origin', $r4['status'] === 403, "status={$r4['status']} expected=403");

// 5) Payload too large
$big = str_repeat('A', 11000);
$r5 = req('POST', $baseUrl, ['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/index.html'], ['message' => $big, 'lang' => 'fr', 'csrf' => $token]);
out('Payload size', $r5['status'] === 413, "status={$r5['status']} expected=413 body={$r5['body']}");

// 6) Rate limit
$rateHit = false;
for ($i = 0; $i < 31; $i++) {
    $ri = req('POST', $baseUrl, ['Origin' => 'http://localhost:3000', 'Referer' => 'http://localhost:3000/index.html'], ['message' => 'ping', 'lang' => 'fr', 'csrf' => $token]);
    if ($ri['status'] === 429) {
        $rateHit = true;
        break;
    }
}
out('Rate limit', $rateHit, 'expected 429 after threshold');
