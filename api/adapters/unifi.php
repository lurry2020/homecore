<?php
/**
 * UniFi Network Application adapter
 * Supports both legacy Controller (/api/login) and UniFi OS (/api/auth/login + /proxy/network)
 */

function unifi_fetch(array $cfg): array {
    $host     = rtrim($cfg['host'], '/');
    $site     = $cfg['site'] ?: 'default';
    $verify   = (bool)$cfg['verify_ssl'];
    $unifiOs  = (bool)($cfg['unifi_os']   ?? false);
    $authMode = $cfg['auth_mode'] ?? 'credentials';

    // baseApi used for session auth path — overridden per auth_mode below
    $baseApi = $unifiOs ? "$host/proxy/network/api/s/$site" : "$host/api/s/$site";

    // ── API Key auth (UniFi Network App 8+, no 2FA required) ──────────────────
    if ($authMode === 'apikey') {
        $apiKey = $cfg['pass'];
        if (!$apiKey) return ['error' => 'API key is not configured'];

        $hdrs = ["X-API-Key: $apiKey", 'Content-Type: application/json'];

        // Auto-detect base path: UniFi OS uses /proxy/network prefix, standalone uses /api directly
        $candidates = [
            "$host/proxy/network/api/s/$site",  // UniFi OS (UDM, UCK Gen2+)
            "$host/api/s/$site",                // Standalone Network Application
        ];
        $baseApi = null;
        foreach ($candidates as $candidate) {
            $probe = _unifi_get("$candidate/stat/health", $verify, null, $hdrs);
            if (!empty($probe['data']) || ($probe['meta']['rc'] ?? '') === 'ok') {
                $baseApi = $candidate;
                break;
            }
        }
        if (!$baseApi) {
            return ['error' => 'API key auth failed — could not reach UniFi API. Check the host URL and API key.'];
        }

        $health  = _unifi_get("$baseApi/stat/health",      $verify, null, $hdrs);
        $devices = _unifi_get("$baseApi/stat/device",      $verify, null, $hdrs);
        $clients = _unifi_get("$baseApi/stat/sta",         $verify, null, $hdrs);
        $netconf = _unifi_get("$baseApi/rest/networkconf", $verify, null, $hdrs);

        return [
            'integration' => 'unifi',
            'wan'         => _unifi_wan($health['data']    ?? []),
            'devices'     => _unifi_devices($devices['data'] ?? []),
            'clients'     => _unifi_clients($clients['data'] ?? []),
            'vlans'       => _unifi_vlans($netconf['data'] ?? []),
            'fetched_at'  => time(),
        ];
    }

    // ── Username / Password auth (session cookie) ─────────────────────────────
    $user       = $cfg['user'];
    $pass       = $cfg['pass'];
    $cookieFile = sys_get_temp_dir() . '/unifi_sess_' . md5($host) . '.txt';
    $loginUrl   = $unifiOs ? "$host/api/auth/login" : "$host/api/login";

    $ch = _unifi_curl($loginUrl, $verify, $cookieFile);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['username' => $user, 'password' => $pass]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $cerr = curl_error($ch);
    curl_close($ch);

    if ($cerr)        return ['error' => "Connection failed: $cerr"];
    if ($code >= 400) return ['error' => "Login failed (HTTP $code) — check credentials. If 2FA is enabled, use API Key auth instead."];

    $csrf = '';
    if ($unifiOs) {
        $d    = json_decode($body ?: '{}', true);
        $csrf = $d['data']['csrfToken'] ?? ($d['csrfToken'] ?? '');
    }
    $hdrs = $csrf ? ["X-Csrf-Token: $csrf", 'Content-Type: application/json'] : ['Content-Type: application/json'];

    $health  = _unifi_get("$baseApi/stat/health",      $verify, $cookieFile, $hdrs);
    $devices = _unifi_get("$baseApi/stat/device",      $verify, $cookieFile, $hdrs);
    $clients = _unifi_get("$baseApi/stat/sta",         $verify, $cookieFile, $hdrs);
    $netconf = _unifi_get("$baseApi/rest/networkconf", $verify, $cookieFile, $hdrs);

    $ch = _unifi_curl($unifiOs ? "$host/api/auth/logout" : "$host/api/logout", $verify, $cookieFile);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '');
    curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrs);
    curl_exec($ch);
    curl_close($ch);
    @unlink($cookieFile);

    return [
        'integration' => 'unifi',
        'wan'         => _unifi_wan($health['data']    ?? []),
        'devices'     => _unifi_devices($devices['data'] ?? []),
        'clients'     => _unifi_clients($clients['data'] ?? []),
        'vlans'       => _unifi_vlans($netconf['data'] ?? []),
        'fetched_at'  => time(),
    ];
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function _unifi_curl(string $url, bool $verify, string $cookieFile): CurlHandle {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => $verify,
        CURLOPT_SSL_VERIFYHOST => $verify ? 2 : 0,
        CURLOPT_COOKIEJAR      => $cookieFile,
        CURLOPT_COOKIEFILE     => $cookieFile,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    return $ch;
}

