<?php
// Setup API — only accessible before setup is complete. No session required.
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

$db   = db();
$done = $db->query("SELECT value FROM app_settings WHERE key='setup_complete'")->fetchColumn();
if ($done === '1') {
    jsonOut(['error' => 'Setup already complete'], 403);
}

if (reqMethod() !== 'POST') { jsonOut(['error' => 'POST only'], 405); }

$body    = reqBody();
$pw      = trim($body['password'] ?? '');
$confirm = trim($body['confirm']  ?? '');

if ($pw === '')           { jsonOut(['error' => 'Password is required'], 400); }
if (strlen($pw) < 6)     { jsonOut(['error' => 'Password must be at least 6 characters'], 400); }
if ($pw !== $confirm)     { jsonOut(['error' => 'Passwords do not match'], 400); }

// Save password
$db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('auth_password_hash', ?)")
   ->execute([password_hash($pw, PASSWORD_BCRYPT)]);

// Save optional settings
$settings = $body['settings'] ?? [];
$allowed  = [
    'sys_timezone', 'sys_zipcode', 'sys_ntp',
    'calendar_ics_url', 'calendar_days',
    'smtp_host', 'smtp_port', 'smtp_user', 'smtp_from', 'smtp_tls',
    'chat_enabled', 'chat_llm_provider', 'chat_llm_url', 'chat_llm_model',
    'net_integration', 'net_host', 'net_user', 'net_site',
    'net_verify_ssl', 'net_unifi_os', 'net_auth_mode',
    'news_enabled', 'news_sources',
];
$ins = $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");
foreach ($settings as $k => $v) {
    if (!in_array($k, $allowed, true)) continue;
    $ins->execute([$k, $v]);
}

// Encrypt and save net_pass if provided
if (!empty($body['net_pass'])) {
    $ins->execute(['net_pass', smtpEncrypt($body['net_pass'])]);
}

// Encrypt and save smtp_pass if provided
if (!empty($body['smtp_pass'])) {
    $ins->execute(['smtp_pass', smtpEncrypt($body['smtp_pass'])]);
    $ins->execute(['smtp_pass_set', '1']);
}

// Encrypt and save AI chat API key if provided
if (!empty($body['chat_api_key'])) {
    $provider = $settings['chat_llm_provider'] ?? '';
    $keyName  = ($provider === 'claude') ? 'chat_api_key_claude' : 'chat_api_key_openai';
    $ins->execute([$keyName,          smtpEncrypt($body['chat_api_key'])]);
    $ins->execute([$keyName . '_set', '1']);
}

// Mark setup complete
$db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('setup_complete', '1')")->execute([]);

jsonOut(['ok' => true]);
