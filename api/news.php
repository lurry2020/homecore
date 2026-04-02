<?php
require_once __DIR__ . '/db.php';

$db  = db();
$met = reqMethod();

if ($met !== 'GET') { http_response_code(405); jsonOut(['error' => 'Method not allowed']); }

// Load settings
$rows    = $db->query("SELECT key, value FROM app_settings")->fetchAll(PDO::FETCH_KEY_PAIR);
$enabled = ($rows['news_enabled'] ?? '0') === '1';
if (!$enabled) { jsonOut(['articles' => [], 'note' => 'News disabled']); }

$sourcesJson = $rows['news_sources'] ?? '[]';
$sources     = json_decode($sourcesJson, true) ?: [];
$activeSrcs  = array_filter($sources, fn($s) => !empty($s['enabled']));

if (empty($activeSrcs)) { jsonOut(['articles' => []]); }

$articles = [];
$ctx = stream_context_create(['http' => [
    'timeout'    => 8,
    'user_agent' => 'HomelabDashboard/1.0',
    'ignore_errors' => true,
]]);

foreach ($activeSrcs as $src) {
    $url = $src['url'] ?? '';
    if (!$url) continue;
    $raw = @file_get_contents($url, false, $ctx);
    if (!$raw) continue;

    // Suppress XML errors
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);
    libxml_clear_errors();
    if (!$xml) continue;

    // Support both RSS 2.0 (channel/item) and Atom (entry)
    $items = [];
    if (isset($xml->channel->item)) {
        $items = $xml->channel->item;
    } elseif (isset($xml->entry)) {
        $items = $xml->entry;
    }

    $count = 0;
    foreach ($items as $item) {
        if ($count >= 10) break;

        // Title
        $title = trim((string)($item->title ?? ''));
        if (!$title) continue;

        // Link — RSS vs Atom
        $link = '';
        if (isset($item->link) && (string)$item->link) {
            $link = (string)$item->link;
        } elseif (isset($item->link['href'])) {
            $link = (string)$item->link['href'];
        }

        // Published date
        $pub = '';
        foreach (['pubDate', 'published', 'updated', 'dc:date'] as $f) {
            if (isset($item->$f) && (string)$item->$f) {
                $pub = (string)$item->$f;
                break;
            }
        }
        $ts = $pub ? strtotime($pub) : 0;

        // Description / summary (strip tags, truncate)
        $desc = '';
        foreach (['description', 'summary', 'content'] as $f) {
            if (isset($item->$f) && (string)$item->$f) {
                $desc = strip_tags((string)$item->$f);
                $desc = preg_replace('/\s+/', ' ', trim($desc));
                if (strlen($desc) > 180) $desc = substr($desc, 0, 177) . '…';
                break;
            }
        }

        $articles[] = [
            'source'    => $src['name'],
            'source_id' => $src['id'],
            'title'     => $title,
            'url'       => $link,
            'summary'   => $desc,
            'published' => $ts ? date('c', $ts) : null,
            'ts'        => $ts,
        ];
        $count++;
    }
}

// Sort newest first
usort($articles, fn($a, $b) => $b['ts'] - $a['ts']);
// Remove internal ts
foreach ($articles as &$a) unset($a['ts']);

jsonOut(['articles' => $articles]);
