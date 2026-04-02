<?php
require_once __DIR__ . '/db.php';

$db  = db();
$id  = reqId();
$met = reqMethod();

function castModel(array &$r): void {
    $r['id']         = (int)$r['id'];
    $r['vram_gb']    = (float)$r['vram_gb'];
    $r['sort_order'] = (int)$r['sort_order'];
}

if ($met === 'GET') {
    if ($id) {
        $st = $db->prepare("SELECT * FROM models WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) jsonOut(['error' => 'Not found'], 404);
        castModel($row);
        jsonOut($row);
    }
    $rows = $db->query("SELECT * FROM models ORDER BY sort_order, id")->fetchAll();
    foreach ($rows as &$r) castModel($r);
    jsonOut(array_values($rows));
}

if ($met === 'POST') {
    $b = reqBody();
    if (empty($b['name'])) jsonOut(['error' => 'name required'], 422);
    $db->prepare("INSERT INTO models (name,machine,vram_gb,best_for,icon,sort_order) VALUES (?,?,?,?,?,?)")
       ->execute([$b['name'], $b['machine']??'', (float)($b['vram_gb']??0),
                  $b['best_for']??'', $b['icon']??'🤖', (int)($b['sort_order']??0)]);
    $st = $db->prepare("SELECT * FROM models WHERE id=?");
    $st->execute([(int)$db->lastInsertId()]);
    $row = $st->fetch();
    castModel($row);
    jsonOut($row, 201);
}

if ($met === 'PUT') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $b = reqBody();
    $db->prepare("UPDATE models SET name=?,machine=?,vram_gb=?,best_for=?,icon=?,sort_order=? WHERE id=?")
       ->execute([$b['name']??'', $b['machine']??'', (float)($b['vram_gb']??0),
                  $b['best_for']??'', $b['icon']??'🤖', (int)($b['sort_order']??0), $id]);
    $st = $db->prepare("SELECT * FROM models WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    castModel($row);
    jsonOut($row);
}

if ($met === 'DELETE') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $db->prepare("DELETE FROM models WHERE id=?")->execute([$id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
