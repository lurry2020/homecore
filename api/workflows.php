<?php
require_once __DIR__ . '/db.php';

$db  = db();
$id  = reqId();
$met = reqMethod();

function castWf(array &$r): void {
    $r['id']         = (int)$r['id'];
    $r['sort_order'] = (int)$r['sort_order'];
}

if ($met === 'GET') {
    if ($id) {
        $st = $db->prepare("SELECT * FROM workflows WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) jsonOut(['error' => 'Not found'], 404);
        castWf($row);
        jsonOut($row);
    }
    $rows = $db->query("SELECT * FROM workflows ORDER BY sort_order, id")->fetchAll();
    foreach ($rows as &$r) castWf($r);
    jsonOut(array_values($rows));
}

if ($met === 'POST') {
    $b = reqBody();
    if (empty($b['name'])) jsonOut(['error' => 'name required'], 422);
    $db->prepare("INSERT INTO workflows (name,machine,status,notes,icon,sort_order) VALUES (?,?,?,?,?,?)")
       ->execute([$b['name'], $b['machine']??'', $b['status']??'active',
                  $b['notes']??'', $b['icon']??'⚡', (int)($b['sort_order']??0)]);
    $st = $db->prepare("SELECT * FROM workflows WHERE id=?");
    $st->execute([(int)$db->lastInsertId()]);
    $row = $st->fetch();
    castWf($row);
    jsonOut($row, 201);
}

if ($met === 'PUT') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $b = reqBody();
    $db->prepare("UPDATE workflows SET name=?,machine=?,status=?,notes=?,icon=?,sort_order=? WHERE id=?")
       ->execute([$b['name']??'', $b['machine']??'', $b['status']??'active',
                  $b['notes']??'', $b['icon']??'⚡', (int)($b['sort_order']??0), $id]);
    $st = $db->prepare("SELECT * FROM workflows WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    castWf($row);
    jsonOut($row);
}

if ($met === 'DELETE') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $db->prepare("DELETE FROM workflows WHERE id=?")->execute([$id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
