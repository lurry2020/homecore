<?php
require_once __DIR__ . '/db.php';

$db = db();
$tz = $db->query("SELECT value FROM app_settings WHERE key='sys_timezone'")->fetchColumn();
if (!$tz) $tz = 'America/New_York';

try {
    $dt = new DateTime('now', new DateTimeZone($tz));
} catch (Exception $e) {
    $dt = new DateTime('now');
}

jsonOut([
    'time' => $dt->format('g:i A'),      // e.g. 3:45 PM
    'date' => $dt->format('l, F j, Y'),   // e.g. Tuesday, March 17, 2026
    'tz'   => $tz,
]);
