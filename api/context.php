<?php
require_once __DIR__ . '/db.php';

define('CONTEXT_DIR',   dirname(__DIR__) . '/data/llm-context');
define('GUIDE_FILE',    CONTEXT_DIR . '/app-guide.md');
define('INFRA_FILE',    CONTEXT_DIR . '/infrastructure.md');
define('MACHINE_NOTES_DIR', dirname(__DIR__) . '/data/machine-notes');

$db     = db();
$met    = reqMethod();
$action = $_GET['action'] ?? '';

/* ── GET ─────────────────────────────────────────────────────────────────────── */
if ($met === 'GET') {
    ensureContextDir();

    // Guide — create from defaults if missing
    if (!file_exists(GUIDE_FILE)) {
        file_put_contents(GUIDE_FILE, defaultGuide(), LOCK_EX);
    }
    // Infrastructure — generate if missing
    if (!file_exists(INFRA_FILE)) {
        generateInfrastructure($db);
    }

    $guideContent = (string)file_get_contents(GUIDE_FILE);
    $infraContent = (string)file_get_contents(INFRA_FILE);
    [$mnContent, $mnCount] = loadMachineNotes($db);

    jsonOut([
        'guide' => [
            'content'     => $guideContent,
            'modified_at' => filemtime(GUIDE_FILE),
        ],
        'infrastructure' => [
            'content'      => $infraContent,
            'generated_at' => filemtime(INFRA_FILE),
        ],
        'machine_notes' => [
            'content' => $mnContent,
            'count'   => $mnCount,
        ],
    ]);
}

/* ── POST ?action=regenerate — re-generate infrastructure from live DB data ─── */
if ($met === 'POST' && $action === 'regenerate') {
    ensureContextDir();
    generateInfrastructure($db);
    jsonOut([
        'ok'           => true,
        'generated_at' => filemtime(INFRA_FILE),
    ]);
}


jsonOut(['error' => 'Method not allowed'], 405);

/* ═══════════════════════════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════════════════════════ */

function ensureContextDir(): void {
    if (!is_dir(CONTEXT_DIR)) mkdir(CONTEXT_DIR, 0755, true);
}

/**
 * Load all per-machine notes and return [combined_markdown, count].
 */
