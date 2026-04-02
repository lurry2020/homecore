<?php
require_once __DIR__ . '/db.php';

$db       = db();
$id       = reqId();
$met      = reqMethod();
$resource = $_GET['resource'] ?? 'config';   // config | vlans | unifi

// ── Network config (gateway, device name) ────────────────────────────────────
if ($resource === 'config') {
    if ($met === 'GET') {
        $gw  = $db->query("SELECT value FROM network_config WHERE key='gateway'")->fetchColumn();
        $dev = $db->query("SELECT value FROM network_config WHERE key='device'")->fetchColumn();
        jsonOut(['gateway' => $gw ?: '', 'device' => $dev ?: '']);
    }
    if ($met === 'PUT') {
        $b   = reqBody();
        $ins = $db->prepare("INSERT OR REPLACE INTO network_config (key,value) VALUES (?,?)");
        $ins->execute(['gateway', $b['gateway'] ?? '']);
        $ins->execute(['device',  $b['device']  ?? '']);
        jsonOut(['ok' => true]);
    }
}

// ── VLANs ────────────────────────────────────────────────────────────────────
if ($resource === 'vlans') {
    if ($met === 'GET') {
        $rows = $db->query("SELECT * FROM vlans ORDER BY vlan_id")->fetchAll();
        foreach ($rows as &$r) { $r['id'] = (int)$r['id'];  $r['vlan_id'] = (int)$r['vlan_id']; }
        jsonOut(array_values($rows));
    }
    if ($met === 'POST') {
        $b = reqBody();
        $db->prepare("INSERT INTO vlans (vlan_id,name,subnet) VALUES (?,?,?)")
           ->execute([(int)($b['vlan_id']??0), $b['name']??'', $b['subnet']??'']);
        $st = $db->prepare("SELECT * FROM vlans WHERE id=?");
        $st->execute([(int)$db->lastInsertId()]);
        $row = $st->fetch();
        $row['id'] = (int)$row['id'];  $row['vlan_id'] = (int)$row['vlan_id'];
        jsonOut($row, 201);
    }
    if ($met === 'PUT') {
        if (!$id) jsonOut(['error' => 'id required'], 422);
        $b = reqBody();
        $db->prepare("UPDATE vlans SET vlan_id=?,name=?,subnet=? WHERE id=?")
           ->execute([(int)($b['vlan_id']??0), $b['name']??'', $b['subnet']??'', $id]);
        $st = $db->prepare("SELECT * FROM vlans WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        $row['id'] = (int)$row['id'];  $row['vlan_id'] = (int)$row['vlan_id'];
        jsonOut($row);
    }
    if ($met === 'DELETE') {
        if (!$id) jsonOut(['error' => 'id required'], 422);
        $db->prepare("DELETE FROM vlans WHERE id=?")->execute([$id]);
        jsonOut(['ok' => true]);
    }
}

// ── UniFi devices ─────────────────────────────────────────────────────────────
if ($resource === 'unifi') {
    if ($met === 'GET') {
        $rows = $db->query("SELECT * FROM unifi_devices ORDER BY id")->fetchAll();
        foreach ($rows as &$r) $r['id'] = (int)$r['id'];
        jsonOut(array_values($rows));
    }
    if ($met === 'POST') {
        $b = reqBody();
        $db->prepare("INSERT INTO unifi_devices (name,ip,role) VALUES (?,?,?)")
           ->execute([$b['name']??'', $b['ip']??'', $b['role']??'']);
        $st = $db->prepare("SELECT * FROM unifi_devices WHERE id=?");
        $st->execute([(int)$db->lastInsertId()]);
        $row = $st->fetch();
        $row['id'] = (int)$row['id'];
        jsonOut($row, 201);
    }
    if ($met === 'PUT') {
        if (!$id) jsonOut(['error' => 'id required'], 422);
        $b = reqBody();
        $db->prepare("UPDATE unifi_devices SET name=?,ip=?,role=? WHERE id=?")
           ->execute([$b['name']??'', $b['ip']??'', $b['role']??'', $id]);
        $st = $db->prepare("SELECT * FROM unifi_devices WHERE id=?");
        $st->execute([$id]);
        $row = $st->fetch();
        $row['id'] = (int)$row['id'];
        jsonOut($row);
    }
    if ($met === 'DELETE') {
        if (!$id) jsonOut(['error' => 'id required'], 422);
        $db->prepare("DELETE FROM unifi_devices WHERE id=?")->execute([$id]);
        jsonOut(['ok' => true]);
    }
}

jsonOut(['error' => 'Unknown resource or method'], 400);
