<?php
require_once __DIR__ . '/db.php';

$db  = db();
$met = reqMethod();
$res = $_GET['resource'] ?? '';

/* ── Helpers ─────────────────────────────────────────────────────────────────── */

function haConfig(PDO $db): array {
    $rows = $db->query(
        "SELECT key, value FROM app_settings WHERE key IN ('ha_url','ha_token')"
    )->fetchAll(PDO::FETCH_KEY_PAIR);
    return [
        'url'   => $rows['ha_url']   ?? '',
        'token' => smtpDecrypt($rows['ha_token'] ?? ''),
    ];
}

function haRequest(string $path, string $method = 'GET', array $body = []): array|false {
    global $db;
    $cfg   = haConfig($db);
    $url   = rtrim($cfg['url'], '/') . $path;
    $token = $cfg['token'];

    if (empty($url) || empty($token)) {
        return ['error' => 'Home Assistant not configured'];
    }

    $headers = [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_HTTPHEADER     => $headers,
    ]);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body ?: new stdClass()));
    }

    $raw  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($err) return ['error' => $err];
    if ($raw === false || $raw === '') return ['error' => "Empty response (HTTP $code)"];

    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['error' => 'Invalid JSON from Home Assistant'];
    }
    return $data ?? [];
}

/* ── GET config ──────────────────────────────────────────────────────────────── */
if ($met === 'GET' && $res === 'config') {
    $cfg = haConfig($db);
    $connected = false;
    if (!empty($cfg['url']) && !empty($cfg['token'])) {
        $test = haRequest('/api/');
        $connected = is_array($test) && isset($test['message']);
    }
    jsonOut([
        'url'       => $cfg['url'],
        'has_token' => !empty($cfg['token']),
        'connected' => $connected,
    ]);
}

/* ── PUT config ──────────────────────────────────────────────────────────────── */
if ($met === 'PUT' && $res === 'config') {
    $b   = reqBody();
    $ins = $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");
    if (isset($b['url'])) {
        $ins->execute(['ha_url', trim($b['url'])]);
    }
    if (!empty($b['token'])) {
        $ins->execute(['ha_token', smtpEncrypt(trim($b['token']))]);
    }
    jsonOut(['ok' => true]);
}

/* ── DELETE config ───────────────────────────────────────────────────────────── */
if ($met === 'DELETE' && $res === 'config') {
    $db->exec("DELETE FROM app_settings WHERE key IN ('ha_url','ha_token')");
    jsonOut(['ok' => true]);
}

/* ── GET states ──────────────────────────────────────────────────────────────── */
if ($met === 'GET' && $res === 'states') {
    $states = haRequest('/api/states');
    if (isset($states['error'])) jsonOut($states, 503);

    $useful = [
        'light', 'switch', 'input_boolean', 'sensor', 'binary_sensor',
        'climate', 'cover', 'media_player', 'person', 'device_tracker',
        'scene', 'script', 'automation', 'weather', 'fan', 'lock',
        'alarm_control_panel', 'input_number', 'input_select',
    ];

    $filtered = array_values(array_filter((array)$states, function ($e) use ($useful) {
        $domain = explode('.', $e['entity_id'] ?? '')[0] ?? '';
        return in_array($domain, $useful, true);
    }));

    jsonOut($filtered);
}

/* ── GET page_config ─────────────────────────────────────────────────────────── */
if ($met === 'GET' && $res === 'page_config') {
    $row = $db->query("SELECT value FROM app_settings WHERE key='ha_page_config'")->fetchColumn();
    $cfg = $row ? json_decode($row, true) : null;
    jsonOut($cfg ?: ['sections' => []]);
}

/* ── PUT page_config ─────────────────────────────────────────────────────────── */
if ($met === 'PUT' && $res === 'page_config') {
    $b = reqBody();
    // Validate basic structure
    if (!isset($b['sections']) || !is_array($b['sections'])) jsonOut(['error' => 'Invalid config'], 422);
    $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('ha_page_config', ?)")
       ->execute([json_encode($b)]);
    jsonOut(['ok' => true]);
}

/* ── POST service call ───────────────────────────────────────────────────────── */
if ($met === 'POST' && $res === 'service') {
    $b       = reqBody();
    $domain  = preg_replace('/[^a-z_]/', '', $b['domain']  ?? '');
    $service = preg_replace('/[^a-z_]/', '', $b['service'] ?? '');
    $data    = $b['data'] ?? [];

    if (!$domain || !$service) jsonOut(['error' => 'domain and service required'], 422);

    $result = haRequest("/api/services/{$domain}/{$service}", 'POST', $data);
    if (isset($result['error'])) jsonOut($result, 503);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