function loadMachineNotes(PDO $db): array {
    if (!is_dir(MACHINE_NOTES_DIR)) return ['', 0];

    $files = glob(MACHINE_NOTES_DIR . '/machine_*.md') ?: [];
    if (empty($files)) return ['', 0];

    // Build id→name map
    $names = $db->query("SELECT id, name FROM machines ORDER BY sort_order, id")
                ->fetchAll(PDO::FETCH_KEY_PAIR);

    $md    = '';
    $count = 0;
    foreach ($files as $path) {
        $raw = file_get_contents($path);
        if ($raw === false || trim($raw) === '') continue;
        $machId  = (int)substr(basename($path, '.md'), strlen('machine_'));
        $macName = $names[$machId] ?? "Machine {$machId}";
        $md     .= "### {$macName}\n\n" . rtrim($raw) . "\n\n---\n\n";
        $count++;
    }
    return [$md, $count];
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Infrastructure generator — pulls live data from the database
═══════════════════════════════════════════════════════════════════════════════ */

function generateInfrastructure(PDO $db): void {
    $nameRow  = $db->query("SELECT value FROM app_settings WHERE key='dashboard_name'")->fetchColumn();
    $dashName = (is_string($nameRow) && $nameRow !== '') ? $nameRow : 'Homelab';

    $md  = "# Infrastructure Context\n";
    $md .= 'Generated: ' . gmdate('Y-m-d H:i:s') . " UTC\n";
    $md .= "Dashboard: {$dashName}\n\n---\n\n";

    /* ── Machines ─────────────────────────────────────────────────────────── */
    $md .= "## Machines\n\n";
    $machines = $db->query(
        "SELECT id, name, ip, vlan, role, os, notes FROM machines ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (empty($machines)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| Name | IP | VLAN | Role | OS | Notes |\n";
        $md .= "|---|---|---|---|---|---|\n";
        foreach ($machines as $m) {
            $md .= '| ' . implode(' | ', [
                mdCell($m['name']), mdCell($m['ip']),   mdCell($m['vlan']),
                mdCell($m['role']), mdCell($m['os']),   mdCell($m['notes']),
            ]) . " |\n";
        }
        $md .= "\n";
    }

    /* ── Services ────────────────────────────────────────────────────────── */
    $md .= "## Services\n\n";
    $services = $db->query(
        "SELECT name, machine, type, port, url, tags, notes FROM services ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (empty($services)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| Name | Machine | Type | Port | URL | Tags | Notes |\n";
        $md .= "|---|---|---|---|---|---|---|\n";
        foreach ($services as $s) {
            $tags = implode(', ', json_decode($s['tags'] ?? '[]', true) ?: []);
            $md .= '| ' . implode(' | ', [
                mdCell($s['name']), mdCell($s['machine']), mdCell($s['type']),
                mdCell($s['port']), mdCell($s['url']),     mdCell($tags),
                mdCell($s['notes']),
            ]) . " |\n";
        }
        $md .= "\n";
    }

    /* ── AI Models ───────────────────────────────────────────────────────── */
    $md .= "## AI Models\n\n";
    $models = $db->query(
        "SELECT name, machine, vram_gb, best_for FROM models ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (empty($models)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| Name | Machine | VRAM (GB) | Best For |\n";
        $md .= "|---|---|---|---|\n";
        foreach ($models as $m) {
            $md .= '| ' . implode(' | ', [
                mdCell($m['name']), mdCell($m['machine']),
                mdCell($m['vram_gb']), mdCell($m['best_for']),
            ]) . " |\n";
        }
        $md .= "\n";
    }

    /* ── Workflows ───────────────────────────────────────────────────────── */
    $md .= "## Workflows\n\n";
    $workflows = $db->query(
        "SELECT name, machine, status, notes FROM workflows ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_ASSOC);

    if (empty($workflows)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| Name | Machine | Status | Notes |\n";
        $md .= "|---|---|---|---|\n";
        foreach ($workflows as $w) {
            $md .= '| ' . implode(' | ', [
                mdCell($w['name']), mdCell($w['machine']),
                mdCell($w['status']), mdCell($w['notes']),
            ]) . " |\n";
        }
        $md .= "\n";
    }

    /* ── Network ─────────────────────────────────────────────────────────── */
    $md .= "## Network\n\n";
    $netRows = $db->query(
        "SELECT key, value FROM network_config WHERE key IN ('gateway','device')"
    )->fetchAll(PDO::FETCH_KEY_PAIR);
    if (!empty($netRows['gateway'])) $md .= "Gateway: {$netRows['gateway']}  \n";
    if (!empty($netRows['device']))  $md .= "Device: {$netRows['device']}  \n";
    $md .= "\n";

    $vlans = $db->query(
        "SELECT vlan_id, name, subnet FROM vlans ORDER BY vlan_id"
    )->fetchAll(PDO::FETCH_ASSOC);
    $md .= "### VLANs\n\n";
    if (empty($vlans)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| VLAN ID | Name | Subnet |\n|---|---|---|\n";
        foreach ($vlans as $v) {
            $md .= "| {$v['vlan_id']} | " . mdCell($v['name']) . " | " . mdCell($v['subnet']) . " |\n";
        }
        $md .= "\n";
    }

    $unifi = $db->query(
        "SELECT name, ip, role FROM unifi_devices ORDER BY id"
    )->fetchAll(PDO::FETCH_ASSOC);
    $md .= "### UniFi Devices\n\n";
    if (empty($unifi)) {
        $md .= "(none)\n\n";
    } else {
        $md .= "| Name | IP | Role |\n|---|---|---|\n";
        foreach ($unifi as $u) {
            $md .= '| ' . implode(' | ', [
                mdCell($u['name']), mdCell($u['ip']), mdCell($u['role']),
            ]) . " |\n";
        }
        $md .= "\n";
    }

    /* ── Pinned Notes ────────────────────────────────────────────────────── */
    $md .= "## Pinned Notes\n\n";
    $notes = $db->query(
        "SELECT note FROM pinned_notes ORDER BY sort_order, id"
    )->fetchAll(PDO::FETCH_COLUMN);
    if (empty($notes)) {
        $md .= "(none)\n\n";
    } else {
        foreach ($notes as $note) {
            $flat = str_replace("\n", "  \n  ", trim($note));
            $md  .= "- {$flat}\n";
        }
        $md .= "\n";
    }

    file_put_contents(INFRA_FILE, $md, LOCK_EX);
}

/** Escape a value for a markdown table cell. */
function mdCell(mixed $val): string {
    return str_replace('|', '\\|', str_replace(["\r", "\n"], ' ', (string)($val ?? '')));
}

/* ═══════════════════════════════════════════════════════════════════════════════
   Default application guide — written to app-guide.md on first run.
   Users can freely edit this file; it is never overwritten automatically.
═══════════════════════════════════════════════════════════════════════════════ */

function defaultGuide(): string {
    return <<<'GUIDE'
# Application Guide

This is a homelab management dashboard. Below is a complete guide to its features and how to use them.

## Navigation
The sidebar on the left contains links to all pages:
- **Home** — customizable dashboard with widgets (machines, notes, calendar, weather, topology map, etc.)
- **Machines** — inventory of all servers and devices
- **Services** — all running services across machines
- **Machine Notes** — per-machine markdown documentation
- **Notes** — general pinned notes for the dashboard
- **Runbook** — operational runbooks and procedures
- **Topology** — interactive network topology/diagram editor
- **Home Assistant** — smart home integration and entity control
- **Settings** — appearance, system config, integrations, AI assistant
- **Models** — AI/LLM model registry (which models run on which machines)
- **Workflows** — automation workflow registry

---

## Home Page
The home page is a grid of widgets. Each widget can be moved, resized, and removed.

**Edit Layout mode** — Click the pencil/edit icon at the top right of the page to enter Edit Layout mode.
- In Edit Layout mode: drag widgets by their handle, resize by dragging the corner, click ✕ to remove a widget from the home page.
- Click **+ Add Widget** to add a removed widget back.
- Click **✓ Save** to persist the layout, or **✕ Cancel** to discard changes.

**Available widgets:**
- **Machines** — shows machine cards with live stats (CPU, RAM, uptime, services)
- **Notes** — pinned dashboard notes; click + Add Note to add one
- **Machine Notes** — shows recent per-machine markdown notes
- **Calendar** — upcoming events from a Google Calendar ICS feed
- **Weather** — current conditions based on ZIP code set in Settings
- **Topology Map** — read-only view of the network topology diagram
- **Stats** — system statistics widget
- **News** — RSS news feed widget

---

## Machines Page
Lists all registered machines. Each card shows IP, role, OS, uptime, CPU, RAM, and detected services.

**Adding a machine:** Click **+ Add Machine**, fill in name, IP, role, OS, SSH credentials, VLAN, then click Save.

**Editing a machine:** Click the pencil ✏ icon on the machine card.

**Deleting a machine:** Click the trash 🗑 icon (confirmation required).

**Supported OS types:** Linux (any), ESXi (6.7+), Proxmox (8.0+). Stats are polled via SSH every 30 seconds.

---

## Services Page
Shows all services — both manually added and auto-discovered via SSH polling.

**Adding a service manually:** Click **+ Add Service**, fill in name, machine, type, port, URL, tags, notes, login hint.

**Auto-discovered services:** The backend polls each machine via SSH and detects services by port, process name, container name, and systemd unit.

**Filtering:** Use the filter bar to filter by machine, type, or tag.

---

## Machine Notes
Each machine can have a markdown document attached to it.

**Viewing notes:** Click **Machine Notes** in the sidebar.

**Editing a note:** Click the edit icon on a note card. A markdown editor opens. Save when done.

---

## Notes (Pinned Notes)
Simple sticky notes pinned to the home dashboard.

**Adding a note:** Click **+ Add Note** in the Notes widget.

---

## Runbook
A markdown-based runbook page for operational procedures. Write free-form documentation. Changes are saved automatically.

---

## Topology Map
An interactive network diagram editor.

- Drag icons from the left panel onto the canvas to add nodes
- Click and drag nodes to reposition them
- Click **Connect** mode then click two nodes to draw a connection
- Click **Save** to persist the diagram

---

## Home Assistant Integration
Connect to a Home Assistant instance to view and control smart home entities.

**Setup:** Navigate to **Home Assistant** in the sidebar, enter your HA URL and a Long-Lived Access Token, then click Connect.

---

## Settings Page
Organized into collapsible accordion sections:

**Appearance** — Customize dashboard colors. Click **Reset to defaults** to revert.

**System & Integrations:** Regional settings, NTP, Calendar (Google ICS), SMTP email, AI Assistant configuration.

**News & Feeds** — Enable the news widget and configure RSS feed sources.

---

## AI Chat Assistant
A chat bubble (✦) appears in the bottom-right corner when enabled in Settings.

**Using the chat:** Click the ✦ bubble, type a message, press Enter. The assistant uses three knowledge sources:
1. **App Guide** — this file, describing how to use the dashboard
2. **Infrastructure** — live data about your machines, services, network, and notes
3. **Machine Notes** — per-machine markdown documentation you've written

Click **⟳ ctx** in the chat header to regenerate the infrastructure data.

---

## Models Page
Registry of AI/LLM models available across your homelab. Add entries with VRAM usage and intended use case.

## Workflows Page
Registry of n8n or other automation workflows. Track status, machine, and notes.

GUIDE;
}
