<?php
require_once __DIR__ . '/db.php';

// Auth endpoint is open — do NOT require session here
session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body     = json_decode(file_get_contents('php://input'), true) ?? [];
    $password = trim($body['password'] ?? '');

    if ($password === '') {
        jsonOut(['error' => 'Password required'], 400);
    }

    $db   = db();
    $hash = $db->query("SELECT value FROM app_settings WHERE key='auth_password_hash'")->fetchColumn();

    if ($hash && password_verify($password, $hash)) {
        session_regenerate_id(true);
        $_SESSION['dashboard_auth'] = true;
        jsonOut(['ok' => true]);
    }

    jsonOut(['error' => 'Incorrect password'], 401);
}

if ($method === 'PATCH') {
    if (empty($_SESSION['dashboard_auth'])) { jsonOut(['error' => 'Unauthorized'], 401); }
    $body        = json_decode(file_get_contents('php://input'), true) ?? [];
    $current     = trim($body['current']  ?? '');
    $newPw       = trim($body['new']      ?? '');
    $confirm     = trim($body['confirm']  ?? '');

    if ($current === '' || $newPw === '' || $confirm === '') {
        jsonOut(['error' => 'All fields are required'], 400);
    }
    if ($newPw !== $confirm) {
        jsonOut(['error' => 'New passwords do not match'], 400);
    }

    $db   = db();
    $hash = $db->query("SELECT value FROM app_settings WHERE key='auth_password_hash'")->fetchColumn();
    if (!$hash || !password_verify($current, $hash)) {
        jsonOut(['error' => 'Current password is incorrect'], 403);
    }

    $newHash = password_hash($newPw, PASSWORD_BCRYPT);
    $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('auth_password_hash', ?)")->execute([$newHash]);
    jsonOut(['ok' => true]);
}

if ($method === 'GET' && ($_GET['action'] ?? '') === 'logout') {
    $_SESSION = [];
    session_destroy();
    header('Location: /dashboard3/login.php');
    exit;
}

jsonOut(['error' => 'Method not allowed'], 405);
