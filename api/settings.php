<?php
require_once __DIR__ . '/db.php';

$db  = db();
$met = reqMethod();

const THEME_DEFAULTS = [
    '--bg'              => '#060b16',
    '--bg-card'         => 'rgba(255,255,255,0.052)',
    '--bg-card-alt'     => 'rgba(255,255,255,0.030)',
    '--bg-sidebar'      => 'rgba(3,7,16,0.72)',
    '--border'          => 'rgba(255,255,255,0.10)',
    '--border-muted'    => 'rgba(255,255,255,0.07)',
    '--text'            => '#c9d1d9',
    '--text-muted'      => '#8b949e',
    '--text-subtle'     => '#505869',
    '--text-bright'     => '#e6edf3',
    '--green'           => '#3fb950',
    '--blue'            => '#58a6ff',
    '--purple'          => '#bc8cff',
    '--red'             => '#f85149',
    '--orange'          => '#d29922',
    '--cyan'            => '#39c5cf',
    '--yellow'          => '#e3b341',
    '--nav-active-color'=> '#3fb950',
    '--card-hover-bg'   => 'rgba(255,255,255,0.068)',
    '--card-accent'     => '#f85149',
];

const SYSTEM_DEFAULTS = [
    'sys_timezone' => 'America/New_York',
    'sys_zipcode'  => '',
    'calendar_ics_url' => '',
    'calendar_days'    => '30',
    'home_hidden_machine_ids' => '[]',
    'ignored_auto_services' => '[]',
    'smtp_host'    => '',
    'smtp_port'    => '587',
    'smtp_user'    => '',
    'smtp_pass'    => '',
    'smtp_from'    => '',
    'smtp_tls'     => 'tls',
    'home_layout'           => '[]',
    'topo_widget_viewport'  => '',
    'topo_show_grid'        => '1',
    'chat_enabled'            => '0',
    'chat_llm_provider'       => '',
    'chat_llm_url'            => '',
    'chat_llm_model'          => '',
    'chat_api_key_openai'     => '',
    'chat_api_key_claude'     => '',
    'chat_context_auto_regen' => '0',
    'dashboard_name'          => '',
    'net_integration' => '',
    'net_host'        => '',
    'net_site'        => 'default',
    'net_user'        => '',
    'net_pass'        => '',
    'net_verify_ssl'  => '0',
    'net_unifi_os'    => '0',
    'net_auth_mode'   => 'credentials',
    'tutorial_dismissed' => '0',
    'news_enabled' => '0',
    'news_sources' => '[{"id":"bbc","name":"BBC News","url":"https://feeds.bbci.co.uk/news/rss.xml","enabled":true},{"id":"reuters","name":"Reuters","url":"https://feeds.reuters.com/reuters/topNews","enabled":true},{"id":"apnews","name":"AP News","url":"https://rsshub.app/apnews/topics/apf-topnews","enabled":false},{"id":"npr","name":"NPR","url":"https://feeds.npr.org/1001/rss.xml","enabled":false},{"id":"guardian","name":"The Guardian","url":"https://www.theguardian.com/world/rss","enabled":false},{"id":"hn","name":"Hacker News","url":"https://hnrss.org/frontpage","enabled":false}]',
];

const ALL_DEFAULTS = THEME_DEFAULTS + SYSTEM_DEFAULTS;

if ($met === 'GET') {
    $rows = $db->query("SELECT key, value FROM app_settings")->fetchAll(PDO::FETCH_KEY_PAIR);
    $out  = array_merge(ALL_DEFAULTS, $rows);
    // Tell the frontend whether passwords/keys are stored, but never send ciphertext
    $out['smtp_pass_set']           = !empty($out['smtp_pass'])           ? '1' : '0';
    $out['smtp_pass']               = '';
    $out['chat_api_key_openai_set'] = !empty($out['chat_api_key_openai']) ? '1' : '0';
    $out['chat_api_key_openai']     = '';
    $out['chat_api_key_claude_set'] = !empty($out['chat_api_key_claude']) ? '1' : '0';
    $out['chat_api_key_claude']     = '';
    $out['net_pass_set'] = !empty($out['net_pass']) ? '1' : '0';
    $out['net_pass']     = '';
    unset($out['ha_token']);
    unset($out['auth_password_hash']);
    jsonOut($out);
}

if ($met === 'PUT') {
    $b   = reqBody();
    $ins = $db->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");
    foreach ($b as $k => $v) {
        if ($k === 'smtp_pass') {
            if ($v !== '') $ins->execute(['smtp_pass', smtpEncrypt($v)]);
            continue;
        }
        if ($k === 'chat_api_key_openai' || $k === 'chat_api_key_claude') {
            if ($v !== '') $ins->execute([$k, smtpEncrypt($v)]);
            continue;
        }
        if ($k === 'net_pass') {
            if ($v !== '') $ins->execute(['net_pass', smtpEncrypt($v)]);
            continue;
        }
        if (array_key_exists($k, ALL_DEFAULTS)) {
            $ins->execute([$k, $v]);
        }
    }
    jsonOut(['ok' => true]);
}

if ($met === 'DELETE') {
    // ?scope=theme resets only theme keys; default resets all
    $scope = $_GET['scope'] ?? 'all';
    if ($scope === 'theme') {
        $keys = array_keys(THEME_DEFAULTS);
        $in   = implode(',', array_fill(0, count($keys), '?'));
        $db->prepare("DELETE FROM app_settings WHERE key IN ($in)")->execute($keys);
    } else {
        $db->exec("DELETE FROM app_settings");
    }
    jsonOut(['ok' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);
