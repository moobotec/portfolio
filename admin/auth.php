<?php

function admin_auth_is_bypassed(): bool
{
    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    if (!is_string($host) || $host === '') {
        return false;
    }

    $host = strtolower(preg_replace('/:\d+$/', '', $host) ?? $host);

    return in_array($host, ['localhost', '127.0.0.1', '::1'], true);
}

function admin_auth_config(): array
{
    $defaultHtpasswd = '/home/ouulssh-timecaps/daumand/admin/.htpasswd';

    return [
        'realm' => (string)(getenv('ADMIN_AUTH_REALM') ?: 'Admin Area'),
        'htpasswd' => (string)(getenv('ADMIN_HTPASSWD_FILE') ?: $defaultHtpasswd),
    ];
}

function admin_send_auth_challenge(string $realm): never
{
    header('WWW-Authenticate: Basic realm="' . addslashes($realm) . '"');
    header('HTTP/1.1 401 Unauthorized');
    header('Content-Type: text/plain; charset=utf-8');
    echo 'Authentication required.';
    exit;
}

function admin_send_auth_error(string $message): never
{
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    echo $message;
    exit;
}

function admin_parse_basic_auth(): void
{
    if (!empty($_SERVER['PHP_AUTH_USER']) || !empty($_SERVER['PHP_AUTH_PW'])) {
        return;
    }

    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!is_string($header) || stripos($header, 'Basic ') !== 0) {
        return;
    }

    $decoded = base64_decode(substr($header, 6), true);
    if (!is_string($decoded) || !str_contains($decoded, ':')) {
        return;
    }

    [$user, $password] = explode(':', $decoded, 2);
    $_SERVER['PHP_AUTH_USER'] = $user;
    $_SERVER['PHP_AUTH_PW'] = $password;
}

function admin_verify_htpasswd_password(string $password, string $hash): bool
{
    if ($hash === '') {
        return false;
    }

    if (preg_match('/^\$(2y|2a|2b|argon2i|argon2id)\$/', $hash) === 1) {
        return password_verify($password, $hash);
    }

    return hash_equals($hash, crypt($password, $hash));
}

function admin_require_basic_auth(): void
{
    if (admin_auth_is_bypassed()) {
        return;
    }

    if (!empty($_SERVER['REMOTE_USER'])) {
        return;
    }

    admin_parse_basic_auth();

    $config = admin_auth_config();
    $user = $_SERVER['PHP_AUTH_USER'] ?? '';
    $password = $_SERVER['PHP_AUTH_PW'] ?? '';

    if (!is_string($user) || !is_string($password) || $user === '') {
        admin_send_auth_challenge($config['realm']);
    }

    $htpasswd = $config['htpasswd'];
    if (!is_file($htpasswd) || !is_readable($htpasswd)) {
        admin_send_auth_error('Admin auth is enabled but the htpasswd file is missing or unreadable.');
    }

    $lines = file($htpasswd, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        admin_send_auth_error('Unable to read the htpasswd file.');
    }

    foreach ($lines as $line) {
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, ':')) {
            continue;
        }

        [$expectedUser, $expectedHash] = explode(':', $line, 2);
        if (!hash_equals($expectedUser, $user)) {
            continue;
        }

        if (admin_verify_htpasswd_password($password, trim($expectedHash))) {
            $_SERVER['REMOTE_USER'] = $user;
            return;
        }

        break;
    }

    admin_send_auth_challenge($config['realm']);
}
