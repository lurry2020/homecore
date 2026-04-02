<?php
require_once __DIR__ . '/db.php';
require_once dirname(__DIR__) . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if (reqMethod() !== 'POST') {
    jsonOut(['error' => 'POST only'], 405);
}

$b  = reqBody();
$to = trim($b['to'] ?? '');

if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
    jsonOut(['error' => 'Please enter a valid email address.'], 400);
}

$db   = db();
$rows = $db->query("SELECT key, value FROM app_settings WHERE key LIKE 'smtp_%'")
           ->fetchAll(PDO::FETCH_KEY_PAIR);

$host = trim($rows['smtp_host'] ?? '');
$port = (int)($rows['smtp_port'] ?? 587);
$user = trim($rows['smtp_user'] ?? '');
$pass = smtpDecrypt($rows['smtp_pass'] ?? '');
$from = trim($rows['smtp_from'] ?? '');
$tls  = $rows['smtp_tls'] ?? 'tls';

if (!$host) {
    jsonOut(['error' => 'SMTP host is not configured. Save your SMTP settings first.'], 400);
}

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host      = $host;
    $mail->Port      = $port;
    $mail->Timeout   = 10;
    $mail->SMTPDebug = 0;

    if ($tls === 'ssl') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    } elseif ($tls === 'tls') {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure  = '';
        $mail->SMTPAutoTLS = false;
    }

    if ($user) {
        $mail->SMTPAuth = true;
        $mail->Username = $user;
        $mail->Password = $pass;
    }

    $fromAddr = $from ?: $user;
    if ($fromAddr) {
        $mail->setFrom($fromAddr, 'Homelab Dashboard');
    }

    $mail->addAddress($to);
    $mail->Subject = 'Homelab Dashboard — SMTP Test';
    $mail->isHTML(false);
    $mail->Body = implode("\n", [
        'This is a test email from your Homelab Dashboard.',
        '',
        'If you received this, your SMTP configuration is working correctly.',
        '',
        'Server: ' . $host . ':' . $port,
        'Encryption: ' . strtoupper($tls),
        'From: ' . ($fromAddr ?: '(none set)'),
    ]);

    $mail->send();
    jsonOut(['ok' => true, 'message' => 'Test email sent to ' . $to]);
} catch (Exception $e) {
    jsonOut(['error' => $mail->ErrorInfo ?: $e->getMessage()], 500);
}
