<?php
require_once __DIR__ . '/db.php';

const WEATHER_CACHE_FILE = __DIR__ . '/../data/weather-cache.json';
const WEATHER_CACHE_TTL  = 900;

$db   = db();
$rows = $db->query("SELECT key, value FROM app_settings WHERE key IN ('sys_zipcode','sys_timezone')")
           ->fetchAll(PDO::FETCH_KEY_PAIR);

$zipcode  = $rows['sys_zipcode']  ?? '';
$timezone = $rows['sys_timezone'] ?? 'America/New_York';

if (empty($zipcode)) {
    jsonOut(['error' => 'No ZIP code configured'], 400);
}

$url = 'https://wttr.in/' . urlencode($zipcode) . '?format=j1';
$raw = weatherFetch($url);
$data = is_string($raw) ? json_decode($raw, true) : null;

$current  = $data['current_condition'][0] ?? null;
$areaInfo = $data['nearest_area'][0]      ?? null;

if (!$current) {
    $cached = weatherCacheRead();
    if ($cached) {
        jsonOut($cached + ['cached' => true, 'stale' => true]);
    }
    jsonOut([
        'error' => 'Weather unavailable',
        'zipcode' => $zipcode,
        'timezone' => $timezone,
    ], 503);
}

$city    = $areaInfo['areaName'][0]['value']    ?? '';
$country = $areaInfo['country'][0]['value']     ?? '';
$location = trim($city . ($country ? ', ' . $country : ''));

$payload = [
    'location'     => $location,
    'zipcode'      => $zipcode,
    'timezone'     => $timezone,
    'temp_f'       => $current['temp_F']                  ?? '',
    'temp_c'       => $current['temp_C']                  ?? '',
    'feels_like_f' => $current['FeelsLikeF']              ?? '',
    'description'  => $current['weatherDesc'][0]['value'] ?? '',
    'humidity'     => $current['humidity']                ?? '',
    'wind_mph'     => $current['windspeedMiles']          ?? '',
    'wind_dir'     => $current['winddir16Point']          ?? '',
    'weather_code' => $current['weatherCode']             ?? '',
];

weatherCacheWrite($payload);
jsonOut($payload);

function weatherFetch(string $url): ?string {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 8,
            'header'  => "User-Agent: HomelabDashboard/1.0\r\nAccept: application/json\r\n",
        ],
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $ctx);
    if (is_string($raw) && $raw !== '') {
        return $raw;
    }

    if (!is_executable('/usr/bin/curl')) {
        return null;
    }

    $cmd = [
        '/usr/bin/curl',
        '--silent',
        '--show-error',
        '--location',
        '--max-time', '8',
        '--connect-timeout', '5',
        '--user-agent', 'HomelabDashboard/1.0',
        '--header', 'Accept: application/json',
        $url,
    ];

    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];

    $proc = @proc_open($cmd, $descriptors, $pipes);
    if (!is_resource($proc)) {
        return null;
    }

    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $code = proc_close($proc);

    if ($code === 0 && is_string($stdout) && $stdout !== '') {
        return $stdout;
    }

    error_log('weather curl fetch failed: ' . trim((string) $stderr));
    return null;
}

function weatherCacheRead(): ?array {
    if (!is_file(WEATHER_CACHE_FILE)) {
        return null;
    }

    $raw = @file_get_contents(WEATHER_CACHE_FILE);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data) || !isset($data['payload'], $data['fetched_at'])) {
        return null;
    }

    if ((time() - (int) $data['fetched_at']) > WEATHER_CACHE_TTL) {
        return is_array($data['payload']) ? $data['payload'] : null;
    }

    return is_array($data['payload']) ? $data['payload'] : null;
}

function weatherCacheWrite(array $payload): void {
    $body = json_encode([
        'fetched_at' => time(),
        'payload'    => $payload,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($body !== false) {
        @file_put_contents(WEATHER_CACHE_FILE, $body, LOCK_EX);
    }
}
