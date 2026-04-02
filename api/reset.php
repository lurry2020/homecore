<?php
// Reset API — wipes all user data and clears setup_complete flag.
// Requires a valid session and correct current password.
require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');

if (reqMethod() !== 'POST') { jsonOut(['error' => 'POST only'], 405); }

$body = reqBody();
$pw   = $body['password'] ?? '';

if ($pw === '') { jsonOut(['error' => 'Password is required'], 400); }

$db   = db();
$hash = $db->query("SELECT value FROM app_settings WHERE key='auth_password_hash'")->fetchColumn();
if (!$hash || !password_verify($pw, $hash)) {
    jsonOut(['error' => 'Incorrect password'], 403);
}

// Wipe all user data tables (only those that exist)
$existing = $db->query("SELECT name FROM sqlite_master WHERE type='table'")->fetchAll(PDO::FETCH_COLUMN);
$wipe     = ['app_settings','machines','services','workflows','notes','machine_notes',
             'pinned_notes','models','vlans','unifi_devices','network_config'];
foreach ($wipe as $t) {
    if (in_array($t, $existing, true)) $db->exec("DELETE FROM $t");
}

// Clear SQLite auto-increment counters
if (in_array('sqlite_sequence', $existing, true)) {
    $db->exec("DELETE FROM sqlite_sequence");
}

// Delete files that live outside the DB
$dataDir = dirname(__DIR__) . '/data/';
foreach (['calendar-cache.json', '.smtp_key'] as $f) {
    if (file_exists($dataDir . $f)) @unlink($dataDir . $f);
}

// Destroy the session — auth_gate already called session_start(), so just destroy
session_unset();
session_destroy();

jsonOut(['ok' => true]);
