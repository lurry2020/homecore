<?php
require_once __DIR__ . '/db.php';

$db  = db();
$id  = reqId();
$met = reqMethod();

function castService(array &$r): void {
    $r['id']   = (int)$r['id'];
    $r['port'] = (int)$r['port'];
    $r['sort_order'] = (int)$r['sort_order'];
    $r['tags'] = json_decode($r['tags'] ?? '[]', true) ?: [];
    $r['backend_key'] = $r['backend_key'] ?? '';
    $r['source'] = $r['source'] ?? 'manual';
}

if ($met === 'GET') {
    if ($id) {
        $st = $db->prepare("SELECT * FROM services WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) jsonOut(['error' => 'Not found'], 404);
        castService($row);
        jsonOut($row);
    }
    $rows = $db->query("SELECT * FROM services ORDER BY sort_order, id")->fetchAll();
    foreach ($rows as &$r) castService($r);
    jsonOut(array_values($rows));
}

if ($met === 'POST') {
    $b = reqBody();
    if (empty($b['name'])) jsonOut(['error' => 'name required'], 422);
    $tags = json_encode(is_array($b['tags']??null) ? $b['tags'] : []);
    $db->prepare("INSERT INTO services (name,machine,backend_key,source,ip,port,url,type,deployment,login_hint,tags,notes,icon,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
       ->execute([$b['name'], $b['machine']??'', $b['backend_key']??'', $b['source']??'manual', $b['ip']??'', (int)($b['port']??80),
                  $b['url']??'', $b['type']??'', $b['deployment']??'', $b['login_hint']??'',
                  $tags, $b['notes']??'', $b['icon']??'⚙️', (int)($b['sort_order']??0)]);
    $st = $db->prepare("SELECT * FROM services WHERE id=?");
    $st->execute([(int)$db->lastInsertId()]);
    $row = $st->fetch();
    castService($row);
    jsonOut($row, 201);
}

if ($met === 'PUT') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $b = reqBody();
    $tags = json_encode(is_array($b['tags']??null) ? $b['tags'] : []);
    $db->prepare("UPDATE services SET name=?,machine=?,backend_key=?,source=?,ip=?,port=?,url=?,type=?,deployment=?,login_hint=?,tags=?,notes=?,icon=?,sort_order=? WHERE id=?")
       ->execute([$b['name']??'', $b['machine']??'', $b['backend_key']??'', $b['source']??'manual', $b['ip']??'', (int)($b['port']??80),
                  $b['url']??'', $b['type']??'', $b['deployment']??'', $b['login_hint']??'',
                  $tags, $b['notes']??'', $b['icon']??'⚙️', (int)($b['sort_order']??0), $id]);
    $st = $db->prepare("SELECT * FROM services WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    castService($row);
    jsonOut($row);
}

if ($met === 'DELETE') {
    if (!$id) jsonOut(['error' => 'id required'], 422);
    $db->prepare("DELETE FROM services WHERE id=?")->execute([$id]);
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
