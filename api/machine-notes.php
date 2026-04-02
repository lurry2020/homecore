<?php
require_once __DIR__ . '/db.php';

$notesDir = __DIR__ . '/../data/machine-notes';
if (!is_dir($notesDir)) mkdir($notesDir, 0755, true);

function notePath(int $id): string {
    global $notesDir;
    return $notesDir . '/machine_' . $id . '.md';
}

$met = reqMethod();
$machineId = isset($_GET['machine_id']) ? intval($_GET['machine_id']) : null;

// GET with no machine_id → return list of IDs, or all content with ?all=1
if ($met === 'GET' && !$machineId) {
    $files = glob($notesDir . '/machine_*.md') ?: [];
    $ids = [];
    foreach ($files as $f) {
        if (preg_match('/machine_(\d+)\.md$/', $f, $m)) {
            $ids[] = (int)$m[1];
        }
    }
    if (!empty($_GET['all'])) {
        $notes = [];
        foreach ($ids as $id) {
            $notes[$id] = file_get_contents(notePath($id));
        }
        jsonOut(['ids' => $ids, 'notes' => $notes]);
    } else {
        jsonOut(['ids' => $ids]);
    }
}

if (!$machineId) jsonOut(['error' => 'machine_id required'], 400);

// GET → fetch note for a machine
if ($met === 'GET') {
    $path = notePath($machineId);
    if (file_exists($path)) {
        jsonOut(['exists' => true, 'content' => file_get_contents($path)]);
    } else {
        jsonOut(['exists' => false, 'content' => '']);
    }
}

// POST → create or save note
if ($met === 'POST') {
    $b = reqBody();
    file_put_contents(notePath($machineId), $b['content'] ?? '');
    jsonOut(['ok' => true]);
}

// DELETE → remove note file
if ($met === 'DELETE') {
    $path = notePath($machineId);
    if (file_exists($path)) unlink($path);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
