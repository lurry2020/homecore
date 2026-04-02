<?php
require_once __DIR__ . '/db.php';

/* ── GET ?action=ollama_models — fetch model list from Ollama instance ───────── */
if (reqMethod() === 'GET' && ($_GET['action'] ?? '') === 'ollama_models') {
    $url = rtrim($_GET['url'] ?? '', '/');
    if (!$url) jsonOut(['error' => 'url required'], 422);
    $ch = curl_init($url . '/api/tags');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_SSL_VERIFYPEER => false,
    ]);
    $raw  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($err || !$raw) jsonOut(['error' => "Could not reach Ollama: $err"], 503);
    $data   = json_decode($raw, true);
    $models = array_column($data['models'] ?? [], 'name');
    sort($models);
    jsonOut(['models' => $models]);
}

if (reqMethod() !== 'POST') jsonOut(['error' => 'POST required'], 405);

$db  = db();
$b   = reqBody();

$userMsg = trim($b['message'] ?? '');
$system  = $b['system']  ?? null;
$history = $b['history'] ?? [];

if ($userMsg === '') jsonOut(['error' => 'No message provided'], 422);

// Load LLM config
$keys = ['chat_llm_provider','chat_llm_url','chat_llm_model','chat_api_key_openai','chat_api_key_claude'];
$in   = implode(',', array_fill(0, count($keys), '?'));
$rows = $db->prepare("SELECT key, value FROM app_settings WHERE key IN ($in)")
           ->execute($keys) ? null : null;
$stmt = $db->prepare("SELECT key, value FROM app_settings WHERE key IN ($in)");
$stmt->execute($keys);
$cfg = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

$provider  = $cfg['chat_llm_provider'] ?? '';
$baseUrl   = rtrim($cfg['chat_llm_url'] ?? '', '/');
$model     = $cfg['chat_llm_model']    ?? '';
$keyOpenAI = smtpDecrypt($cfg['chat_api_key_openai'] ?? '');
$keyClaude = smtpDecrypt($cfg['chat_api_key_claude'] ?? '');

if (!$provider) jsonOut(['error' => 'No LLM provider configured. Go to Settings → AI Assistant.'], 503);

// Build message array from history (exclude last user msg — sent as $userMsg)
$messages = [];
foreach ($history as $h) {
    if (isset($h['role'], $h['content'])) {
        $messages[] = ['role' => (string)$h['role'], 'content' => (string)$h['content']];
    }
}
$messages[] = ['role' => 'user', 'content' => $userMsg];

try {
    switch ($provider) {
        case 'ollama':
            $reply = callOllama($baseUrl ?: 'http://localhost:11434', $model ?: 'llama3', $messages, $system);
            break;
        case 'openai':
            if (!$keyOpenAI) jsonOut(['error' => 'OpenAI API key not configured.'], 503);
            $reply = callOpenAI($keyOpenAI, $model ?: 'gpt-4o', $messages, $system);
            break;
        case 'claude':
            if (!$keyClaude) jsonOut(['error' => 'Claude API key not configured.'], 503);
            $reply = callClaude($keyClaude, $model ?: 'claude-sonnet-4-6', $messages, $system);
            break;
        case 'custom':
            if (!$baseUrl) jsonOut(['error' => 'Custom endpoint URL not configured.'], 503);
            $reply = callOpenAI($keyOpenAI, $model, $messages, $system, $baseUrl);
            break;
        default:
            jsonOut(['error' => "Unknown provider: {$provider}"], 503);
    }
} catch (RuntimeException $e) {
    jsonOut(['error' => $e->getMessage()], 503);
}

jsonOut(['reply' => $reply]);

/* ── Provider implementations ─────────────────────────────────────────────────── */

function callOllama(string $url, string $model, array $messages, ?string $system): string {
    if ($system) {
        array_unshift($messages, ['role' => 'system', 'content' => $system]);
    }
    $raw  = httpPost($url . '/api/chat', [
        'model'    => $model,
        'messages' => $messages,
        'stream'   => false,
    ]);
    $data = json_decode($raw, true);
    if (isset($data['error'])) throw new RuntimeException('Ollama: ' . $data['error']);
    return $data['message']['content'] ?? 'No response from Ollama.';
}

function callOpenAI(string $apiKey, string $model, array $messages, ?string $system, string $baseUrl = 'https://api.openai.com'): string {
    if ($system) {
        array_unshift($messages, ['role' => 'system', 'content' => $system]);
    }
    $headers = ['Content-Type: application/json'];
    if ($apiKey) $headers[] = 'Authorization: Bearer ' . $apiKey;

    $raw  = httpPost($baseUrl . '/v1/chat/completions', [
        'model'    => $model,
        'messages' => $messages,
    ], $headers);
    $data = json_decode($raw, true);
    if (isset($data['error']['message'])) throw new RuntimeException('OpenAI: ' . $data['error']['message']);
    return $data['choices'][0]['message']['content'] ?? 'No response from OpenAI.';
}

function callClaude(string $apiKey, string $model, array $messages, ?string $system): string {
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ];
    $body = [
        'model'      => $model,
        'max_tokens' => 8096,
        'messages'   => $messages,
    ];
    if ($system) $body['system'] = $system;

    $raw  = httpPost('https://api.anthropic.com/v1/messages', $body, $headers);
    $data = json_decode($raw, true);
    if (isset($data['error']['message'])) throw new RuntimeException('Claude: ' . $data['error']['message']);
    if (isset($data['type']) && $data['type'] === 'error') {
        throw new RuntimeException('Claude: ' . ($data['error']['message'] ?? 'Unknown error'));
    }
    return $data['content'][0]['text'] ?? 'No response from Claude.';
}

function httpPost(string $url, array $body, array $headers = ['Content-Type: application/json']): string {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 120,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($body),
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
    ]);
    $raw = curl_exec($ch);
    $err = curl_error($ch);
    curl_close($ch);
    if ($err) throw new RuntimeException('cURL: ' . $err);
    if ($raw === false || $raw === '') throw new RuntimeException('Empty response from LLM endpoint.');
    return (string)$raw;
}
