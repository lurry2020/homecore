<?php
require_once __DIR__ . '/db.php';
$db  = db();
$met = reqMethod();

// Ensure app_settings has the topology key
if ($met === 'GET') {
    $row = $db->query("SELECT value FROM app_settings WHERE key='topology_data'")->fetchColumn();
    header('Content-Type: application/json');
    echo $row ?: '{"nodes":{},"connections":{},"texts":{},"nextId":1}';
    exit;
}

if ($met === 'PUT') {
    $raw = file_get_contents('php://input');
    // Validate it's JSON
    $parsed = json_decode($raw);
    if ($parsed === null) { http_response_code(400); jsonOut(['error' => 'Invalid JSON']); }
    $stmt = $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('topology_data', ?)");
    $stmt->execute([$raw]);
    jsonOut(['ok' => true]);
}

if ($met === 'DELETE') {
    $db->exec("DELETE FROM app_settings WHERE key='topology_data'");
    jsonOut(['ok' => true]);
}
