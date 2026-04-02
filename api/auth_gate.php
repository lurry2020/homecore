<?php
// Auto-prepended to every PHP/HTML request via .htaccess
// Passes static assets and the login/auth endpoints through; all else requires a session.

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Static assets — never need auth
if (preg_match('#\.(css|js|png|jpg|jpeg|svg|ico|woff2?|ttf|gif|webp|map)$#i', $uri)) return;

// Setup pages are always open
if (preg_match('#/(setup\.php|api/setup\.php)($|\?)#i', $uri)) return;

// Check if setup has been completed — if not, redirect everything to setup
$_dbPath = dirname(__DIR__) . '/data/homelab.db';
$_setupDone = false;
if (file_exists($_dbPath)) {
    try {
        $_pdo = new PDO('sqlite:' . $_dbPath);
        $_val = $_pdo->query("SELECT value FROM app_settings WHERE key='setup_complete'")->fetchColumn();
        $_setupDone = ($_val === '1');
    } catch (\Throwable $_e) {}
}
unset($_dbPath, $_pdo, $_val, $_e);

if (!$_setupDone) {
    $isXhr = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
          || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));
    if ($isXhr) {
        http_response_code(503);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Setup required']);
        exit;
    }
    header('Location: /dashboard3/setup.php');
    exit;
}
unset($_setupDone);

// Login page and auth API are open
if (preg_match('#/(login\.php|api/auth\.php)($|\?)#i', $uri)) return;

session_start();

if (empty($_SESSION['dashboard_auth'])) {
    // AJAX / JSON requests get a 401 instead of an HTML redirect
    $isXhr = !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
          || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));

    if ($isXhr) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    header('Location: /dashboard3/login.php');
    exit;
}
