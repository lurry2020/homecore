<?php
/**
 * OPNsense adapter — uses the built-in REST API with API key + secret
 * Auth: HTTP Basic (key as username, secret as password)
 */

function opnsense_fetch(array $cfg): array {
    $host   = rtrim($cfg['host'], '/');
    $key    = $cfg['user'];   // API key
    $secret = $cfg['pass'];   // API secret
    $verify = (bool)$cfg['verify_ssl'];

    $base = "$host/api";

    // ── Fetch all endpoints (parallel would be ideal; sequential is fine here) ─
    $sysStatus  = _opn_get("$base/core/system/status",                               $key, $secret, $verify);
    $ifStats    = _opn_get("$base/diagnostics/interface/getinterfacestatistics",      $key, $secret, $verify);
    $ifDetails  = _opn_get("$base/interfaces/overview/interfacesInfo",                $key, $secret, $verify);
    $arp        = _opn_get("$base/diagnostics/interface/getArp",                      $key, $secret, $verify);

    // DHCP leases — try ISC first, then Kea (OPNsense 24+)
    $leases = _opn_get("$base/dhcpv4/leases/searchLease",   $key, $secret, $verify);
    if (empty($leases['rows'] ?? [])) {
        $leases = _opn_get("$base/isc/dhcpv4/searchLease",  $key, $secret, $verify);
    }
    if (empty($leases['rows'] ?? [])) {
        $leases = _opn_get("$base/kea/leases4/search",       $key, $secret, $verify);
    }

    if (empty($sysStatus) && empty($ifStats)) {
        return ['error' => 'Could not connect to OPNsense API — check host, API key, and secret'];
    }

    return [
        'integration' => 'opnsense',
        'system'      => _opn_system($sysStatus),
        'wan'         => _opn_wan($ifDetails),
        'interfaces'  => _opn_interfaces($ifStats, $ifDetails),
        'leases'      => _opn_leases($leases),
        'arp'         => _opn_arp($arp),
        'fetched_at'  => time(),
    ];
}

// ── Internal helpers ───────────────────────────────────────────────────────────

function _opn_get(string $url, string $key, string $secret, bool $verify): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_SSL_VERIFYPEER => $verify,
        CURLOPT_SSL_VERIFYHOST => $verify ? 2 : 0,
        CURLOPT_USERPWD        => "$key:$secret",
        CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
        CURLOPT_TIMEOUT        => 12,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code >= 400 || !$body) return [];
    return json_decode($body, true) ?? [];
}

function _opn_system(array $d): array {
    if (empty($d)) return [];
    return [
        'hostname'  => $d['hostname']        ?? '',
        'version'   => $d['product_version'] ?? '',
        'uptime'    => $d['uptime']          ?? null,
        'cpu_pct'   => isset($d['cpu-usage'])  ? round((float)$d['cpu-usage'], 1)  : null,
        'mem_pct'   => isset($d['mem-usage'])  ? round((float)$d['mem-usage'], 1)  : null,
        'temp_c'    => $d['temp']            ?? null,
    ];
}

function _opn_wan(array $ifDetails): array {
    if (empty($ifDetails)) return [];
    foreach ($ifDetails as $iface) {
        $flags = strtolower($iface['flags'] ?? '');
        $role  = strtolower($iface['config_network_type'] ?? $iface['type'] ?? '');
        if ($role === 'wan' || strpos($flags, 'wan') !== false) {
            return [
                'interface' => $iface['identifier']  ?? $iface['device'] ?? '',
                'ip'        => $iface['ipv4'][0]['ipaddr'] ?? '',
                'status'    => ($iface['status'] ?? '') === 'up' ? 'online' : 'down',
            ];
        }
    }
    return [];
}

function _opn_interfaces(array $stats, array $details): array {
    // Build a lookup by device name from details
    $detailMap = [];
    foreach ($details as $d) {
        $dev = $d['device'] ?? $d['identifier'] ?? '';
        if ($dev) $detailMap[$dev] = $d;
    }

    $skip = ['lo0','lo1','enc0','pflog0','pfsync0','openvpn'];
    $out  = [];

    foreach ($stats as $name => $s) {
        if (in_array($name, $skip) || strpos($name, 'ovpn') === 0) continue;
        $detail = $detailMap[$name] ?? [];
        $out[] = [
            'name'      => $detail['description'] ?? $detail['identifier'] ?? $name,
            'device'    => $name,
            'ip'        => $detail['ipv4'][0]['ipaddr'] ?? '',
            'status'    => ($detail['status'] ?? 'unknown') === 'up' ? 'up' : 'down',
            'rx_bytes'  => $s['bytes received']     ?? 0,
            'tx_bytes'  => $s['bytes transmitted']  ?? 0,
            'rx_errors' => $s['input errors']       ?? 0,
            'tx_errors' => $s['output errors']      ?? 0,
        ];
    }

    usort($out, fn($a, $b) => strcmp($a['name'], $b['name']));
    return $out;
}

function _opn_leases(array $data): array {
    $rows = $data['rows'] ?? (isset($data[0]) ? $data : []);
    $out  = [];
    foreach ($rows as $l) {
        $out[] = [
            'ip'       => $l['address']  ?? $l['ip']       ?? '',
            'mac'      => $l['hwaddr']   ?? $l['mac']      ?? '',
            'hostname' => $l['hostname'] ?? '',
            'status'   => $l['binding']  ?? $l['status']   ?? 'active',
            'ends'     => $l['ends']     ?? $l['expire']   ?? '',
            'if'       => $l['if']       ?? $l['interface'] ?? '',
        ];
    }
    usort($out, fn($a, $b) => strcmp($a['ip'], $b['ip']));
    return $out;
}

function _opn_arp(array $data): array {
    if (!is_array($data)) return [];
    $out = [];
    foreach ($data as $e) {
        $ip = $e['ip'] ?? $e['Ip'] ?? '';
        if ($ip) {
            $out[] = [
                'ip'        => $ip,
                'mac'       => $e['mac']  ?? $e['Mac']       ?? '',
                'hostname'  => $e['hostname'] ?? '',
                'interface' => $e['intf'] ?? $e['Interface'] ?? '',
            ];
        }
    }
    return $out;
}
