<?php
require_once __DIR__ . '/db.php';

const CALENDAR_CACHE_FILE = __DIR__ . '/../data/calendar-cache.json';
const CALENDAR_CACHE_TTL  = 900;

$db = db();
$rows = $db->query("SELECT key, value FROM app_settings WHERE key IN ('calendar_ics_url','calendar_days','sys_timezone')")
    ->fetchAll(PDO::FETCH_KEY_PAIR);

$icsUrl = trim((string) ($rows['calendar_ics_url'] ?? ''));
$days = max(1, min(90, (int) ($rows['calendar_days'] ?? 30)));
$timezone = trim((string) ($rows['sys_timezone'] ?? 'America/New_York')) ?: 'America/New_York';

if ($icsUrl === '') {
    jsonOut(['error' => 'No calendar ICS URL configured'], 400);
}

if (!looksLikeIcsUrl($icsUrl)) {
    jsonOut(['error' => 'Calendar URL must be a direct ICS feed URL'], 400);
}

$raw = calendarFetch($icsUrl);
if (!is_string($raw) || $raw === '') {
    $cached = calendarCacheRead();
    if ($cached && !empty($cached['events'])) {
        jsonOut($cached + ['cached' => true, 'stale' => true]);
    }
    jsonOut(['error' => 'Calendar unavailable'], 503);
}

$payload = buildCalendarPayload($raw, $timezone, $days);
calendarCacheWrite($payload);
jsonOut($payload);

function buildCalendarPayload(string $raw, string $timezone, int $days): array {
    $events = parseCalendarEvents($raw, $timezone, $days);
    return [
        'timezone' => $timezone,
        'days' => $days,
        'events' => $events,
    ];
}

function parseCalendarEvents(string $raw, string $timezone, int $days): array {
    $events = [];
    $lines = preg_split("/\r\n|\n|\r/", $raw) ?: [];
    $lines = unfoldCalendarLines($lines);

    $inEvent = false;
    $current = [];
    foreach ($lines as $line) {
        if ($line === 'BEGIN:VEVENT') {
            $inEvent = true;
            $current = [];
            continue;
        }
        if ($line === 'END:VEVENT') {
            $event = normalizeCalendarEvent($current, $timezone);
            if ($event) {
                $events[] = $event;
            }
            $inEvent = false;
            $current = [];
            continue;
        }
        if (!$inEvent || strpos($line, ':') === false) {
            continue;
        }

        [$left, $value] = explode(':', $line, 2);
        $parts = explode(';', $left);
        $name = strtoupper(array_shift($parts));
        $params = [];
        foreach ($parts as $part) {
            if (strpos($part, '=') === false) {
                continue;
            }
            [$k, $v] = explode('=', $part, 2);
            $params[strtoupper($k)] = $v;
        }
        $current[$name] = ['value' => $value, 'params' => $params];
    }

    $now = new DateTimeImmutable('now', new DateTimeZone($timezone));
    $windowEnd = $now->modify('+' . $days . ' days')->setTime(23, 59, 59);

    $events = array_filter($events, static function (array $event) use ($now, $windowEnd): bool {
        $start = new DateTimeImmutable($event['start_iso']);
        $end = new DateTimeImmutable($event['end_iso']);
        return $end >= $now && $start <= $windowEnd;
    });

    usort($events, static fn(array $a, array $b): int => strcmp($a['start_iso'], $b['start_iso']));
    return array_slice(array_values($events), 0, 25);
}

function unfoldCalendarLines(array $lines): array {
    $out = [];
    foreach ($lines as $line) {
        if ($line === '') {
            continue;
        }
        if ($out && isset($line[0]) && ($line[0] === ' ' || $line[0] === "\t")) {
            $out[count($out) - 1] .= substr($line, 1);
            continue;
        }
        $out[] = trim($line);
    }
    return $out;
}

function normalizeCalendarEvent(array $event, string $timezone): ?array {
    if (empty($event['DTSTART']['value']) || empty($event['SUMMARY']['value'])) {
        return null;
    }

    $start = parseCalendarDate($event['DTSTART']['value'], $event['DTSTART']['params'] ?? [], $timezone);
    if (!$start) {
        return null;
    }

    $allDay = (($event['DTSTART']['params']['VALUE'] ?? '') === 'DATE');
    $end = null;
    if (!empty($event['DTEND']['value'])) {
        $end = parseCalendarDate($event['DTEND']['value'], $event['DTEND']['params'] ?? [], $timezone);
        if ($allDay && $end) {
            $end = $end->modify('-1 day')->setTime(23, 59, 59);
        }
    }
    if (!$end) {
        $end = $allDay ? $start->setTime(23, 59, 59) : $start->modify('+1 hour');
    }

    $summary = decodeCalendarText($event['SUMMARY']['value']);
    $location = decodeCalendarText($event['LOCATION']['value'] ?? '');

    return [
        'summary' => $summary,
        'location' => $location,
        'all_day' => $allDay,
        'start_iso' => $start->format(DateTimeInterface::ATOM),
        'end_iso' => $end->format(DateTimeInterface::ATOM),
    ];
}

function parseCalendarDate(string $value, array $params, string $fallbackTimezone): ?DateTimeImmutable {
    $tz = new DateTimeZone($params['TZID'] ?? $fallbackTimezone);

    if (($params['VALUE'] ?? '') === 'DATE' && preg_match('/^\d{8}$/', $value)) {
        $dt = DateTimeImmutable::createFromFormat('!Ymd', $value, $tz);
        return $dt ?: null;
    }

    if (str_ends_with($value, 'Z')) {
        $dt = DateTimeImmutable::createFromFormat('!Ymd\THis\Z', $value, new DateTimeZone('UTC'));
        return $dt ? $dt->setTimezone($tz) : null;
    }

    $dt = DateTimeImmutable::createFromFormat('!Ymd\THis', $value, $tz);
    return $dt ?: null;
}

function decodeCalendarText(string $value): string {
    return str_replace(
        ['\\n', '\\N', '\\,', '\\;', '\\\\'],
        ["\n", "\n", ',', ';', '\\'],
        $value
    );
}

function looksLikeIcsUrl(string $url): bool {
    $path = parse_url($url, PHP_URL_PATH);
    if (!is_string($path)) {
        return false;
    }
    return str_ends_with(strtolower($path), '.ics');
}

function calendarFetch(string $url): ?string {
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 10,
            'header'  => "User-Agent: HomelabDashboard/1.0\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
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
        '--max-time', '10',
        '--connect-timeout', '5',
        '--user-agent', 'HomelabDashboard/1.0',
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

    error_log('calendar fetch failed: ' . trim((string) $stderr));
    return null;
}

function calendarCacheRead(): ?array {
    if (!is_file(CALENDAR_CACHE_FILE)) {
        return null;
    }
    $raw = @file_get_contents(CALENDAR_CACHE_FILE);
    $data = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($data) || !isset($data['payload'], $data['fetched_at'])) {
        return null;
    }
    return is_array($data['payload']) ? $data['payload'] : null;
}

function calendarCacheWrite(array $payload): void {
    $body = json_encode([
        'fetched_at' => time(),
        'payload' => $payload,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($body !== false) {
        @file_put_contents(CALENDAR_CACHE_FILE, $body, LOCK_EX);
    }
}
