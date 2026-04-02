<?php
require_once __DIR__ . '/db.php';

$db = db();

$machines  = $db->query("SELECT * FROM machines  ORDER BY sort_order, id")->fetchAll();
$services  = $db->query("SELECT * FROM services  ORDER BY sort_order, id")->fetchAll();
$models    = $db->query("SELECT * FROM models    ORDER BY sort_order, id")->fetchAll();
$workflows = $db->query("SELECT * FROM workflows ORDER BY sort_order, id")->fetchAll();
$vlans     = $db->query("SELECT vlan_id as id, name, subnet FROM vlans ORDER BY vlan_id")->fetchAll();
$unifi     = $db->query("SELECT * FROM unifi_devices ORDER BY id")->fetchAll();
$notes     = $db->query("SELECT * FROM pinned_notes ORDER BY sort_order")->fetchAll();
foreach ($notes as &$n) { $n['id'] = (int)$n['id'];  $n['sort_order'] = (int)$n['sort_order']; }
unset($n);
$gw        = $db->query("SELECT value FROM network_config WHERE key='gateway'")->fetchColumn();
$dev       = $db->query("SELECT value FROM network_config WHERE key='device'")->fetchColumn();

// Cast numeric types and decode JSON fields
foreach ($machines as &$m) {
    $m['id'] = (int)$m['id'];  $m['vlan'] = (int)$m['vlan'];  $m['sort_order'] = (int)$m['sort_order'];
}
unset($m);

foreach ($services as &$s) {
    $s['id']   = (int)$s['id'];  $s['port'] = (int)$s['port'];  $s['sort_order'] = (int)$s['sort_order'];
    $s['tags'] = json_decode($s['tags'] ?? '[]', true) ?: [];
}
unset($s);

foreach ($models as &$mo) {
    $mo['id'] = (int)$mo['id'];  $mo['vram_gb'] = (float)$mo['vram_gb'];  $mo['sort_order'] = (int)$mo['sort_order'];
}
unset($mo);

foreach ($workflows as &$w) {
    $w['id'] = (int)$w['id'];  $w['sort_order'] = (int)$w['sort_order'];
}
unset($w);

foreach ($vlans as &$v) { $v['id'] = (int)$v['id']; }   unset($v);
foreach ($unifi as &$u) { $u['id'] = (int)$u['id']; }   unset($u);

jsonOut([
    'machines'     => array_values($machines),
    'services'     => array_values($services),
    'models'       => array_values($models),
    'workflows'    => array_values($workflows),
    'pinned_notes' => array_values($notes),
    'network'      => [
        'gateway'       => $gw  ?: '',
        'device'        => $dev ?: '',
        'vlans'         => array_values($vlans),
        'unifi_devices' => array_values($unifi),
    ],
]);