function _unifi_get(string $url, bool $verify, ?string $cookieFile, array $hdrs = []): array {
    $ch = _unifi_curl($url, $verify, $cookieFile ?? '');
    if (!$cookieFile) {
        curl_setopt($ch, CURLOPT_COOKIEFILE, '');
        curl_setopt($ch, CURLOPT_COOKIEJAR,  '');
    }
    if ($hdrs) curl_setopt($ch, CURLOPT_HTTPHEADER, $hdrs);
    $body = curl_exec($ch);
    curl_close($ch);
    return json_decode($body ?: '{}', true) ?? [];
}

function _unifi_wan(array $health): array {
    foreach ($health as $h) {
        if (($h['subsystem'] ?? '') === 'wan') {
            return [
                'ip'         => $h['wan_ip']     ?? '',
                'rx_bps'     => $h['rx_bytes-r'] ?? 0,
                'tx_bps'     => $h['tx_bytes-r'] ?? 0,
                'latency_ms' => $h['latency']    ?? null,
                'uptime_sec' => $h['uptime']     ?? null,
                'status'     => ($h['status'] ?? '') === 'ok' ? 'online' : 'degraded',
            ];
        }
    }
    return [];
}

function _unifi_devices(array $raw): array {
    $types = ['uap' => 'Access Point', 'usw' => 'Switch', 'ugw' => 'Gateway', 'udm' => 'Dream Machine', 'uxg' => 'Gateway'];
    $out = [];
    foreach ($raw as $d) {
        $out[] = [
            'name'    => $d['name']    ?? ($d['hostname'] ?? $d['mac'] ?? ''),
            'ip'      => $d['ip']      ?? '',
            'mac'     => $d['mac']     ?? '',
            'type'    => $types[$d['type'] ?? ''] ?? 'Device',
            'model'   => $d['model']   ?? '',
            'status'  => ($d['state'] ?? 0) === 1 ? 'online' : 'offline',
            'uptime'  => $d['uptime']  ?? null,
            'clients' => $d['num_sta'] ?? 0,
            'version' => $d['version'] ?? '',
        ];
    }
    usort($out, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $out;
}

function _unifi_vlans(array $raw): array {
    $out = [];
    foreach ($raw as $n) {
        $purpose = $n['purpose'] ?? '';
        if ($purpose === 'wan' || empty($n['ip_subnet'])) continue;
        // UniFi returns router IP (e.g. 192.168.1.1/24); convert to network address (192.168.1.0/24)
        $subnet = _unifi_to_network_addr($n['ip_subnet']);
        // Untagged main LAN has no vlan field — UniFi displays it as VLAN 1
        $vlanId = (int)($n['vlan'] ?? 1);
        $out[] = [
            'name'    => $n['name'] ?? '',
            'vlan_id' => $vlanId,
            'subnet'  => $subnet,
            'dhcp'    => !empty($n['dhcpd_enabled']),
        ];
    }
    usort($out, fn($a, $b) => $a['vlan_id'] <=> $b['vlan_id']);
    return $out;
}

function _unifi_to_network_addr(string $cidr): string {
    [$ip, $prefix] = explode('/', $cidr) + [1 => '24'];
    $mask    = ~((1 << (32 - (int)$prefix)) - 1) & 0xFFFFFFFF;
    $network = ip2long($ip) & $mask;
    return long2ip($network) . '/' . $prefix;
}

function _unifi_clients(array $raw): array {
    $out = [];
    foreach ($raw as $c) {
        $out[] = [
            'hostname' => $c['hostname'] ?? ($c['name'] ?? ''),
            'ip'       => $c['ip']       ?? '',
            'mac'      => $c['mac']      ?? '',
            'vlan'     => $c['vlan']     ?? null,
            'type'     => isset($c['essid']) ? 'wireless' : 'wired',
            'ssid'     => $c['essid']    ?? '',
            'ap_name'  => $c['ap_name']  ?? '',
            'signal'   => $c['signal']   ?? null,    // dBm
            'uptime'   => $c['uptime']   ?? 0,
            'rx_bytes' => $c['rx_bytes'] ?? 0,
            'tx_bytes' => $c['tx_bytes'] ?? 0,
        ];
    }
    usort($out, fn($a, $b) => strcmp($a['hostname'] . $a['ip'], $b['hostname'] . $b['ip']));
    return $out;
}
