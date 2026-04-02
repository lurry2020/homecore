<?php
require_once __DIR__ . '/db.php';

$db  = db();
$id  = reqId();
$met = reqMethod();

if ($met === 'GET') {
    if ($id) {
        $st = $db->prepare("SELECT * FROM machines WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) jsonOut(['error' => 'Not found'], 404);
        $row['id'] = (int)$row['id'];  $row['vlan'] = (int)$row['vlan'];
        jsonOut($row);
    }
    $rows = $db->query("SELECT * FROM machines ORDER BY sort_order, id")->fetchAll();
    foreach ($rows as &$r) { $r['id'] = (int)$r['id'];  $r['vlan'] = (int)$r['vlan']; }
    jsonOut(array_values($rows));
}

if ($met === 'POST') {
    $b = reqBody();
    if (empty($b['name'])) jsonOut(['error' => 'name required'], 422);
    $db->prepare("INSERT INTO machines (name,ip,vlan,role,os,notes,icon,sort_order) VALUES (?,?,?,?,?,?,?,?)")
       ->execute([$b['name'], $b['ip']??'', (int)($b['vlan']??1), $b['role']??'',
                  $b['os']??'', $b['notes']??'', $b['icon']??'🖥️', (int)($b['sort_order']??0)]);
    $new = $db->prepare("SELECT * FROM machines WHERE id=?");
    $new->execute([(int)$db->lastInsertId()]);
    $row = $new->fetch();
    $row['id'] = (int)$row['id'];  $row['vlan'] = (int)$row['vlan'];
    jsonOut($row, 201);
}

if ($met === 'PUT') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $b = reqBody();
    $db->prepare("UPDATE machines SET name=?,ip=?,vlan=?,role=?,os=?,notes=?,icon=?,sort_order=? WHERE id=?")
       ->execute([$b['name']??'', $b['ip']??'', (int)($b['vlan']??1), $b['role']??'',
                  $b['os']??'', $b['notes']??'', $b['icon']??'🖥️', (int)($b['sort_order']??0), $id]);
    $st = $db->prepare("SELECT * FROM machines WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    $row['id'] = (int)$row['id'];  $row['vlan'] = (int)$row['vlan'];
    jsonOut($row);
}

if ($met === 'DELETE') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $db->prepare("DELETE FROM machines WHERE id=?")->execute([$id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
