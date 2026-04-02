<?php
require_once __DIR__ . '/db.php';

$db  = db();
$id  = reqId();
$met = reqMethod();

if ($met === 'GET') {
    $rows = $db->query("SELECT * FROM pinned_notes ORDER BY sort_order, id")->fetchAll();
    foreach ($rows as &$r) $r['id'] = (int)$r['id'];
    jsonOut(array_values($rows));
}

if ($met === 'POST') {
    $b = reqBody();
    if (empty($b['note'])) jsonOut(['error' => 'note required'], 422);
    $db->prepare("INSERT INTO pinned_notes (note,sort_order) VALUES (?,?)")
       ->execute([$b['note'], (int)($b['sort_order']??0)]);
    $st = $db->prepare("SELECT * FROM pinned_notes WHERE id=?");
    $st->execute([(int)$db->lastInsertId()]);
    $row = $st->fetch();
    $row['id'] = (int)$row['id'];
    jsonOut($row, 201);
}

if ($met === 'PUT') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $b = reqBody();
    $db->prepare("UPDATE pinned_notes SET note=?,sort_order=? WHERE id=?")
       ->execute([$b['note']??'', (int)($b['sort_order']??0), $id]);
    $st = $db->prepare("SELECT * FROM pinned_notes WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    $row['id'] = (int)$row['id'];
    jsonOut($row);
}

if ($met === 'DELETE') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $db->prepare("DELETE FROM pinned_notes WHERE id=?")->execute([$id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
