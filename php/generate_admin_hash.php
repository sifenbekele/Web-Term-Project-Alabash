<?php
// Restrict to CLI or localhost only and do not disclose plaintext password
if (php_sapi_name() !== 'cli' && !in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1','::1'])) {
    http_response_code(403);
    echo 'Forbidden';
    exit;
}

$password = $_GET['password'] ?? '';
if ($password === '') {
    echo "Provide ?password=YOUR_PASSWORD to generate hash";
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
echo $hash;
?> 