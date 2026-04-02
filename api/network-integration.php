<?php
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if (reqMethod() !== 'GET') jsonOut(['error' => 'GET only'], 405);

$db   = db();
$rows = $db->query("SELECT key, value FROM app_settings WHERE key LIKE 'net_%'")
           ->fetchAll(PDO::FETCH_KEY_PAIR);

$integration = $rows['net_integration'] ?? '';

if (!$integration) {
    jsonOut(['integration' => null]);
}

$cfg = [
    'host'       => rtrim($rows['net_host']       ?? '', '/'),
    'site'       => $rows['net_site']              ?? 'default',
    'user'       => $rows['net_user']              ?? '',
    'pass'       => smtpDecrypt($rows['net_pass']  ?? ''),
    'verify_ssl' => ($rows['net_verify_ssl']       ?? '0') === '1',
    'unifi_os'   => ($rows['net_unifi_os']         ?? '0') === '1',
    'auth_mode'  => $rows['net_auth_mode']         ?? 'credentials',
];

if (!$cfg['host']) {
    jsonOut(['error' => 'Host URL is not configured'], 400);
}

// ── 30-second cache ────────────────────────────────────────────────────────────
$cacheKey  = md5($integration . $cfg['host'] . $cfg['site'] . $cfg['user']);
$cacheFile = sys_get_temp_dir() . '/net_cache_' . $cacheKey . '.json';
$ttl       = 30;

if (!isset($_GET['refresh']) && file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    if ($cached) {
        $cached['cached'] = true;
        jsonOut($cached);
    }
}

// ── Dispatch to adapter ────────────────────────────────────────────────────────
if ($integration === 'unifi') {
    require_once __DIR__ . '/adapters/unifi.php';
    $data = unifi_fetch($cfg);
} elseif ($integration === 'opnsense') {
    require_once __DIR__ . '/adapters/opnsense.php';
    $data = opnsense_fetch($cfg);
} else {
    jsonOut(['error' => "Unknown integration: $integration"], 400);
}

if (!isset($data['error'])) {
    file_put_contents($cacheFile, json_encode($data));
}

jsonOut($data);
