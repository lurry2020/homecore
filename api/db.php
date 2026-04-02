<?php
define('DB_PATH',   dirname(__DIR__) . '/data/homelab.db');
define('JSON_PATH', dirname(__DIR__) . '/data/services.json');

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $isNew = !file_exists(DB_PATH);
    $pdo   = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL;');

    schema($pdo);
    if ($isNew) seed($pdo);
    return $pdo;
}

function schema(PDO $db): void {
    $db->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS machines (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        ip         TEXT    DEFAULT '',
        vlan       INTEGER DEFAULT 1,
        role       TEXT    DEFAULT '',
        os         TEXT    DEFAULT '',
        notes      TEXT    DEFAULT '',
        icon       TEXT    DEFAULT '🖥️',
        sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS services (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        machine    TEXT    DEFAULT '',
        backend_key TEXT   DEFAULT '',
        source     TEXT    DEFAULT 'manual',
        ip         TEXT    DEFAULT '',
        port       INTEGER DEFAULT 80,
        url        TEXT    DEFAULT '',
        type       TEXT    DEFAULT '',
        deployment TEXT    DEFAULT '',
        login_hint TEXT    DEFAULT '',
        tags       TEXT    DEFAULT '[]',
        notes      TEXT    DEFAULT '',
        icon       TEXT    DEFAULT '⚙️',
        sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS models (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        machine    TEXT    DEFAULT '',
        vram_gb    REAL    DEFAULT 0,
        best_for   TEXT    DEFAULT '',
        icon       TEXT    DEFAULT '🤖',
        sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS workflows (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        machine    TEXT    DEFAULT '',
        status     TEXT    DEFAULT 'active',
        notes      TEXT    DEFAULT '',
        icon       TEXT    DEFAULT '⚡',
        sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS vlans (
        id      INTEGER PRIMARY KEY AUTOINCREMENT,
        vlan_id INTEGER,
        name    TEXT DEFAULT '',
        subnet  TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS unifi_devices (
        id   INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT DEFAULT '',
        ip   TEXT DEFAULT '',
        role TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS network_config (
        key   TEXT PRIMARY KEY,
        value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS pinned_notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        note       TEXT    NOT NULL,
        sort_order INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS app_settings (
        key   TEXT PRIMARY KEY,
        value TEXT DEFAULT ''
    );
    SQL);

    ensureColumn($db, 'services', 'backend_key', "TEXT DEFAULT ''");
    ensureColumn($db, 'services', 'source', "TEXT DEFAULT 'manual'");
}

function ensureColumn(PDO $db, string $table, string $column, string $definition): void {
    $cols = $db->query("PRAGMA table_info($table)")->fetchAll();
    foreach ($cols as $col) {
        if (($col['name'] ?? '') === $column) return;
    }
    $db->exec("ALTER TABLE $table ADD COLUMN $column $definition");
}

function seed(PDO $db): void {
    if (!file_exists(JSON_PATH)) return;
    $d = json_decode(file_get_contents(JSON_PATH), true);
    if (!$d) return;

    // Machine name → PNG icon
    $mi = [
        'sentinel' => 'ollama.png',   'relay'   => 'n8n.png',
        'forge'    => 'apache.png',   'vault'   => 'nextcloud.png',
        'horizon'  => 'zabbix.png',   'nova'    => 'pihole.png',
        'pulse'    => 'pihole.png',
    ];
    // Service name → PNG icon (checked first)
    $si = [
        'Open WebUI'        => 'open-webui.png',
        'Ollama'            => 'ollama.png',
        'SearXNG'           => 'searxng.png',
        'Qdrant'            => 'docker.png',
        'n8n'               => 'n8n.png',
        'Nextcloud'         => 'nextcloud.png',
        'Zabbix'            => 'zabbix.png',
        'Pi-hole Primary'   => 'pihole.png',
        'Pi-hole Secondary' => 'pihole.png',
    ];
    // Service type → PNG icon (fallback)
    $ti = [
        'AI' => 'ollama.png', 'Automation' => 'n8n.png', 'Storage' => 'nextcloud.png',
        'Monitoring' => 'zabbix.png', 'DNS' => 'pihole.png', 'Search' => 'searxng.png',
    ];

    foreach ($d['machines'] ?? [] as $i => $m) {
        $db->prepare("INSERT INTO machines (name,ip,vlan,role,os,notes,icon,sort_order) VALUES (?,?,?,?,?,?,?,?)")
           ->execute([$m['name'], $m['ip'], $m['vlan'], $m['role'], $m['os'], $m['notes'],
                      $mi[strtolower($m['name'])] ?? 'docker.png', $i]);
    }
    foreach ($d['services'] ?? [] as $i => $s) {
        $icon = $si[$s['name']] ?? $ti[$s['type']] ?? 'docker.png';
        $db->prepare("INSERT INTO services (name,machine,ip,port,url,type,deployment,login_hint,tags,notes,icon,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
           ->execute([$s['name'], $s['machine'], $s['ip'], $s['port'], $s['url'],
                      $s['type'], $s['deployment'], $s['login_hint'],
                      json_encode($s['tags'] ?? []), $s['notes'], $icon, $i]);
    }
    foreach ($d['models'] ?? [] as $i => $m) {
        $db->prepare("INSERT INTO models (name,machine,vram_gb,best_for,icon,sort_order) VALUES (?,?,?,?,?,?)")
           ->execute([$m['name'], $m['machine'], $m['vram_gb'], $m['best_for'], 'ollama.png', $i]);
    }
    foreach ($d['workflows'] ?? [] as $i => $w) {
        $db->prepare("INSERT INTO workflows (name,machine,status,notes,icon,sort_order) VALUES (?,?,?,?,?,?)")
           ->execute([$w['name'], $w['machine'], $w['status'], $w['notes'], 'n8n.png', $i]);
    }

    $net = $d['network'] ?? [];
    $ins = $db->prepare("INSERT OR REPLACE INTO network_config (key,value) VALUES (?,?)");
    $ins->execute(['gateway', $net['gateway'] ?? '']);
    $ins->execute(['device',  $net['device']  ?? '']);
    foreach ($net['vlans'] ?? [] as $v) {
        $db->prepare("INSERT INTO vlans (vlan_id,name,subnet) VALUES (?,?,?)")
           ->execute([$v['id'], $v['name'], $v['subnet']]);
    }
    foreach ($net['unifi_devices'] ?? [] as $ud) {
        $db->prepare("INSERT INTO unifi_devices (name,ip,role) VALUES (?,?,?)")
           ->execute([$ud['name'], $ud['ip'], $ud['role']]);
    }
    foreach ($d['pinned_notes'] ?? [] as $i => $n) {
        $db->prepare("INSERT INTO pinned_notes (note,sort_order) VALUES (?,?)")
           ->execute([$n, $i]);
    }
}

// ── SMTP password encryption ──────────────────────────────────────────────────
define('SMTP_KEY_PATH', dirname(__DIR__) . '/data/.smtp_key');

function smtpKey(): string {
    if (!file_exists(SMTP_KEY_PATH)) {
        file_put_contents(SMTP_KEY_PATH, bin2hex(random_bytes(32)));
        chmod(SMTP_KEY_PATH, 0600);
    }
    return hex2bin(trim(file_get_contents(SMTP_KEY_PATH)));
}

function smtpEncrypt(string $plaintext): string {
    $iv  = random_bytes(16);
    $enc = openssl_encrypt($plaintext, 'AES-256-CBC', smtpKey(), OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $enc);
}

function smtpDecrypt(string $stored): string {
    if ($stored === '') return '';
    $raw = base64_decode($stored, true);
    if ($raw === false || strlen($raw) < 17) return '';
    $dec = openssl_decrypt(substr($raw, 16), 'AES-256-CBC', smtpKey(), OPENSSL_RAW_DATA, substr($raw, 0, 16));
    return $dec === false ? '' : $dec;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function jsonOut(mixed $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function reqBody(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function reqMethod(): string { return $_SERVER['REQUEST_METHOD']; }
function reqId(): ?int       { return isset($_GET['id']) ? (int)$_GET['id'] : null; }

function castInts(array &$rows, array $fields): void {
    foreach ($rows as &$r) foreach ($fields as $f) if (isset($r[$f])) $r[$f] = (int)$r[$f];
    unset($r);
}
