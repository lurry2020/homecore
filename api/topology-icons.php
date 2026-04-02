<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$base = realpath(__DIR__ . '/../assets/icons');
$dir  = $base . '/topology';
$files = [];

if ($dir && is_dir($dir)) {
    foreach (new DirectoryIterator($dir) as $f) {
        if ($f->isDot() || $f->isDir()) continue;
        $ext = strtolower($f->getExtension());
        if (!in_array($ext, ['png', 'svg', 'webp', 'jpg'])) continue;
        $files[] = $f->getFilename();
    }
    sort($files);
}

echo json_encode($files, JSON_UNESCAPED_SLASHES);
