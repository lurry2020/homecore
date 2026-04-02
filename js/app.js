/* ─── Config ──────────────────────────────────────────────────────────────────── */
const IS_SUBPAGE   = location.pathname.includes('/pages/');
const ROOT         = IS_SUBPAGE ? '../' : './';
const CURRENT_PAGE = document.body.dataset.page || 'home';
const ICONS_PATH   = ROOT + 'assets/icons/';
const BACKEND_API_ROOT = `${location.protocol}//${location.hostname}:4000/api`;

/* ─── Authenticated fetch — redirects to login on 401 ───────────────────────── */
const _nativeFetch = window.fetch.bind(window);
window.fetch = async function(...args) {
  const res = await _nativeFetch(...args);
  if (res.status === 401) {
    window.location.href = '/dashboard3/login.php';
    return res;
  }
  return res;
};

/* ─── Machine / Type colors ──────────────────────────────────────────────────── */
function mc(_name) { return 'var(--card-accent)'; }
function tc(_type) { return 'var(--card-accent)'; }

/* ─── Available PNG icons ────────────────────────────────────────────────────── */
const AVAILABLE_ICONS = [
  'adguard-home.png','apache.png','caddy.png','docker.png',
  'home-assistant.png','immich.png','jellyfin.png','minecraft.png',
  'n8n.png','nextcloud.png','nginx-proxy-manager.png','ollama.png',
  'open-webui.png','pihole.png','plex.png','portainer.png',
  'proxmox.png','rclone.png','searxng.png','tailscale-light.png',
  'truenas.png','ubiquiti-unifi.png','uptime-kuma.png','vaultwarden.png',
  'vmware-esxi.png','wireguard.png','zabbix.png',
];

const BACKEND_SERVICE_DEFAULTS = {
  'Pi-hole':     { icon: 'pihole.png',     deployment: 'Auto-discovered', defaultPort: 80, healthPort: 80 },
  'AdGuard Home': { icon: 'adguard-home.png', deployment: 'Auto-discovered', defaultPort: 3000, healthPort: 3000 },
  'Nginx Proxy Manager': { icon: 'nginx-proxy-manager.png', deployment: 'Auto-discovered', defaultPort: 81, healthPort: 81 },
  'Traefik':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 8080, healthPort: 8080 },
  'Nextcloud':   { icon: 'nextcloud.png',  deployment: 'Auto-discovered', defaultPort: 80 },
  'Vaultwarden': { icon: 'vaultwarden.png', deployment: 'Auto-discovered', defaultPort: 8080 },
  'Portainer':   { icon: 'portainer.png',  deployment: 'Auto-discovered', defaultPort: 9443, healthPort: 9443 },
  'Grafana':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 3000 },
  'Prometheus':  { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9090 },
  'Zabbix':      { icon: 'zabbix.png',     deployment: 'Auto-discovered', defaultPort: 10051 },
  'Uptime Kuma': { icon: 'uptime-kuma.png', deployment: 'Auto-discovered', defaultPort: 3001 },
  'Netdata':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 19999 },
  'Jellyfin':    { icon: 'jellyfin.png',   deployment: 'Auto-discovered', defaultPort: 8096 },
  'Plex':        { icon: 'plex.png',       deployment: 'Auto-discovered', defaultPort: 32400 },
  'Immich':      { icon: 'immich.png',     deployment: 'Auto-discovered', defaultPort: 2283 },
  'PhotoPrism':  { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 2342 },
  'Paperless-ngx': { icon: 'docker.png',   deployment: 'Auto-discovered', defaultPort: 8000 },
  'Mealie':      { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9000 },
  'Gitea':       { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 3000 },
  'Forgejo':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 3000 },
  'Woodpecker CI': { icon: 'docker.png',   deployment: 'Auto-discovered', defaultPort: 8000 },
  'Ollama':      { icon: 'ollama.png',     deployment: 'Auto-discovered', defaultPort: 11434 },
  'Open WebUI':  { icon: 'open-webui.png', deployment: 'Auto-discovered', defaultPort: 8080 },
  'Qdrant':      { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 6333 },
  'SearXNG':     { icon: 'searxng.png',    deployment: 'Auto-discovered', defaultPort: 8888 },
  'n8n':         { icon: 'n8n.png',        deployment: 'Auto-discovered', defaultPort: 5678 },
  'Home Assistant': { icon: 'home-assistant.png', deployment: 'Auto-discovered', defaultPort: 8123 },
  'Node-RED':    { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 1880 },
  'Authentik':   { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9000 },
  'Keycloak':    { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 8080 },
  'WireGuard':   { icon: 'wireguard.png',  deployment: 'Auto-discovered', defaultPort: 51820, healthcheck: 'detected' },
  'Tailscale':   { icon: 'tailscale-light.png', deployment: 'Auto-discovered', healthcheck: 'detected' },
  'Headscale':   { icon: 'tailscale-light.png', deployment: 'Auto-discovered', defaultPort: 8080 },
  'Netbird':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 33073, healthcheck: 'detected' },
  'Tandoor':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 8080 },
  'BookStack':   { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 6875 },
  'Outline':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 3000 },
  'Linkding':    { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9090 },
  'Stirling PDF': { icon: 'docker.png',    deployment: 'Auto-discovered', defaultPort: 8080 },
  'IT-Tools':    { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 8080 },
  'Healthchecks': { icon: 'docker.png',    deployment: 'Auto-discovered', defaultPort: 8000 },
  'Gotify':      { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 80 },
  'ntfy':        { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 80 },
  'MinIO':       { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9001, healthPort: 9001 },
  'Longhorn':    { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9500 },
  'Proxmox':     { icon: 'proxmox.png',    deployment: 'Auto-discovered', defaultPort: 8006 },
  'Cockpit':     { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 9090 },
  'Semaphore':   { icon: 'docker.png',     deployment: 'Auto-discovered', defaultPort: 3000 },
  'Minecraft':   { icon: 'minecraft.png',  deployment: 'Auto-discovered', defaultPort: 25565, healthcheck: 'detected' },
  'Docker Engine': { icon: 'docker.png',   deployment: 'Auto-discovered', healthcheck: 'detected' },
  'Rclone':      { icon: 'rclone.png',     deployment: 'Auto-discovered', defaultPort: 5572 },
  'Nginx':       { icon: 'nginx-proxy-manager.png', deployment: 'Auto-discovered', defaultPort: 80 },
  'Apache2':     { icon: 'apache.png',     deployment: 'Auto-discovered', defaultPort: 80 },
  'Caddy':       { icon: 'caddy.png',      deployment: 'Auto-discovered', defaultPort: 80 }
};

/* ─── Icon renderer ──────────────────────────────────────────────────────────── */
/**
 * Returns an HTML string for an icon.
 * If `icon` looks like a filename (.png/.svg/.jpg) → <img>
 * Otherwise treats it as emoji → <span>
 */
function renderIcon(icon, size = 16) {
  if (!icon) return `<span class="entity-icon" style="font-size:${size}px">⚙️</span>`;
  if (/\.(png|svg|jpg|webp)$/i.test(icon)) {
    return `<img src="${ICONS_PATH}${icon}" class="entity-icon-img" width="${size}" height="${size}" alt="" loading="lazy">`;
  }
  return `<span class="entity-icon" style="font-size:${Math.round(size * 0.9)}px;line-height:1">${icon}</span>`;
}

/* ─── State ──────────────────────────────────────────────────────────────────── */
let DATA = null;
let serviceFilters = { machine: 'all', type: 'all', tag: 'all', search: '' };
let CHAT_CONTEXT    = null;   // assembled system-prompt string sent to the LLM
let CHAT_CONTEXT_TS = null;   // infrastructure.md generated_at unix timestamp
let _chatHistory    = [];     // [{role:'user'|'assistant', content:'...'}]
let SETTINGS = null;
let HOME_HIDDEN_MACHINE_IDS  = [];
let HOME_HIDDEN_MNOTE_IDS    = [];
let IGNORED_AUTO_SERVICE_KEYS = [];

function backendMachineKey(name) {
  return String(name || '').trim().toLowerCase();
}

function serviceIdentityKey(service) {
  return String(service.backend_key || `${backendMachineKey(service.machine)}::${String(service.name || '').trim().toLowerCase()}`);
}

function backendServiceToFrontendService(service) {
  const defaults = BACKEND_SERVICE_DEFAULTS[service.name] || {};
  const detectedPort = service.matched_ports?.[0] ?? null;
  const port = defaults.defaultPort ?? detectedPort ?? '';
  const healthPort = defaults.healthPort ?? port;
  const isDetectedHealthy = defaults.healthcheck === 'detected' || service.type === 'Unknown';
  const scheme = Number(healthPort) === 443 ? 'https' : 'http';
  const url = !isDetectedHealthy && service.ip && healthPort ? `${scheme}://${service.ip}:${healthPort}` : '';
  const evidence = Array.isArray(service.evidence) ? service.evidence : [];
  const confidence = service.confidence || 'observed';
  return {
    id: `auto:${backendMachineKey(service.machine)}:${String(service.name || '').toLowerCase().replace(/\s+/g, '-')}`,
    backend_key: service.key || `${backendMachineKey(service.machine)}::${String(service.name || '').trim().toLowerCase()}`,
    source: 'auto',
    name: service.name,
    machine: service.machine,
    ip: service.ip || '',
    port: Number(port) || 0,
    url,
    type: service.type || 'Other',
    deployment: defaults.deployment || 'Auto-discovered',
    login_hint: `Detected via SSH (${confidence})`,
    tags: ['auto-discovered', confidence, ...evidence.slice(0, 2)],
    notes: `Detected on ${service.machine}${evidence.length ? ` by ${evidence.join(', ')}` : ''}`,
    icon: defaults.icon || 'docker.png',
    backend_discovered: true,
    detected_healthy: isDetectedHealthy,
    confidence,
  };
}

function applyBackendData(backendMachines = [], backendServices = []) {
  if (!DATA) return;

  DATA.backend_machines_raw = backendMachines;
  DATA.backend_services_raw = backendServices;

  const manualMachines = DATA.manual_machines || [];
  const manualServices = DATA.manual_services || [];
  const manualMachineKeys = new Set(manualMachines.map(machine => backendMachineKey(machine.name)));
  const backendByName = new Map(backendMachines.map(machine => [backendMachineKey(machine.name), machine]));
  const mergedMachines = manualMachines.map(machine => {
    const backend = backendByName.get(backendMachineKey(machine.name));
    return {
      ...machine,
      ssh_user: backend?.ssh_user || machine.ssh_user || '',
      snapshot: backend?.snapshot || null,
      backend_managed: Boolean(backend),
    };
  });

  const manualServiceKeys = new Set(manualServices.map(serviceIdentityKey));
  const ignoredServiceKeys = new Set(IGNORED_AUTO_SERVICE_KEYS);
  const autoServices = backendServices
    .filter(service => manualMachineKeys.has(backendMachineKey(service.machine)))
    .filter(service => !ignoredServiceKeys.has(String(service.key || '')))
    .filter(service => !manualServiceKeys.has(serviceIdentityKey(service)))
    .map(backendServiceToFrontendService);

  DATA.machines = mergedMachines;
  DATA.services = [...manualServices, ...autoServices];
}

async function backendFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BACKEND_API_ROOT}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function refreshBackendIntegration() {
  if (!DATA) return;
  try {
    const [backendMachines, backendServices] = await Promise.all([
      backendFetch('/machines'),
      backendFetch('/services'),
    ]);
    applyBackendData(backendMachines, backendServices);
  } catch (error) {
    console.warn('Backend sync unavailable', error);
    applyBackendData([], []);
  }
}

/* ─── Theme ──────────────────────────────────────────────────────────────────── */
async function applyTheme() {
  try {
    const settings = await getSettings();
    if (!settings) return;
    const root = document.documentElement;
    Object.entries(settings).forEach(([k, v]) => root.style.setProperty(k, v));
    document.body.classList.toggle('topo-grid-off', settings.topo_show_grid === '0');
  } catch { /* non-fatal */ }
}

async function getSettings() {
  if (SETTINGS) return SETTINGS;
  try {
    const res = await fetch(ROOT + 'api/settings.php');
    if (!res.ok) return;
    SETTINGS = await res.json();
    return SETTINGS;
  } catch { /* non-fatal */ }
  return null;
}

function parseHiddenMachineIds(raw) {
  try {
    const ids = JSON.parse(raw || '[]');
    return Array.isArray(ids) ? ids.map(id => Number.parseInt(id, 10)).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function parseIgnoredAutoServiceKeys(raw) {
  try {
    const keys = JSON.parse(raw || '[]');
    return Array.isArray(keys) ? keys.map(key => String(key).trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

async function getHiddenHomeMachineIds() {
  const settings = await getSettings();
  HOME_HIDDEN_MACHINE_IDS = parseHiddenMachineIds(settings?.home_hidden_machine_ids);
  return HOME_HIDDEN_MACHINE_IDS;
}

async function getIgnoredAutoServiceKeys() {
  const settings = await getSettings();
  IGNORED_AUTO_SERVICE_KEYS = parseIgnoredAutoServiceKeys(settings?.ignored_auto_services);
  return IGNORED_AUTO_SERVICE_KEYS;
}

async function saveHiddenHomeMachineIds(ids) {
  HOME_HIDDEN_MACHINE_IDS = [...new Set(ids.map(id => Number.parseInt(id, 10)).filter(Number.isFinite))];
  if (SETTINGS) SETTINGS.home_hidden_machine_ids = JSON.stringify(HOME_HIDDEN_MACHINE_IDS);
  const res = await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ home_hidden_machine_ids: JSON.stringify(HOME_HIDDEN_MACHINE_IDS) }),
  });
  if (!res.ok) throw new Error('Could not save dashboard machine visibility');
}

async function getHiddenHomeMnoteIds() {
  const settings = await getSettings();
  HOME_HIDDEN_MNOTE_IDS = parseHiddenMachineIds(settings?.home_hidden_mnote_ids);
  return HOME_HIDDEN_MNOTE_IDS;
}

async function saveHiddenHomeMnoteIds(ids) {
  HOME_HIDDEN_MNOTE_IDS = [...new Set(ids.map(id => Number.parseInt(id, 10)).filter(Number.isFinite))];
  if (SETTINGS) SETTINGS.home_hidden_mnote_ids = JSON.stringify(HOME_HIDDEN_MNOTE_IDS);
  await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ home_hidden_mnote_ids: JSON.stringify(HOME_HIDDEN_MNOTE_IDS) }),
  });
}

async function saveIgnoredAutoServiceKeys(keys) {
  IGNORED_AUTO_SERVICE_KEYS = [...new Set(keys.map(key => String(key).trim()).filter(Boolean))];
  if (SETTINGS) SETTINGS.ignored_auto_services = JSON.stringify(IGNORED_AUTO_SERVICE_KEYS);
  const res = await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ignored_auto_services: JSON.stringify(IGNORED_AUTO_SERVICE_KEYS) }),
  });
  if (!res.ok) throw new Error('Could not save ignored auto services');
}

/* ─── Bootstrap ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  renderSidebar();
  document.body.insertAdjacentHTML('beforeend', '<div id="toast-container"></div>');
  document.body.insertAdjacentHTML('beforeend', buildChatHTML());
  initChatBubble();
  try {
    const res = await fetch(ROOT + 'api/data.php');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
    DATA.manual_machines = [...DATA.machines];
    DATA.manual_services = [...DATA.services];
    await getIgnoredAutoServiceKeys();
    await refreshBackendIntegration();
    renderPage();
    pingAllServices();
    showTutorialIfNeeded();
  } catch (e) {
    document.getElementById('page-content').innerHTML =
      `<div class="error-msg">Failed to load data — ${e.message}</div>`;
  }
});

/* ─── Sidebar ────────────────────────────────────────────────────────────────── */
function renderSidebar() {
  const nav = [
    { id: 'home',      icon: '⌂', label: 'Home',      href: ROOT + 'index.html' },
    { id: 'services',  icon: '◈', label: 'Services',  href: ROOT + 'pages/services.html' },
    { id: 'machines',  icon: '⬡', label: 'Machines',  href: ROOT + 'pages/machines.html' },
    { id: 'network',   icon: '⬢', label: 'Network',   href: ROOT + 'pages/network.html' },
    { id: 'models',    icon: '◎', label: 'Models',    href: ROOT + 'pages/models.html' },
    { id: 'workflows', icon: '⟳', label: 'Workflows', href: ROOT + 'pages/workflows.html' },
    { id: 'notes',     icon: '◧', label: 'Notes',     href: ROOT + 'pages/notes.html' },
    { id: 'runbook',   icon: '▤', label: 'Runbook',   href: ROOT + 'pages/runbook.html' },
    { id: 'topology',        icon: '⬡', label: 'Topology',       href: ROOT + 'pages/topology.html' },
    { id: 'homeassistant',  icon: '⌂', label: 'Home Assistant', href: ROOT + 'pages/homeassistant.html' },
  ];
  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-logo">
      <span class="logo-icon">◈</span>
      <span class="logo-text">Homelab</span>
    </div>
    <nav class="sidebar-nav">
      ${nav.map(n => `
        <a href="${n.href}" class="nav-item${CURRENT_PAGE === n.id ? ' active' : ''}">
          <span class="nav-icon">${n.icon}</span>
          <span class="nav-label">${n.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-bottom">
      <a href="${ROOT}pages/settings.html" class="nav-item nav-item-settings${CURRENT_PAGE === 'settings' ? ' active' : ''}">
        <span class="nav-icon">⚙</span>
        <span class="nav-label">Settings</span>
      </a>
      <a href="/dashboard3/api/auth.php?action=logout" class="nav-item nav-item-logout">
        <span class="nav-icon">⏻</span>
        <span class="nav-label">Sign out</span>
      </a>
    </div>
    <div class="sidebar-footer">
      <div class="server-name">forge · 192.168.1.172</div>
    </div>
  `;
}

/* ─── Clock ──────────────────────────────────────────────────────────────────── */
let _clockTimer = null;

async function startClock() {
  clearTimeout(_clockTimer);
  // Tick immediately with browser tz so the clock never shows "Loading..."
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  _tickClock(browserTz);
  // Then load the user's configured tz and re-tick if it differs
  const settings = await getSettings();
  const configTz = settings?.sys_timezone;
  if (configTz && configTz !== browserTz) _tickClock(configTz);
}

function _tickClock(tz) {
  clearTimeout(_clockTimer);
  try {
    const timeEl = document.getElementById('page-clock-time');
    const dateEl = document.getElementById('page-clock-date');
    if (!timeEl || !dateEl) {
      // DOM not ready yet — retry shortly
      _clockTimer = setTimeout(() => _tickClock(tz), 100);
      return;
    }
    const now     = new Date();
    const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
    const dateFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: tz });
    timeEl.textContent = timeFmt.format(now);
    dateEl.textContent = dateFmt.format(now);
  } catch { /* non-fatal */ }
  const now = new Date();
  const msToNextMin = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  _clockTimer = setTimeout(() => _tickClock(tz), msToNextMin);
}

function pageHeader(title) {
  return `
    <div class="page-header">
      <h1 class="page-title">${title}</h1>
      <div class="page-clock-box">
        <span class="page-clock-segment">
          <svg class="page-clock-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="1" y="3" width="14" height="12" rx="2"/><path d="M1 7h14"/><path d="M5 1v4M11 1v4"/>
          </svg>
          <span id="page-clock-date">Loading…</span>
        </span>
        <span class="page-clock-divider"></span>
        <span class="page-clock-segment">
          <svg class="page-clock-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 2"/>
          </svg>
          <span id="page-clock-time">--:-- --</span>
        </span>
      </div>
    </div>`;
}

/* ─── Tutorial ───────────────────────────────────────────────────────────────── */
const TUTORIAL_PAGES = [
  {
    icon: '👋',
    title: 'Welcome to Homelab',
    text: 'This quick tour will walk you through the main features of your dashboard. You can dismiss it at any time, or turn it off permanently using the button below.',
  },
  {
    icon: '🏠',
    title: 'The Dashboard',
    text: 'The home page is your main hub. Use <strong>Edit Page</strong> to add and arrange widgets like machines, services, pinned notes, and more. Drag them around to organise however you like.',
  },
  {
    icon: '⚙️',
    title: 'Services & Machines',
    text: 'Track all the services running across your home network. Each service shows its live status, URL, and which machine it runs on. Add machines under the Machines page to keep everything organised.',
  },
  {
    icon: '🌐',
    title: 'Network',
    text: 'If you connected a UniFi or OPNsense integration during setup, the Network page will show live stats, connected devices, VLANs, and WAN info pulled directly from your controller.',
  },
  {
    icon: '⚙️',
    title: 'Settings',
    text: 'Head to Settings any time to update your password, configure integrations, change your timezone, set up email alerts, or adjust the look and feel of the dashboard.',
  },
];

let _tutStep = 0;

async function showTutorialIfNeeded() {
  const settings = await getSettings();
  if (settings?.tutorial_dismissed === '1') return;
  _tutStep = 0;
  _renderTutorial();
}

function _renderTutorial() {
  document.getElementById('tut-overlay')?.remove();

  const total  = TUTORIAL_PAGES.length;
  const isLast = _tutStep === total - 1;

  const el = document.createElement('div');
  el.id = 'tut-overlay';
  el.className = 'tut-overlay';
  el.innerHTML = `
    <div class="tut-modal">
      <button class="tut-close" onclick="tutClose()" title="Close">&#x2715;</button>
      <div class="tut-progress">
        ${Array.from({ length: total }, (_, i) =>
          `<div class="tut-seg ${i < _tutStep ? 'done' : i === _tutStep ? 'active' : ''}"></div>`
        ).join('')}
      </div>
      <div class="tut-body">
        ${TUTORIAL_PAGES.map((p, i) => `
          <div class="tut-page ${i === _tutStep ? 'active' : ''}">
            <div class="tut-icon">${p.icon}</div>
            <div class="tut-title">${p.title}</div>
            <div class="tut-text">${p.text}</div>
          </div>`).join('')}
      </div>
      <div class="tut-footer">
        <button class="tut-dismiss" onclick="tutDismiss()">Don't show this again</button>
        <div class="tut-nav">
          ${_tutStep > 0 ? `<button class="tut-btn tut-btn-ghost" onclick="tutNav(-1)">Back</button>` : ''}
          ${isLast
            ? `<button class="tut-btn tut-btn-done" onclick="tutClose()">Done</button>`
            : `<button class="tut-btn tut-btn-primary" onclick="tutNav(1)">Next</button>`}
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
}

function tutNav(dir) {
  _tutStep = Math.max(0, Math.min(TUTORIAL_PAGES.length - 1, _tutStep + dir));
  _renderTutorial();
}

function tutClose() {
  document.getElementById('tut-overlay')?.remove();
}

async function tutDismiss() {
  tutClose();
  await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tutorial_dismissed: '1' }),
  });
  if (SETTINGS) SETTINGS.tutorial_dismissed = '1';
}

/* ─── Router ─────────────────────────────────────────────────────────────────── */
function renderPage() {
  const fns = { home: renderHome, services: renderServices, machines: renderMachines,
                network: renderNetwork, models: renderModels, workflows: renderWorkflows,
                notes: renderNotes, runbook: renderRunbook, settings: renderSettings,
                topology: () => typeof renderTopologyPage === 'function' && renderTopologyPage(),
                homeassistant: renderHomeAssistant };
  (fns[CURRENT_PAGE] || renderHome)();
  startClock();
}

/* ─── Status pinging ─────────────────────────────────────────────────────────── */
async function pingService(name, url) {
  document.querySelectorAll(`[data-status="${CSS.escape(name)}"]`)
          .forEach(d => { d.className = 'status-dot checking'; });
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), 3000);
  let state;
  try {
    await fetch(url, { mode: 'no-cors', signal: ctrl.signal });
    clearTimeout(tid); state = 'up';
  } catch {
    clearTimeout(tid); state = 'down';
  }
  document.querySelectorAll(`[data-status="${CSS.escape(name)}"]`)
          .forEach(d => { d.className = `status-dot ${state}`; });
  return state;
}

async function pingAllServices() {
  if (!DATA) return;
  await Promise.all(DATA.services.map(s => {
    if (s.detected_healthy) {
      document.querySelectorAll(`[data-status="${CSS.escape(s.name)}"]`)
        .forEach(d => { d.className = 'status-dot up'; });
      return Promise.resolve('up');
    }
    if (!s.url) {
      document.querySelectorAll(`[data-status="${CSS.escape(s.name)}"]`)
        .forEach(d => { d.className = 'status-dot checking'; });
      return Promise.resolve('unknown');
    }
    return pingService(s.name, s.url);
  }));
  const el = document.getElementById('ping-timestamp');
  if (el) el.textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════════════════ */
/* ─── Home Sections Registry ─────────────────────────────────────────────────── */
const HOME_SECTION_DEFS = {
  stats:    { label: 'Stats',         icon: '◉',  desc: 'Machine & service counts' },
  calendar: { label: 'Calendar',      icon: '☷',  desc: 'Upcoming events' },
  machines: { label: 'Machines',      icon: '⬡',  desc: 'Machine cards grid' },
  mnotes:   { label: 'Machine Notes', icon: '◧',  desc: 'Per-machine markdown notes' },
  network:  { label: 'Network',       icon: '⬢',  desc: 'Network summary' },
  weather:  { label: 'Weather',       icon: '☁',  desc: 'Current weather' },
  notes:    { label: 'Notes',         icon: '◧',  desc: 'Pinned notes' },
  news:     { label: 'News',          icon: '📰', desc: 'Latest headlines from RSS feeds' },
  topology: { label: 'Topology Map',  icon: '⬡',  desc: 'Network topology viewer' },
};
const HOME_SECTION_DEFAULT_SPANS = {
  stats: 6,
  calendar: 6,
  machines: 12,
  mnotes: 12,
  network: 6,
  weather: 6,
  notes: 6,
  topology: 8,
};
const HOME_SECTION_DEFAULT_ROWS = {
  stats: 2,
  calendar: 3,
  machines: 4,
  mnotes: 4,
  network: 2,
  weather: 2,
  notes: 3,
  topology: 4,
};
const HOME_GRID_COLUMNS = 12;
const HOME_SECTION_MIN_W = 3;
const HOME_SECTION_MAX_H = 8;

let _homeLayout        = null;  // current in-memory layout
let _homeLayoutSaved   = null;  // snapshot for cancel
let homePageEditMode   = false;
let homeSectionInteraction = null;

async function loadHomeLayout() {
  try {
    const res  = await fetch(ROOT + 'api/settings.php');
    const vals = await res.json();
    if (vals.home_layout !== undefined) return normalizeHomeLayout(JSON.parse(vals.home_layout || '[]'));
  } catch {}
  return [];
}

async function renderHome() {
  if (!_homeLayout) _homeLayout = await loadHomeLayout();
  _renderHomeSections();
}

function _renderHomeSections() {
  const { machines, services, workflows, pinned_notes } = DATA;
  const activeWf  = workflows.filter(w => w.status === 'active').length;
  const typeCount = new Set(services.map(s => s.type)).size;

  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Dashboard')}
    <div class="home-page-toolbar">
      <button class="btn-layout-edit" id="home-edit-btn"   onclick="enterHomeEditMode()">⊹ Edit Page</button>
      <button class="btn-layout-save" id="home-save-btn"   onclick="saveHomeLayout()" style="display:none">✓ Save</button>
      <button class="btn-layout-cancel" id="home-cancel-btn" onclick="cancelHomeEdit()" style="display:none">✕ Cancel</button>
    </div>
    <div class="home-sections" id="home-sections">
      ${_homeLayout.length === 0 ? `
        <div class="home-empty-state" id="home-empty-state">
          <div class="home-empty-icon">⊹</div>
          <div class="home-empty-title">Nothing here yet</div>
          <div class="home-empty-sub">Click <strong>Edit Page</strong> to add widgets to your dashboard.</div>
        </div>` : _homeLayout.map(section => homeSectionHTML(section)).join('')}
    </div>
    <div class="home-add-section-panel" id="home-add-panel" style="display:none">
      <div class="home-add-panel-label">Add a section</div>
      <div class="home-add-panel-grid" id="home-add-grid"></div>
    </div>
  `;

  // init each section's async/interactive content
  _homeLayout.forEach(section => initHomeSectionContent(section.id));
  if (homeLayoutHas('machines')) applyLayout();
}

function homeSectionHTML(section) {
  const id = typeof section === 'string' ? section : section.id;
  const x = getHomeSectionX(section);
  const y = getHomeSectionY(section);
  const w = getHomeSectionSpan(section);
  const h = getHomeSectionRows(section);
  const def = HOME_SECTION_DEFS[id];
  if (!def) return '';
  return `
    <div class="home-section" data-section-id="${id}" data-x="${x}" data-y="${y}" data-w="${w}" data-h="${h}" id="home-section-${id}" style="${homeSectionGridStyle({ x, y, w, h })}">
      <div class="home-section-drag-handle" style="display:none">⠿ drag widget</div>
      <div class="section-title home-section-titlebar">
        <span>${def.label}</span>
        <div class="home-section-title-actions">
          ${id === 'machines' ? `
            <button class="btn-add" id="home-add-machine-btn" onclick="addHomeMachine()" style="display:none">+ Add Machine</button>
            <button class="btn-layout-edit" id="layout-edit-btn" onclick="enterLayoutEditMode()">⊹ Edit Layout</button>
            <button class="btn-layout-save" id="layout-save-btn" onclick="saveLayoutEdit()" style="display:none">✓ Save</button>
            <button class="btn-layout-reset" id="layout-reset-btn" onclick="confirmResetLayout()" style="display:none">↺ Reset</button>
            <button class="btn-layout-cancel" id="layout-cancel-btn" onclick="cancelLayoutEdit()" style="display:none">✕ Cancel</button>
          ` : ''}
          ${id === 'mnotes' ? `
            <button class="btn-add"         id="mnotes-add-btn"    onclick="addHomeMnote()"           style="display:none">+ Add Note</button>
            <button class="btn-layout-edit" id="mnotes-edit-btn"   onclick="enterMnotesEditMode()">⊹ Edit Layout</button>
            <button class="btn-layout-save" id="mnotes-save-btn"   onclick="saveMnotesLayoutEdit()"   style="display:none">✓ Save</button>
            <button class="btn-layout-reset" id="mnotes-reset-btn" onclick="confirmResetMnotesLayout()" style="display:none">↺ Reset</button>
            <button class="btn-layout-cancel" id="mnotes-cancel-btn" onclick="cancelMnotesLayoutEdit()" style="display:none">✕ Cancel</button>
          ` : ''}
          ${id === 'notes' ? `<button class="btn-add" onclick="addNote()">+ Add</button>` : ''}
          ${id === 'topology' ? `
            <button class="btn-layout-edit"   id="tw-adjust-btn"  onclick="twEnterAdjust()">⊡ Adjust View</button>
            <button class="btn-layout-save"   id="tw-save-btn"    onclick="twSaveView()"    style="display:none">✓ Save View</button>
            <button class="btn-layout-cancel" id="tw-cancel-btn"  onclick="twCancelAdjust()" style="display:none">✕ Cancel</button>
          ` : ''}
          <button class="home-section-remove-btn" data-section="${id}" onclick="removeHomeSection('${id}')" style="display:none" title="Remove section">✕ Remove</button>
        </div>
      </div>
      <div class="home-section-body home-section-body--${id}" id="home-section-body-${id}">
        ${id === 'weather' ? '<div class="weather-loading">Loading weather…</div>' : ''}
      </div>
      <div class="home-section-resize-handle" style="display:none" title="Resize widget"></div>
    </div>`;
}

function initHomeSectionContent(id) {
  const el = document.getElementById(`home-section-body-${id}`);
  if (!el) return;
  const { machines, services, workflows, pinned_notes, network } = DATA;

  switch (id) {
    case 'stats': {
      const activeWf  = workflows.filter(w => w.status === 'active').length;
      const typeCount = new Set(services.map(s => s.type)).size;
      el.innerHTML = `
        <div class="stat-cards">
          <div class="stat-card"><div class="stat-value">${machines.length}</div><div class="stat-label">Machines</div></div>
          <div class="stat-card"><div class="stat-value">${services.length}</div><div class="stat-label">Services</div></div>
          <div class="stat-card"><div class="stat-value">${typeCount}</div><div class="stat-label">Service Types</div></div>
          <div class="stat-card"><div class="stat-value">${activeWf}</div><div class="stat-label">Active Workflows</div></div>
        </div>`;
      break;
    }
    case 'calendar':
      fetchCalendar(el);
      break;
    case 'machines':
      renderHomeMachinesSection(el, machines, services);
      break;
    case 'network':
      el.innerHTML = `
        <div class="home-network-summary">
          <div class="home-net-row"><span class="home-net-label">Gateway</span><span class="mono">${network.gateway || '—'}</span></div>
          <div class="home-net-row"><span class="home-net-label">Device</span><span>${network.device || '—'}</span></div>
          <div class="home-net-row"><span class="home-net-label">VLANs</span><span>${network.vlans?.length ?? 0}</span></div>
          <div class="home-net-row"><span class="home-net-label">UniFi Devices</span><span>${network.unifi_devices?.length ?? 0}</span></div>
        </div>`;
      break;
    case 'weather':
      fetchWeather(el);
      break;
    case 'mnotes':
      renderHomeMnotesSection(el);
      break;
    case 'notes':
      el.innerHTML = `<div class="pinned-notes" id="notes-list">${renderNotesList(pinned_notes)}</div>`;
      break;
    case 'news':
      el.innerHTML = '<div class="news-loading">Loading headlines…</div>';
      fetchNews(el);
      break;
    case 'topology':
      initTopoWidget(el);
      break;
  }
}

function homeServicesFilter() {
  const q       = (document.getElementById('hsvc-search')?.value  || '').toLowerCase().trim();
  const machine = (document.getElementById('hsvc-machine')?.value || '').toLowerCase();
  const type    = (document.getElementById('hsvc-type')?.value    || '').toLowerCase();
  const rows    = document.querySelectorAll('#hsvc-tbody .hsvc-row');
  let visible   = 0;
  rows.forEach(row => {
    const name    = row.dataset.name    || '';
    const rowMach = row.dataset.machine || '';
    const rowType = row.dataset.type    || '';
    const port    = row.dataset.port    || '';
    const match =
      (!q       || name.includes(q) || rowMach.includes(q) || rowType.includes(q) || port.includes(q)) &&
      (!machine || rowMach === machine) &&
      (!type    || rowType === type);
    row.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  const countEl = document.getElementById('hsvc-count');
  if (countEl) countEl.textContent = visible;
}

async function fetchWeather(el) {
  const weather = await fetchWeatherClientSide();
  if (weather) {
    renderWeather(el, weather);
    return;
  }
  el.innerHTML = `<div class="weather-error">Weather unavailable</div>`;
}

async function fetchCalendar(el) {
  el.innerHTML = `<div class="weather-loading">Loading calendar…</div>`;
  try {
    const res = await fetch(ROOT + 'api/calendar.php');
    const data = await res.json();
    if (!res.ok) {
      el.innerHTML = `<div class="weather-error">${data.error || 'Calendar unavailable'}</div>`;
      return;
    }
    renderCalendar(el, data);
  } catch {
    el.innerHTML = `<div class="weather-error">Calendar unavailable</div>`;
  }
}

function renderCalendar(el, data) {
  const events = Array.isArray(data.events) ? data.events : [];
  const tz = data.timezone || 'America/New_York';
  const now = new Date();
  el.innerHTML = `
    <div class="calendar-widget">
      <div class="calendar-month">
        ${renderMiniCalendar(events, now, tz)}
      </div>
      <div class="calendar-agenda">
        ${events.length
          ? events.map(event => renderCalendarEvent(event, tz)).join('')
          : '<div class="calendar-empty">No upcoming events in the selected window.</div>'}
      </div>
    </div>`;
}

function renderMiniCalendar(events, now, tz) {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const eventDays = new Set(events.map(event => {
    const d = new Date(event.start_iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }));

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push('<span class="calendar-day calendar-day--blank"></span>');
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${now.getFullYear()}-${now.getMonth()}-${day}`;
    const classes = [
      'calendar-day',
      day === now.getDate() ? 'calendar-day--today' : '',
      eventDays.has(key) ? 'calendar-day--event' : '',
    ].filter(Boolean).join(' ');
    cells.push(`<span class="${classes}">${day}</span>`);
  }

  return `
    <div class="calendar-month-label">${new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric', timeZone: tz }).format(now)}</div>
    <div class="calendar-weekdays">
      ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => `<span>${day}</span>`).join('')}
    </div>
    <div class="calendar-grid">
      ${cells.join('')}
    </div>`;
}

function renderCalendarEvent(event, tz) {
  const start = new Date(event.start_iso);
  const end = new Date(event.end_iso);
  const dayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: tz,
  }).format(start);

  const timeLabel = event.all_day
    ? 'All day'
    : `${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(start)} - ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone: tz }).format(end)}`;

  return `
    <div class="calendar-event">
      <div class="calendar-event-date">
        <span class="calendar-event-day">${dayLabel}</span>
        <span class="calendar-event-time">${timeLabel}</span>
      </div>
      <div class="calendar-event-main">
        <span class="calendar-event-title">${htmlEsc(event.summary || 'Untitled event')}</span>
        ${event.location ? `<span class="calendar-event-location">${htmlEsc(event.location)}</span>` : ''}
      </div>
    </div>`;
}

async function fetchNews(el) {
  try {
    const res = await fetch(ROOT + 'api/news.php');
    const d   = await res.json();
    if (!d.articles || d.articles.length === 0) {
      el.innerHTML = d.note
        ? `<div class="news-disabled-msg">News widget is disabled. Enable it in <a href="${ROOT}pages/settings.html">Settings → News &amp; Feeds</a>.</div>`
        : '<div class="news-empty">No articles found. Check your sources in Settings.</div>';
      return;
    }

    // Group articles by source, preserving order of first appearance
    const sourceOrder = [];
    const grouped = {};
    d.articles.forEach(a => {
      if (!grouped[a.source]) { grouped[a.source] = []; sourceOrder.push(a.source); }
      grouped[a.source].push(a);
    });

    const sections = sourceOrder.map(src => {
      const articles = grouped[src].map((a, i) => {
        const ago = a.published ? timeAgo(new Date(a.published)) : '';
        return `
          <a class="news-article" href="${esc(a.url)}" target="_blank" rel="noopener">
            <span class="news-bullet">▸</span>
            <div class="news-article-body">
              <div class="news-article-title">${esc(a.title)}</div>
              ${a.summary ? `<div class="news-article-summary">${esc(a.summary)}</div>` : ''}
            </div>
            ${ago ? `<span class="news-article-ago">${ago}</span>` : ''}
          </a>`;
      }).join('');

      return `
        <div class="news-source-group">
          <div class="news-source-header">
            <span class="news-source-header-name">${esc(src)}</span>
            <span class="news-source-header-count">${grouped[src].length} article${grouped[src].length !== 1 ? 's' : ''}</span>
          </div>
          <div class="news-article-list">${articles}</div>
        </div>`;
    }).join('<div class="news-feed-divider"></div>');

    el.innerHTML = `<div class="news-feed">${sections}</div>`;
  } catch {
    el.innerHTML = '<div class="news-empty">Could not load news.</div>';
  }
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function weatherEmoji(code, isDay = true) {
  if (code === 113) return isDay ? '☀️' : '🌙';
  if (code === 116) return isDay ? '⛅' : '☁️';
  if ([119, 122].includes(code)) return '☁️';
  if ([143, 248, 260].includes(code)) return '🌫️';
  if (code >= 296 && code <= 321) return '🌧️';
  if (code >= 176 && code <= 281) return '🌦️';
  if (code >= 329 && code <= 377) return '❄️';
  if (code >= 386 && code <= 395) return '⛈️';
  return '🌡️';
}

function renderWeather(el, w) {
  const code = parseInt(w.weather_code, 10);
  const icon = weatherEmoji(code, w.is_day !== false);
  el.innerHTML = `
    <div class="weather-widget">
      <div class="weather-main">
        <span class="weather-icon">${icon}</span>
        <div class="weather-temps">
          <span class="weather-temp">${w.temp_f}°F</span>
          <span class="weather-temp-c">${w.temp_c}°C</span>
        </div>
        <div class="weather-desc-block">
          <span class="weather-desc">${w.description}</span>
          <span class="weather-location">${w.location}</span>
        </div>
      </div>
      <div class="weather-meta">
        <div class="weather-meta-item"><span class="weather-meta-label">Feels like</span><span>${w.feels_like_f}°F</span></div>
        <div class="weather-meta-item"><span class="weather-meta-label">Wind</span><span>${w.wind_mph} mph ${w.wind_dir}</span></div>
        <div class="weather-meta-item"><span class="weather-meta-label">Sunrise</span><span>${w.sunrise || '—'}</span></div>
        <div class="weather-meta-item"><span class="weather-meta-label">Sunset</span><span>${w.sunset || '—'}</span></div>
      </div>
    </div>`;
}

async function fetchWeatherClientSide(zipcode) {
  const settings = await getSettings();
  const zip = zipcode || settings?.sys_zipcode;
  const timezone = settings?.sys_timezone || 'America/New_York';
  if (!zip) return null;

  try {
    const geoRes = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
    if (!geoRes.ok) return null;
    const geo = await geoRes.json();
    const place = geo.places?.[0];
    if (!place) return null;

    const latitude = Number.parseFloat(place.latitude);
    const longitude = Number.parseFloat(place.longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;

    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=sunrise,sunset&temperature_unit=fahrenheit&timezone=${encodeURIComponent(timezone)}`);
    if (!weatherRes.ok) return null;
    const weather = await weatherRes.json();
    const current = weather.current_weather;
    if (!current) return null;

    return normalizeOpenMeteoWeather(current, weather.daily, place, zip, timezone);
  } catch {
    return null;
  }
}

function normalizeOpenMeteoWeather(current, daily, place, zip, timezone) {
  const tempF = Math.round(current.temperature);
  const tempC = Math.round((tempF - 32) * 5 / 9);
  const windDir = degreesToCompass(current.winddirection);
  const code = Number.parseInt(current.weathercode, 10);
  const region = [place['place name'], place['state abbreviation'] || place.state].filter(Boolean).join(', ');
  const sunrise = formatWeatherTime(daily?.sunrise?.[0], timezone);
  const sunset = formatWeatherTime(daily?.sunset?.[0], timezone);

  return {
    zipcode: zip,
    location: region || zip,
    temp_f: Number.isFinite(tempF) ? tempF : '—',
    temp_c: Number.isFinite(tempC) ? tempC : '—',
    feels_like_f: Number.isFinite(tempF) ? tempF : '—',
    description: openMeteoDescription(code),
    humidity: '—',
    wind_mph: current.windspeed ?? '—',
    wind_dir: windDir,
    is_day: current.is_day !== 0,
    sunrise,
    sunset,
    weather_code: openMeteoToWttrCode(code),
  };
}

function formatWeatherTime(value, timezone) {
  if (!value) return '';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
  }).format(dt);
}

function openMeteoDescription(code) {
  const labels = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Heavy rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm with hail',
  };
  return labels[code] || 'Current conditions';
}

function openMeteoToWttrCode(code) {
  if (code === 0) return 113;
  if (code === 1 || code === 2) return 116;
  if (code === 3) return 119;
  if (code === 45 || code === 48) return 248;
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 296;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 338;
  if ([95, 96, 99].includes(code)) return 389;
  return 113;
}

function degreesToCompass(degrees) {
  if (!Number.isFinite(degrees)) return '—';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

/* ─── Home page edit mode ────────────────────────────────────────────────────── */
function enterHomeEditMode() {
  homePageEditMode = true;
  _homeLayoutSaved = cloneHomeLayout(_homeLayout);

  document.getElementById('home-edit-btn').style.display   = 'none';
  document.getElementById('home-save-btn').style.display   = '';
  document.getElementById('home-cancel-btn').style.display = '';
  document.getElementById('home-sections').classList.add('page-editing');

  // Show drag handles and remove buttons on each section
  document.querySelectorAll('.home-section').forEach(sec => {
    sec.querySelector('.home-section-drag-handle').style.display = '';
    sec.querySelector('.home-section-remove-btn').style.display  = '';
    sec.querySelector('.home-section-resize-handle').style.display = '';
    sec.classList.add('home-section-editing');
    bindHomeSectionEditHandles(sec);
  });

  _refreshAddPanel();
  document.getElementById('home-add-panel').style.display = '';
}

function exitHomeEditMode() {
  homePageEditMode = false;
  document.getElementById('home-edit-btn').style.display   = '';
  document.getElementById('home-save-btn').style.display   = 'none';
  document.getElementById('home-cancel-btn').style.display = 'none';
  document.getElementById('home-add-panel').style.display  = 'none';
  document.getElementById('home-sections').classList.remove('page-editing');

  document.querySelectorAll('.home-section').forEach(sec => {
    sec.querySelector('.home-section-drag-handle').style.display = 'none';
    sec.querySelector('.home-section-remove-btn').style.display  = 'none';
    sec.querySelector('.home-section-resize-handle').style.display = 'none';
    sec.classList.remove('home-section-editing', 'section-dragging');
    unbindHomeSectionEditHandles(sec);
  });
  stopHomeSectionInteraction();
}

function syncHomeMachineDashboardActions() {
  document.querySelectorAll('.home-machine-dashboard-actions').forEach(actions => {
    actions.style.display = layoutEditActive ? '' : 'none';
  });
}

async function saveHomeLayout() {
  _homeLayout = readHomeLayoutFromDom();
  await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ home_layout: JSON.stringify(_homeLayout) }),
  });
  exitHomeEditMode();
  toast('Page layout saved');
}

function cancelHomeEdit() {
  _homeLayout = cloneHomeLayout(_homeLayoutSaved);
  exitHomeEditMode();
  _renderHomeSections();
  startClock();
}

function removeHomeSection(id) {
  _homeLayout = _homeLayout.filter(s => s.id !== id);
  const el = document.getElementById(`home-section-${id}`);
  if (el) el.remove();
  applyHomeLayoutToDom(packHomeLayout(readHomeLayoutFromDom()));
  _refreshAddPanel();
}

function addHomeSection(id) {
  if (homeLayoutHas(id)) return;
  _homeLayout.push({
    id,
    x: 1,
    y: 1,
    w: getHomeSectionDefaultSpan(id),
    h: getHomeSectionDefaultRows(id),
  });
  const container = document.getElementById('home-sections');
  container.insertAdjacentHTML('beforeend', homeSectionHTML({
    id,
    x: 1,
    y: 1,
    w: getHomeSectionDefaultSpan(id),
    h: getHomeSectionDefaultRows(id),
  }));
  const newSec = document.getElementById(`home-section-${id}`);
  newSec.querySelector('.home-section-drag-handle').style.display = '';
  newSec.querySelector('.home-section-remove-btn').style.display  = '';
  newSec.querySelector('.home-section-resize-handle').style.display = '';
  newSec.classList.add('home-section-editing');
  bindHomeSectionEditHandles(newSec);
  initHomeSectionContent(id);
  if (id === 'machines') applyLayout();
  applyHomeLayoutToDom(packHomeLayout(readHomeLayoutFromDom()));
  _refreshAddPanel();
}

function _refreshAddPanel() {
  const grid = document.getElementById('home-add-grid');
  if (!grid) return;
  const available = Object.keys(HOME_SECTION_DEFS).filter(id => !homeLayoutHas(id));
  if (available.length === 0) {
    grid.innerHTML = '<span style="color:var(--text-subtle);font-size:12px">All sections are active.</span>';
    return;
  }
  grid.innerHTML = available.map(id => {
    const def = HOME_SECTION_DEFS[id];
    return `<button class="home-add-section-btn" onclick="addHomeSection('${id}')">
      <span>${def.icon}</span><span>${def.label}</span>
    </button>`;
  }).join('');
}

function normalizeHomeSection(item) {
  if (typeof item === 'string') {
    return HOME_SECTION_DEFS[item] ? {
      id: item,
      w: getHomeSectionDefaultSpan(item),
      h: getHomeSectionDefaultRows(item),
    } : null;
  }
  if (!item || typeof item !== 'object' || !HOME_SECTION_DEFS[item.id]) return null;
  return {
    id: item.id,
    x: sanitizeHomeSectionX(item.x),
    y: sanitizeHomeSectionY(item.y),
    w: sanitizeHomeSectionSpan(item.w ?? item.span, item.id),
    h: sanitizeHomeSectionRows(item.h ?? item.rows, item.id),
  };
}

function homeSectionGridStyle(section) {
  return `grid-column:${section.x} / span ${section.w};grid-row:${section.y} / span ${section.h};`;
}

function sanitizeHomeSectionX(x) {
  const parsed = Number.parseInt(x, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function sanitizeHomeSectionY(y) {
  const parsed = Number.parseInt(y, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

function sanitizeHomeSectionSpan(span, id) {
  const parsed = Number.parseInt(span, 10);
  if (!Number.isFinite(parsed)) return getHomeSectionDefaultSpan(id);
  return Math.max(HOME_SECTION_MIN_W, Math.min(HOME_GRID_COLUMNS, parsed));
}

function getHomeSectionDefaultSpan(id) {
  return HOME_SECTION_DEFAULT_SPANS[id] || 12;
}

function sanitizeHomeSectionRows(rows, id) {
  const parsed = Number.parseInt(rows, 10);
  if (!Number.isFinite(parsed)) return getHomeSectionDefaultRows(id);
  return Math.max(1, Math.min(HOME_SECTION_MAX_H, parsed));
}

function getHomeSectionDefaultRows(id) {
  return HOME_SECTION_DEFAULT_ROWS[id] || 2;
}

function getHomeSectionX(section) {
  return sanitizeHomeSectionX(section?.x);
}

function getHomeSectionY(section) {
  return sanitizeHomeSectionY(section?.y);
}

function getHomeSectionSpan(section) {
  if (typeof section === 'string') return getHomeSectionDefaultSpan(section);
  return sanitizeHomeSectionSpan(section?.w ?? section?.span, section?.id);
}

function getHomeSectionRows(section) {
  if (typeof section === 'string') return getHomeSectionDefaultRows(section);
  return sanitizeHomeSectionRows(section?.h ?? section?.rows, section?.id);
}

function readHomeLayoutFromDom() {
  return [...document.querySelectorAll('.home-section')].map(section => ({
    id: section.dataset.sectionId,
    x: sanitizeHomeSectionX(section.dataset.x),
    y: sanitizeHomeSectionY(section.dataset.y),
    w: sanitizeHomeSectionSpan(section.dataset.w, section.dataset.sectionId),
    h: sanitizeHomeSectionRows(section.dataset.h, section.dataset.sectionId),
  }));
}

function cloneHomeLayout(layout) {
  return (layout || []).map(section => ({ ...section }));
}

function homeLayoutHas(id) {
  return _homeLayout.some(section => section.id === id);
}

function normalizeHomeLayout(layout) {
  return packHomeLayout((Array.isArray(layout) ? layout : []).map(item => normalizeHomeSection(item)).filter(Boolean));
}

function packHomeLayout(layout, pinnedId = null) {
  const items = cloneHomeLayout(layout);
  const pinned = pinnedId ? items.find(item => item.id === pinnedId) : null;
  const floating = items.filter(item => item.id !== pinnedId)
    .sort((a, b) => (a.y - b.y) || (a.x - b.x));
  const placed = [];

  if (pinned) {
    placed.push(clampHomeSectionRect(pinned));
  }

  floating.forEach(item => {
    let candidate = clampHomeSectionRect(item);
    while (homeLayoutCollides(candidate, placed)) {
      candidate = nextHomeSectionSlot(candidate);
    }
    placed.push(candidate);
  });

  return placed.sort((a, b) => (a.y - b.y) || (a.x - b.x));
}

function clampHomeSectionRect(section) {
  const w = sanitizeHomeSectionSpan(section.w, section.id);
  const h = sanitizeHomeSectionRows(section.h, section.id);
  const maxX = Math.max(1, HOME_GRID_COLUMNS - w + 1);
  return {
    ...section,
    x: Math.min(maxX, Math.max(1, sanitizeHomeSectionX(section.x))),
    y: Math.max(1, sanitizeHomeSectionY(section.y)),
    w,
    h,
  };
}

function homeLayoutCollides(candidate, placed) {
  return placed.some(item =>
    candidate.x < item.x + item.w &&
    candidate.x + candidate.w > item.x &&
    candidate.y < item.y + item.h &&
    candidate.y + candidate.h > item.y
  );
}

function nextHomeSectionSlot(section) {
  let nextX = section.x + 1;
  let nextY = section.y;
  if (nextX + section.w - 1 > HOME_GRID_COLUMNS) {
    nextX = 1;
    nextY += 1;
  }
  return { ...section, x: nextX, y: nextY };
}

function applyHomeLayoutToDom(layout) {
  layout.forEach(section => {
    const el = document.getElementById(`home-section-${section.id}`);
    if (!el) return;
    el.dataset.x = String(section.x);
    el.dataset.y = String(section.y);
    el.dataset.w = String(section.w);
    el.dataset.h = String(section.h);
    el.style.gridColumn = `${section.x} / span ${section.w}`;
    el.style.gridRow = `${section.y} / span ${section.h}`;
  });
}

function bindHomeSectionEditHandles(section) {
  section.querySelector('.home-section-drag-handle')?.addEventListener('pointerdown', onHomeSectionMoveStart);
  section.querySelector('.home-section-resize-handle')?.addEventListener('pointerdown', onHomeSectionResizeStart);
}

function unbindHomeSectionEditHandles(section) {
  section.querySelector('.home-section-drag-handle')?.removeEventListener('pointerdown', onHomeSectionMoveStart);
  section.querySelector('.home-section-resize-handle')?.removeEventListener('pointerdown', onHomeSectionResizeStart);
}

function onHomeSectionMoveStart(e) {
  if (!homePageEditMode) return;
  e.preventDefault();
  startHomeSectionInteraction(e, 'move');
}

function onHomeSectionResizeStart(e) {
  if (!homePageEditMode) return;
  e.preventDefault();
  startHomeSectionInteraction(e, 'resize');
}

function startHomeSectionInteraction(e, type) {
  const section = e.currentTarget.closest('.home-section');
  if (!section) return;
  const metrics = getHomeGridMetrics();
  homeSectionInteraction = {
    type,
    id: section.dataset.sectionId,
    startX: e.clientX,
    startY: e.clientY,
    origin: {
      x: sanitizeHomeSectionX(section.dataset.x),
      y: sanitizeHomeSectionY(section.dataset.y),
      w: sanitizeHomeSectionSpan(section.dataset.w, section.dataset.sectionId),
      h: sanitizeHomeSectionRows(section.dataset.h, section.dataset.sectionId),
    },
    metrics,
  };
  section.classList.add('section-dragging');
  document.addEventListener('pointermove', onHomeSectionPointerMove);
  document.addEventListener('pointerup', stopHomeSectionInteraction);
}

function onHomeSectionPointerMove(e) {
  if (!homeSectionInteraction) return;
  const { id, origin, metrics, type } = homeSectionInteraction;
  const deltaCols = Math.round((e.clientX - homeSectionInteraction.startX) / metrics.colStep);
  const deltaRows = Math.round((e.clientY - homeSectionInteraction.startY) / metrics.rowStep);
  let next = { id, ...origin };

  if (type === 'move') {
    next.x = origin.x + deltaCols;
    next.y = origin.y + deltaRows;
  } else {
    next.w = origin.w + deltaCols;
    next.h = origin.h + deltaRows;
  }

  next = clampHomeSectionRect(next);
  const layout = readHomeLayoutFromDom().map(section => section.id === id ? next : section);
  applyHomeLayoutToDom(packHomeLayout(layout, id));
}

function stopHomeSectionInteraction() {
  if (!homeSectionInteraction) return;
  document.removeEventListener('pointermove', onHomeSectionPointerMove);
  document.removeEventListener('pointerup', stopHomeSectionInteraction);
  document.querySelectorAll('.section-dragging').forEach(el => el.classList.remove('section-dragging'));
  homeSectionInteraction = null;
}

function getHomeGridMetrics() {
  const grid = document.getElementById('home-sections');
  const styles = getComputedStyle(grid);
  const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
  const rowHeight = parseFloat(styles.gridAutoRows || '132') || 132;
  const colWidth = (grid.getBoundingClientRect().width - (gap * (HOME_GRID_COLUMNS - 1))) / HOME_GRID_COLUMNS;
  return {
    colStep: colWidth + gap,
    rowStep: rowHeight + gap,
  };
}

function homeMachineCards(machines, services) {
  return machines.map(m => {
    const svcs = services.filter(s => s.machine === m.name);
    const prefs = getHmcDisplayPrefs(m.id);
    const iconHtml = /\.(png|svg|jpg|webp)$/i.test(m.icon)
      ? `<img src="${ICONS_PATH}${m.icon}" alt="${m.name}" onerror="this.style.display='none'">`
      : `<span class="hmc-emoji">${m.icon || '🖥️'}</span>`;

    const summary = m.snapshot?.summary || {};
    const errors  = m.snapshot?.errors  || [];
    const statusText  = m.snapshot
      ? (m.snapshot.ok ? 'Online' : (errors[0]?.message || 'Unavailable'))
      : 'No live data';
    const statusClass = m.snapshot?.ok ? 'up' : (errors.length ? 'down' : 'checking');

    return `
      <div class="home-machine-card" style="border-top-color:${mc(m.name)}" data-machine-id="${m.id}">
        <div class="home-machine-dashboard-actions" style="display:${layoutEditActive ? '' : 'none'}">
          <button class="btn-card-delete" onclick="hideHomeMachine(${m.id}, event)" title="Hide from dashboard">✕</button>
        </div>

        <div class="hmc-header">
          <div class="hmc-icon-box">${iconHtml}</div>
          <div class="hmc-info">
            <div class="hmc-name" style="color:${mc(m.name)}">${m.name}</div>
            ${prefs.role ? `<div class="hmc-role">${m.role}</div>` : ''}
            ${prefs.badges ? `
            <div class="hmc-badges">
              <span class="hmc-badge">${m.ip}</span>
              <span class="hmc-badge">VLAN ${m.vlan}</span>
              <span class="hmc-badge">${m.os}</span>
            </div>` : ''}
          </div>
        </div>

        ${prefs.notes && m.notes ? `<div class="hmc-notes">${m.notes}</div>` : ''}

        ${prefs.stats ? `
        <div class="hmc-stat-rows">
          <div class="hmc-stat-row"><span class="hmc-stat-label">Status</span><span class="hmc-stat-value"><span class="status-dot ${statusClass}" style="margin-right:5px"></span>${statusText}</span></div>
          ${summary.uptime            ? `<div class="hmc-stat-row"><span class="hmc-stat-label">Uptime</span><span class="hmc-stat-value">${summary.uptime}</span></div>` : ''}
          ${summary.cpu_used_percent    != null ? `<div class="hmc-stat-row"><span class="hmc-stat-label">CPU</span><span class="hmc-stat-value">${summary.cpu_used_percent}%</span></div>` : ''}
          ${summary.memory_used_percent != null ? `<div class="hmc-stat-row"><span class="hmc-stat-label">Memory</span><span class="hmc-stat-value">${summary.memory_used_percent}%</span></div>` : ''}
          ${summary.open_ports          != null ? `<div class="hmc-stat-row"><span class="hmc-stat-label">Ports</span><span class="hmc-stat-value">${summary.open_ports}</span></div>` : ''}
        </div>` : ''}

        ${prefs.services ? `
        <div class="hmc-services">
          ${svcs.length === 0
            ? '<span class="hmc-empty-services">no services</span>'
            : svcs.map(s => {
                const sIcon = /\.(png|svg|jpg|webp)$/i.test(s.icon)
                  ? `<img src="${ICONS_PATH}${s.icon}" class="hmc-svc-icon" alt="" loading="lazy">`
                  : `<span class="hmc-svc-emoji">${s.icon || '⚙️'}</span>`;
                return `
                  <a href="${s.url}" target="_blank" class="hmc-svc-row">
                    ${sIcon}
                    <span class="service-bullet" aria-hidden="true">•</span>
                    <span class="hmc-svc-name">${s.name}</span>
                    <span class="hmc-svc-port">:${s.port}</span>
                  </a>`;
              }).join('')
          }
        </div>` : ''}
      </div>`;
  }).join('');
}

async function renderHomeMachinesSection(el, machines, services) {
  const hiddenIds = _pendingHiddenIds ?? await getHiddenHomeMachineIds();
  const hiddenSet = new Set(hiddenIds);
  const visibleMachines = machines.filter(machine => !hiddenSet.has(machine.id));

  el.innerHTML = `
    <div class="home-machines-grid" id="home-machines-grid">${homeMachineCards(visibleMachines, services)}</div>`;
  applyLayout();
  syncHomeMachineDashboardActions();
}

async function refreshMachinesGrid() {
  const bodyEl = document.getElementById('home-section-body-machines');
  if (!bodyEl) return;
  await renderHomeMachinesSection(bodyEl, DATA.machines, DATA.services);
  if (layoutEditActive) {
    const grid = document.getElementById('home-machines-grid');
    if (grid) activateLayoutEditOnGrid(grid);
  }
}

async function hideHomeMachine(id, e) {
  e?.stopPropagation();
  const machine = DATA?.machines?.find(item => item.id === id);
  if (!machine) return;
  if (_pendingHiddenIds !== null) {
    if (!_pendingHiddenIds.includes(id)) _pendingHiddenIds.push(id);
    toast(`${machine.name} hidden — click Save to apply`, 'warn');
    await refreshMachinesGrid();
  } else {
    const hiddenIds = await getHiddenHomeMachineIds();
    if (hiddenIds.includes(id)) return;
    await saveHiddenHomeMachineIds([...hiddenIds, id]);
    toast(`${machine.name} hidden from dashboard`, 'warn');
    rerender();
  }
}

async function addHomeMachine() {
  const hiddenIds = _pendingHiddenIds ?? await getHiddenHomeMachineIds();
  const available = DATA.machines.filter(machine => hiddenIds.includes(machine.id));

  if (available.length === 0) {
    toast('All machines are already shown on the dashboard');
    return;
  }

  openModal({
    title: '+ Show Machine On Dashboard',
    icon: 'docker.png',
    fields: [
      {
        key: 'machine_id',
        label: 'Machine',
        type: 'select',
        options: available.map(machine => machine.name),
        value: available[0]?.name || '',
      },
    ],
    onSave: async (vals) => {
      const machine = available.find(item => item.name === vals.machine_id);
      if (!machine) throw new Error('Machine not found');
      await showHomeMachine(machine.id, false);
    },
  });
}

async function showHomeMachine(id, notify = true) {
  const machine = DATA?.machines?.find(item => item.id === id);
  if (!machine) return;
  if (_pendingHiddenIds !== null) {
    _pendingHiddenIds = _pendingHiddenIds.filter(hid => hid !== id);
    if (notify) toast(`${machine.name} added — click Save to apply`);
    await refreshMachinesGrid();
  } else {
    const hiddenIds = await getHiddenHomeMachineIds();
    await saveHiddenHomeMachineIds(hiddenIds.filter(hid => hid !== id));
    if (notify) toast(`${machine.name} added back to dashboard`);
    rerender();
  }
}

function renderNotesList(notes) {
  if (!notes || !notes.length)
    return '<div class="text-muted" style="font-size:12px;padding:8px 0">No notes yet.</div>';
  return notes.map(n => {
    const id   = n.id   ?? null;
    const text = n.note ?? n;
    return `
      <div class="pinned-note" data-note-id="${id}">
        ${text}
        ${id ? `
          <div style="margin-left:auto;display:flex;gap:4px;flex-shrink:0">
            <button class="btn-card-edit"   onclick="editNote(${id}, '${htmlEsc(text).replace(/'/g,"&#39;")}')" title="Edit">✎</button>
            <button class="btn-card-delete" onclick="deleteNote(${id})" title="Delete">✕</button>
          </div>` : ''}
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SERVICES PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function renderServices() {
  const { services, machines } = DATA;
  serviceFilters = { machine: 'all', type: 'all', tag: 'all', search: '' };
  const types = [...new Set(services.map(s => s.type))].sort();
  const tags  = [...new Set(services.flatMap(s => s.tags))].sort();

  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Services')}
    <div class="page-toolbar">
      <button class="btn-add" onclick="addService()">+ Add Service</button>
    </div>
    <div class="filter-bar">
      <input id="svc-search" class="filter-input" type="text" placeholder="Search services, tags, notes…"
             oninput="updateFilters('search', this.value)">
      <select class="filter-select" onchange="updateFilters('machine', this.value)">
        <option value="all">All Machines</option>
        ${machines.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="updateFilters('type', this.value)">
        <option value="all">All Types</option>
        ${types.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select class="filter-select" onchange="updateFilters('tag', this.value)">
        <option value="all">All Tags</option>
        ${tags.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <span class="filter-count" id="svc-count">${services.length} services</span>
    </div>
    <div id="services-grid" class="services-grid">${serviceCards(services)}</div>
  `;
}

function serviceCards(list) {
  if (!list.length) return `<div class="no-results">No services match the current filters.</div>`;
  return list.map(s => `
    <div class="service-card" style="border-top-color:${mc(s.machine)}">
      <div class="card-actions">
        ${s.backend_discovered ? `<span class="text-muted" style="font-size:11px">Auto</span>` : ''}
        <button class="btn-card-edit"   onclick='editService(${JSON.stringify(s.id)}, event)'   title="Edit">✎</button>
        <button class="btn-card-delete" onclick='deleteService(${JSON.stringify(s.id)}, event)' title="Delete">✕</button>
      </div>
      <div class="service-card-header">
        <div class="service-name-row">
          <span class="service-bullet" aria-hidden="true">•</span>
          ${renderIcon(s.icon, 18)}
          <span class="service-name">${s.name}</span>
        </div>
      </div>
      <div class="service-url"><a href="${s.url}" target="_blank" class="service-link">${s.url}</a></div>
      <div class="service-meta">
        <div class="meta-row"><span class="meta-label">Machine</span>
          <span class="meta-value" style="color:${mc(s.machine)};font-weight:500">${s.machine}</span></div>
        <div class="meta-row"><span class="meta-label">Port</span>
          <span class="meta-value mono">${s.port}</span></div>
        <div class="meta-row"><span class="meta-label">Deploy</span>
          <span class="meta-value">${s.deployment}</span></div>
        <div class="meta-row"><span class="meta-label">Login</span>
          <span class="meta-value mono">${s.login_hint}</span></div>
      </div>
      ${s.notes ? `<div class="service-notes">${s.notes}</div>` : ''}
      <div class="service-tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>
  `).join('');
}

function updateFilters(key, value) {
  serviceFilters[key] = value;
  const q = serviceFilters.search.toLowerCase();
  const filtered = DATA.services.filter(s => {
    if (serviceFilters.machine !== 'all' && s.machine !== serviceFilters.machine) return false;
    if (serviceFilters.type    !== 'all' && s.type    !== serviceFilters.type)    return false;
    if (serviceFilters.tag     !== 'all' && !s.tags.includes(serviceFilters.tag)) return false;
    if (q) {
      const hay = [s.name, s.machine, s.type, s.notes, ...s.tags].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  document.getElementById('services-grid').innerHTML = serviceCards(filtered);
  document.getElementById('svc-count').textContent =
    `${filtered.length} service${filtered.length !== 1 ? 's' : ''}`;
  filtered.forEach(s => pingService(s.name, s.url));
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MACHINES PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function renderMachines() {
  const { machines, services } = DATA;
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Machines')}
    <div class="page-toolbar">
      <button class="btn-add" onclick="addMachine()">+ Add Machine</button>
    </div>
    <div class="machines-grid" id="machines-grid">
      ${machineCards(machines, services)}
    </div>
  `;
}

function machineCards(machines, services) {
  return machines.map(m => {
    const svcs = services.filter(s => s.machine === m.name);
    const summary = m.snapshot?.summary || {};
    const errors = m.snapshot?.errors || [];
    const statusText = m.snapshot
      ? (m.snapshot.ok ? 'Online' : (errors[0]?.message || 'Unavailable'))
      : 'No live data';
    const statusClass = m.snapshot?.ok ? 'up' : (errors.length ? 'down' : 'checking');
    return `
      <div class="machine-card" style="border-top-color:${mc(m.name)}">
        <div class="card-actions">
          ${m.backend_only ? `<span class="text-muted" style="font-size:11px">Auto</span>` : `
            <button class="btn-card-edit"   onclick="editMachine(${m.id}, event)"   title="Edit">✎</button>
            <button class="btn-card-delete" onclick="deleteMachine(${m.id}, event)" title="Delete">✕</button>
          `}
        </div>
        <div class="machine-card-header">
          <span class="machine-card-name" style="color:${mc(m.name)};display:flex;align-items:center;gap:8px">
            ${renderIcon(m.icon, 20)}${m.name}
          </span>
        </div>
        <div class="machine-card-meta">
          <div class="meta-row"><span class="meta-label">IP</span><span class="meta-value mono">${m.ip}</span></div>
          <div class="meta-row"><span class="meta-label">OS</span><span class="meta-value">${m.os || '—'}</span></div>
          <div class="meta-row"><span class="meta-label">VLAN</span><span class="meta-value mono">${m.vlan}</span></div>
          <div class="meta-row"><span class="meta-label">Role</span><span class="meta-value">${m.role}</span></div>
          <div class="meta-row"><span class="meta-label">SSH</span><span class="meta-value mono">${m.ssh_user || '—'}${m.ssh_port && m.ssh_port !== 22 ? `:${m.ssh_port}` : ''}</span></div>
          <div class="meta-row"><span class="meta-label">Status</span><span class="meta-value"><span class="status-dot ${statusClass}" style="margin-right:6px"></span>${statusText}</span></div>
        </div>
        ${m.snapshot ? `
          <div class="machine-card-meta">
            <div class="meta-row"><span class="meta-label">Uptime</span><span class="meta-value">${summary.uptime || '—'}</span></div>
            <div class="meta-row"><span class="meta-label">CPU</span><span class="meta-value">${summary.cpu_used_percent ?? '—'}${summary.cpu_used_percent != null ? '%' : ''}</span></div>
            <div class="meta-row"><span class="meta-label">Memory</span><span class="meta-value">${summary.memory_used_percent ?? '—'}${summary.memory_used_percent != null ? '%' : ''}</span></div>
            <div class="meta-row"><span class="meta-label">Ports</span><span class="meta-value mono">${summary.open_ports ?? 0}</span></div>
          </div>
        ` : ''}
        ${m.notes ? `<div class="machine-notes">${m.notes}</div>` : ''}
        <div class="machine-services-list">
          <div class="services-list-header">Services (${svcs.length})</div>
          ${svcs.map(s => `
            <div class="machine-service-item">
              <span class="service-bullet" aria-hidden="true">•</span>
              ${renderIcon(s.icon, 14)}
              <a href="${s.url}" target="_blank" class="machine-service-link">${s.name}</a>
              <span class="mono text-muted" style="font-size:11px">:${s.port}</span>
            </div>
          `).join('')}
          ${svcs.length === 0 ? '<div class="text-muted" style="font-size:12px">No services listed</div>' : ''}
        </div>
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NETWORK PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function renderNetwork() {
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Network')}
    <div id="net-live-section">
      <div class="net-live-loading">
        <span class="net-live-spinner"></span> Fetching live data…
      </div>
    </div>
  `;
  loadNetLiveSection();
}

async function loadNetLiveSection(refresh = false) {
  const el = document.getElementById('net-live-section');
  if (!el) return;

  try {
    const url = ROOT + 'api/network-integration.php' + (refresh ? '?refresh=1' : '');
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.integration) {
      // No integration configured — show a quiet prompt
      el.innerHTML = `
        <div class="net-live-unconfigured">
          <span>No network integration configured.</span>
          <a href="${ROOT}pages/settings.html" class="net-live-config-link">Configure in Settings →</a>
        </div>`;
      return;
    }

    if (data.error) {
      el.innerHTML = `<div class="net-live-error">⚠ ${esc(data.error)}</div>`;
      return;
    }

    el.innerHTML = data.integration === 'unifi'
      ? renderUnifiLive(data, data.cached)
      : renderOpnSenseLive(data, data.cached);

  } catch (e) {
    const el2 = document.getElementById('net-live-section');
    if (el2) el2.innerHTML = `<div class="net-live-error">⚠ Failed to load integration data</div>`;
  }
}

function _netFmtBytes(b) {
  if (b == null) return '—';
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB';
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB';
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB';
  return b + ' B';
}
function _netFmtBps(bps) {
  if (!bps) return '—';
  if (bps >= 1e6) return (bps / 1e6).toFixed(1) + ' Mbps';
  if (bps >= 1e3) return (bps / 1e3).toFixed(1) + ' Kbps';
  return bps + ' bps';
}
function _netFmtUptime(sec) {
  if (!sec) return '—';
  const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function renderUnifiLive(data, cached) {
  const wan      = data.wan     || {};
  const devices  = data.devices || [];
  const clients  = data.clients || [];
  const vlans    = data.vlans   || [];
  const wireless = clients.filter(c => c.type === 'wireless');
  const wired    = clients.filter(c => c.type === 'wired');
  const aps      = devices.filter(d => d.type === 'Access Point');
  const switches = devices.filter(d => d.type === 'Switch');
  const gateways = devices.filter(d => d.type !== 'Access Point' && d.type !== 'Switch');
  const vlanAccents = ['#58a6ff','#3fb950','#bc8cff','#39c5cf','#d29922','#e3b341'];

  const deviceRow = (d) => `
    <div class="ng-device-row">
      <span class="ng-dot ng-dot--${d.status}"></span>
      <div class="ng-device-info">
        <span class="ng-device-name">${esc(d.name)}</span>
        <span class="ng-device-sub">${[d.model, d.ip].filter(Boolean).join(' · ')}</span>
      </div>
      <div class="ng-device-aside">
        ${d.clients != null ? `<span class="ng-chip">${d.clients} clients</span>` : ''}
        <span class="ng-uptime">${_netFmtUptime(d.uptime)}</span>
      </div>
    </div>`;

  const glassCard = (cls, content) =>
    `<div class="ng-card ${cls || ''}">${content}</div>`;

  const cardHead = (icon, label, badge) => `
    <div class="ng-card-head">
      <span class="ng-card-head-icon">${icon}</span>
      <span class="ng-card-head-label">${label}</span>
      ${badge != null ? `<span class="ng-card-head-badge">${badge}</span>` : ''}
    </div>`;

  return `
    <div class="ng-hero">
      <div class="ng-hero-brand">
        <div class="ng-brand-dot"></div>
        <span class="ng-brand-label">UniFi</span>
        ${wan.status === 'online' || !wan.status ? '<span class="ng-hero-status">● online</span>' : '<span class="ng-hero-status ng-hero-status--warn">⚠ degraded</span>'}
      </div>
      <div class="ng-hero-stats">
        <div class="ng-hero-stat">
          <div class="ng-hero-num">${clients.length}</div>
          <div class="ng-hero-lbl">Total Clients</div>
        </div>
        <div class="ng-hero-sep"></div>
        <div class="ng-hero-stat">
          <div class="ng-hero-num ng-hero-num--blue">${wireless.length}</div>
          <div class="ng-hero-lbl">Wireless</div>
        </div>
        <div class="ng-hero-sep"></div>
        <div class="ng-hero-stat">
          <div class="ng-hero-num ng-hero-num--green">${wired.length}</div>
          <div class="ng-hero-lbl">Wired</div>
        </div>
        ${wan.rx_bps ? `
        <div class="ng-hero-sep"></div>
        <div class="ng-hero-stat">
          <div class="ng-hero-num ng-hero-num--cyan">↓ ${_netFmtBps(wan.rx_bps)}</div>
          <div class="ng-hero-lbl">Download</div>
        </div>` : ''}
        ${wan.tx_bps ? `
        <div class="ng-hero-sep"></div>
        <div class="ng-hero-stat">
          <div class="ng-hero-num ng-hero-num--purple">↑ ${_netFmtBps(wan.tx_bps)}</div>
          <div class="ng-hero-lbl">Upload</div>
        </div>` : ''}
        ${wan.latency_ms != null ? `
        <div class="ng-hero-sep"></div>
        <div class="ng-hero-stat">
          <div class="ng-hero-num">${wan.latency_ms}<span style="font-size:13px;font-weight:500;color:var(--text-muted)"> ms</span></div>
          <div class="ng-hero-lbl">Latency</div>
        </div>` : ''}
      </div>
      <div class="ng-hero-actions">
        ${cached ? '<span class="ng-cached-badge">cached</span>' : ''}
        <button class="btn-secondary" onclick="loadNetLiveSection(true)" style="font-size:12px;padding:5px 14px">⟳ Refresh</button>
      </div>
    </div>

    <div class="ng-grid">

      ${wan.ip ? glassCard('ng-card--wan', `
        ${cardHead('🌐', 'WAN')}
        <div class="ng-kv">
          <div class="ng-kv-row"><span>IP Address</span><span class="mono">${esc(wan.ip)}</span></div>
          ${wan.uptime_sec != null ? `<div class="ng-kv-row"><span>Uptime</span><span>${_netFmtUptime(wan.uptime_sec)}</span></div>` : ''}
          ${wan.latency_ms != null ? `<div class="ng-kv-row"><span>Latency</span><span>${wan.latency_ms} ms</span></div>` : ''}
          ${wan.rx_bps ? `<div class="ng-kv-row"><span>Download</span><span style="color:var(--cyan)">${_netFmtBps(wan.rx_bps)}</span></div>` : ''}
          ${wan.tx_bps ? `<div class="ng-kv-row"><span>Upload</span><span style="color:var(--purple)">${_netFmtBps(wan.tx_bps)}</span></div>` : ''}
        </div>`) : ''}

      ${gateways.length ? glassCard('', `
        ${cardHead('⬡', 'Gateway', null)}
        <div class="ng-devices">${gateways.map(deviceRow).join('')}</div>`) : ''}

      ${aps.length ? glassCard('', `
        ${cardHead('📡', 'Access Points', aps.length)}
        <div class="ng-devices">${aps.map(deviceRow).join('')}</div>`) : ''}

      ${switches.length ? glassCard('', `
        ${cardHead('🔀', 'Switches', switches.length)}
        <div class="ng-devices">${switches.map(deviceRow).join('')}</div>`) : ''}

    </div>

    ${vlans.length ? `
    <div class="ng-vlan-section">
      <div class="ng-vlan-section-head">
        <span>⬢</span>
        <span>Networks &amp; VLANs</span>
        <span class="ng-card-head-badge">${vlans.length}</span>
      </div>
      <div class="ng-vlan-row">
        ${vlans.map((v, i) => {
          const accent = vlanAccents[i % vlanAccents.length];
          return `
          <div class="ng-vlan-tile" style="--vlan-accent:${accent}">
            <div class="ng-vlan-glow"></div>
            <div class="ng-vlan-num">${v.vlan_id}</div>
            <div class="ng-vlan-name">${esc(v.name)}</div>
            <div class="ng-vlan-subnet">${esc(v.subnet || '—')}</div>
            <div class="ng-vlan-footer">
              ${v.dhcp
                ? '<span class="ng-vlan-badge ng-vlan-badge--dhcp">DHCP</span>'
                : '<span class="ng-vlan-badge ng-vlan-badge--static">Static</span>'}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;
}

function _unifiClientRows(clients) {
  if (!clients.length) return '<tr><td colspan="8" style="color:var(--text-subtle);text-align:center;padding:20px">No clients connected</td></tr>';
  return clients.map(c => `
    <tr data-search="${esc((c.hostname + c.ip + c.mac).toLowerCase())}" data-type="${c.type}">
      <td style="color:var(--text-bright);font-weight:500">${esc(c.hostname || '—')}</td>
      <td class="mono">${esc(c.ip)}</td>
      <td class="mono" style="color:var(--text-subtle);font-size:11px">${esc(c.mac)}</td>
      <td><span class="net-client-type net-client-type--${c.type}">${c.type}</span></td>
      <td class="mono" style="color:var(--text-muted)">${c.vlan != null ? c.vlan : '—'}</td>
      <td>${c.type === 'wireless' && c.signal != null ? `<span class="net-signal" title="${c.signal} dBm">${_netSignalBars(c.signal)}</span>` : '<span style="color:var(--text-subtle)">—</span>'}</td>
      <td style="color:var(--text-muted);font-size:12px">${esc(c.ap_name || '—')}</td>
      <td style="color:var(--text-subtle);font-size:12px">${_netFmtUptime(c.uptime)}</td>
    </tr>`).join('');
}

function _netSignalBars(dbm) {
  if (dbm >= -50) return '▂▄▆█';
  if (dbm >= -60) return '▂▄▆·';
  if (dbm >= -70) return '▂▄··';
  return '▂···';
}

function renderOpnSenseLive(data, cached) {
  const sys    = data.system     || {};
  const wan    = data.wan        || {};
  const ifaces = data.interfaces || [];
  const leases = data.leases     || [];

  return `
    <div class="net-live-header">
      <div class="net-live-brand net-live-brand--opnsense">OPNsense</div>
      <div class="net-live-stats">
        ${sys.hostname  ? `<div class="net-live-stat"><span class="net-live-stat-label">Host</span><span class="net-live-stat-val mono">${esc(sys.hostname)}</span></div>` : ''}
        ${wan.ip        ? `<div class="net-live-stat"><span class="net-live-stat-label">WAN IP</span><span class="net-live-stat-val mono">${esc(wan.ip)}</span></div>` : ''}
        ${sys.cpu_pct  != null ? `<div class="net-live-stat"><span class="net-live-stat-label">CPU</span><span class="net-live-stat-val">${sys.cpu_pct}%</span></div>` : ''}
        ${sys.mem_pct  != null ? `<div class="net-live-stat"><span class="net-live-stat-label">Memory</span><span class="net-live-stat-val">${sys.mem_pct}%</span></div>` : ''}
        ${sys.uptime   != null ? `<div class="net-live-stat"><span class="net-live-stat-label">Uptime</span><span class="net-live-stat-val">${_netFmtUptime(sys.uptime)}</span></div>` : ''}
        ${sys.version   ? `<div class="net-live-stat"><span class="net-live-stat-label">Version</span><span class="net-live-stat-val">${esc(sys.version)}</span></div>` : ''}
        <div class="net-live-stat"><span class="net-live-stat-label">DHCP Leases</span><span class="net-live-stat-val">${leases.length}</span></div>
      </div>
      <button class="btn-secondary net-live-refresh-btn" onclick="loadNetLiveSection(true)">⟳ Refresh</button>
    </div>

    <div class="net-live-tabs" id="net-live-tabs">
      <button class="net-live-tab active" onclick="netLiveTab('leases', this)">
        DHCP Leases <span class="net-tab-count">${leases.length}</span>
      </button>
      <button class="net-live-tab" onclick="netLiveTab('interfaces', this)">
        Interfaces <span class="net-tab-count">${ifaces.length}</span>
      </button>
    </div>

    <div id="net-live-tab-leases" class="net-live-tab-panel">
      <div class="net-live-toolbar">
        <input type="text" class="filter-input" placeholder="Search hostname, IP, MAC…"
               oninput="netFilterClients(this.value, 'opn-leases-tbody')" style="width:240px">
      </div>
      <table class="network-table">
        <thead><tr><th>Hostname</th><th>IP</th><th>MAC</th><th>Status</th><th>Expires</th><th>Interface</th></tr></thead>
        <tbody id="opn-leases-tbody">${leases.map(l => `
          <tr data-search="${esc((l.hostname + l.ip + l.mac).toLowerCase())}">
            <td style="color:var(--text-bright)">${esc(l.hostname || '—')}</td>
            <td class="mono">${esc(l.ip)}</td>
            <td class="mono" style="color:var(--text-subtle);font-size:11px">${esc(l.mac)}</td>
            <td><span class="net-status-dot net-status-dot--${l.status === 'active' ? 'online' : 'offline'}"></span>${esc(l.status)}</td>
            <td style="color:var(--text-subtle);font-size:12px">${esc(l.ends || '—')}</td>
            <td style="color:var(--text-muted)">${esc(l.if || '—')}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div id="net-live-tab-interfaces" class="net-live-tab-panel" hidden>
      <table class="network-table">
        <thead><tr><th>Interface</th><th>Device</th><th>IP</th><th>Status</th><th>RX</th><th>TX</th><th>Errors</th></tr></thead>
        <tbody>${ifaces.map(i => `
          <tr>
            <td style="color:var(--text-bright);font-weight:500">${esc(i.name)}</td>
            <td class="mono" style="color:var(--text-subtle)">${esc(i.device)}</td>
            <td class="mono">${esc(i.ip || '—')}</td>
            <td><span class="net-status-dot net-status-dot--${i.status === 'up' ? 'online' : 'offline'}"></span>${i.status}</td>
            <td style="color:var(--text-muted)">${_netFmtBytes(i.rx_bytes)}</td>
            <td style="color:var(--text-muted)">${_netFmtBytes(i.tx_bytes)}</td>
            <td style="color:${(i.rx_errors + i.tx_errors) > 0 ? 'var(--orange)' : 'var(--text-subtle)'}">${i.rx_errors + i.tx_errors || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${cached ? '<div class="net-live-cached-note">Cached data · refreshes every 30s</div>' : ''}
  `;
}

function netLiveTab(id, btn) {
  document.querySelectorAll('.net-live-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.net-live-tab-panel').forEach(p => p.hidden = true);
  btn.classList.add('active');
  const panel = document.getElementById('net-live-tab-' + id);
  if (panel) panel.hidden = false;
}

function netFilterClients(query, tbodyId) {
  const q    = query.toLowerCase();
  const type = document.querySelector('.net-filter-tab.active')?.dataset.filter || 'all';
  document.querySelectorAll(`#${tbodyId} tr[data-search]`).forEach(row => {
    const matchQ = !q || row.dataset.search.includes(q);
    const matchT = type === 'all' || row.dataset.type === type;
    row.hidden = !(matchQ && matchT);
  });
}

function netClientFilter(type, btn) {
  document.querySelectorAll('.net-filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  btn.dataset.filter = type;
  const searchEl = document.querySelector('#unifi-clients-tbody')?.closest('.net-section')?.querySelector('.filter-input');
  netFilterClients(searchEl?.value || '', 'unifi-clients-tbody');
}

function renderVlanRows(vlans) {
  return (vlans || []).map(v => `
    <tr>
      <td class="mono" style="color:var(--cyan)">${v.id}</td>
      <td>${v.name}</td><td class="mono">${v.subnet}</td>
      <td><div class="row-actions">
        <button class="btn-row-edit"   onclick="editVlan(${v.id})"   title="Edit">✎</button>
        <button class="btn-row-delete" onclick="deleteVlan(${v.id})" title="Delete">✕</button>
      </div></td>
    </tr>`).join('');
}

function renderUnifiRows(devices) {
  return (devices || []).map(d => `
    <tr>
      <td style="color:var(--text-bright);font-weight:500">${d.name}</td>
      <td class="mono">${d.ip}</td>
      <td style="color:var(--text-muted)">${d.role}</td>
      <td><div class="row-actions">
        <button class="btn-row-edit"   onclick="editUnifi(${d.id})"   title="Edit">✎</button>
        <button class="btn-row-delete" onclick="deleteUnifi(${d.id})" title="Delete">✕</button>
      </div></td>
    </tr>`).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MODELS PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function renderModels() {
  const { models } = DATA;
  const maxVram = Math.max(...models.map(m => m.vram_gb), 1);
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Ollama Models')}
    <div class="page-toolbar">
      <button class="btn-add" onclick="addModel()">+ Add Model</button>
    </div>
    <table class="data-table">
      <thead><tr><th>Model</th><th>Host</th><th>VRAM</th><th>Best For</th><th></th></tr></thead>
      <tbody id="models-tbody">${renderModelRows(models, maxVram)}</tbody>
    </table>
  `;
}

function renderModelRows(models, maxVram) {
  return models.map(m => `
    <tr>
      <td style="display:flex;align-items:center;gap:9px">
        ${renderIcon(m.icon, 18)}
        <span class="mono" style="color:var(--text-bright)">${m.name}</span>
      </td>
      <td style="color:${mc(m.machine)};font-weight:500">${m.machine}</td>
      <td>
        <div class="vram-bar">
          <div class="vram-track">
            <div class="vram-fill" style="width:${Math.round((m.vram_gb / maxVram) * 100)}%"></div>
          </div>
          <span class="vram-text">${m.vram_gb} GB</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${m.best_for}</td>
      <td><div class="row-actions">
        <button class="btn-row-edit"   onclick="editModel(${m.id})"   title="Edit">✎</button>
        <button class="btn-row-delete" onclick="deleteModel(${m.id})" title="Delete">✕</button>
      </div></td>
    </tr>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════════
   WORKFLOWS PAGE
═══════════════════════════════════════════════════════════════════════════════ */
function renderWorkflows() {
  const { workflows } = DATA;
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Workflows')}
    <div class="page-toolbar">
      <button class="btn-add" onclick="addWorkflow()">+ Add Workflow</button>
    </div>
    <div class="workflows-list" id="workflows-list">
      ${workflowCards(workflows)}
    </div>
  `;
}

function workflowCards(workflows) {
  return workflows.map(w => `
    <div class="workflow-card">
      <div class="card-actions">
        <button class="btn-card-edit"   onclick="editWorkflow(${w.id}, event)"   title="Edit">✎</button>
        <button class="btn-card-delete" onclick="deleteWorkflow(${w.id}, event)" title="Delete">✕</button>
      </div>
      <div class="workflow-header">
        <span class="workflow-name" style="display:flex;align-items:center;gap:9px">
          ${renderIcon(w.icon, 18)}${w.name}
        </span>
        <span class="workflow-status ${w.status}">${w.status}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Machine</span>
        <span class="meta-value" style="color:${mc(w.machine)};font-weight:500">${w.machine}</span>
      </div>
      <div class="workflow-notes">${w.notes}</div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════════════════════
   NOTES PAGE  (per-machine markdown notes stored as .md files)
═══════════════════════════════════════════════════════════════════════════════ */
let notesActiveMachineId = null;
let notesHasChanges      = false;

async function renderNotes() {
  const { machines } = DATA;
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Machine Notes')}
    <div class="mnotes-layout">
      <div class="mnotes-machine-list" id="mnotes-machine-list">
        ${machines.map(m => `
          <div class="mnotes-machine-item" data-machine-id="${m.id}"
               onclick="selectNotesMachine(${m.id})"
               style="border-left-color:${mc(m.name)}">
            <span class="mnotes-machine-icon">${renderIcon(m.icon, 16)}</span>
            <span class="mnotes-machine-name" style="color:${mc(m.name)}">${m.name}</span>
            <span class="mnotes-note-dot" id="mnotes-dot-${m.id}"></span>
          </div>`).join('')}
      </div>
      <div class="mnotes-editor-panel" id="mnotes-editor-panel">
        <div class="mnotes-empty-state">Select a machine to view or create its note.</div>
      </div>
    </div>`;

  notesActiveMachineId = null;
  notesHasChanges = false;
  await _refreshNotesDots();
  if (machines.length > 0) selectNotesMachine(machines[0].id);
}

async function _refreshNotesDots() {
  try {
    const res  = await fetch(ROOT + 'api/machine-notes.php');
    const data = await res.json();
    const ids  = new Set(data.ids || []);
    document.querySelectorAll('.mnotes-note-dot').forEach(dot => {
      const id = parseInt(dot.id.replace('mnotes-dot-', ''));
      dot.classList.toggle('has-note', ids.has(id));
    });
  } catch {}
}

async function selectNotesMachine(id) {
  if (notesActiveMachineId === id) return;

  if (notesHasChanges) {
    if (!confirm('You have unsaved changes. Discard them?')) return;
    notesHasChanges = false;
  }

  notesActiveMachineId = id;
  document.querySelectorAll('.mnotes-machine-item').forEach(el =>
    el.classList.toggle('active', parseInt(el.dataset.machineId) === id)
  );

  const machine = DATA.machines.find(m => m.id === id);
  if (!machine) return;

  const panel = document.getElementById('mnotes-editor-panel');
  panel.innerHTML = '<div class="mnotes-loading">Loading…</div>';

  try {
    const res  = await fetch(ROOT + `api/machine-notes.php?machine_id=${id}`);
    const data = await res.json();
    _renderNoteEditor(machine, data.exists, data.content || '');
  } catch {
    panel.innerHTML = '<div class="mnotes-empty-state">Failed to load note.</div>';
  }
}

function _renderNoteEditor(machine, exists, content) {
  const panel = document.getElementById('mnotes-editor-panel');
  notesHasChanges = false;

  if (!exists) {
    panel.innerHTML = `
      <div class="mnotes-editor-header">
        <span class="mnotes-editor-title" style="color:${mc(machine.name)}">${machine.name}</span>
      </div>
      <div class="mnotes-no-note">
        <div class="mnotes-no-note-icon">◧</div>
        <p>No note for this machine yet.</p>
        <button class="btn-add" onclick="createMachineNote(${machine.id})">+ Create Note</button>
      </div>`;
  } else {
    panel.innerHTML = `
      <div class="mnotes-editor-header">
        <span class="mnotes-editor-title" style="color:${mc(machine.name)}">${machine.name}</span>
        <div class="mnotes-editor-actions">
          <button class="btn-danger" onclick="deleteMachineNote(${machine.id})">Delete Note</button>
          <button class="btn-primary" id="mnotes-save-btn" onclick="saveMachineNote(${machine.id})">Save</button>
        </div>
      </div>
      <textarea class="mnotes-textarea" id="mnotes-textarea"
                placeholder="Write your note in Markdown…"
                oninput="notesMarkDirty()">${htmlEsc(content)}</textarea>`;
  }
}

function notesMarkDirty() {
  notesHasChanges = true;
  const btn = document.getElementById('mnotes-save-btn');
  if (btn && !btn.textContent.endsWith('*')) btn.textContent = 'Save *';
}

async function createMachineNote(id) {
  const machine = DATA.machines.find(m => m.id === id);
  if (!machine) return;
  const res = await fetch(ROOT + `api/machine-notes.php?machine_id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '' }),
  });
  if (!res.ok) { toast('Failed to create note', 'error'); return; }
  _renderNoteEditor(machine, true, '');
  await _refreshNotesDots();
  toast(`Note created for ${machine.name}`);
}

async function saveMachineNote(id) {
  const machine  = DATA.machines.find(m => m.id === id);
  const textarea = document.getElementById('mnotes-textarea');
  if (!machine || !textarea) return;
  const res = await fetch(ROOT + `api/machine-notes.php?machine_id=${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: textarea.value }),
  });
  if (!res.ok) { toast('Failed to save', 'error'); return; }
  notesHasChanges = false;
  const btn = document.getElementById('mnotes-save-btn');
  if (btn) btn.textContent = 'Save';
  await _refreshNotesDots();
  toast('Note saved');
}

async function deleteMachineNote(id) {
  const machine = DATA.machines.find(m => m.id === id);
  if (!machine) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div class="modal-header">
        <span class="modal-title">Delete Note</span>
      </div>
      <div class="modal-body" style="padding:20px 24px">
        <p style="margin:0;color:var(--text-muted);font-size:14px">
          Delete the note for <strong style="color:${mc(machine.name)}">${machine.name}</strong>?
          This cannot be undone.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="mndel-cancel">Cancel</button>
        <div class="modal-footer-right">
          <button class="btn-danger" id="mndel-confirm">Delete</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#mndel-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('#mndel-confirm').onclick = async () => {
    overlay.remove();
    const res = await fetch(ROOT + `api/machine-notes.php?machine_id=${id}`, { method: 'DELETE' });
    if (!res.ok) { toast('Failed to delete note', 'error'); return; }
    notesHasChanges = false;
    _renderNoteEditor(machine, false, '');
    await _refreshNotesDots();
    toast('Note deleted', 'warn');
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   RUNBOOK PAGE
═══════════════════════════════════════════════════════════════════════════════ */
const RUNBOOK_MD = `# Runbook

## Common Commands

### Docker
\`\`\`
docker ps -a                       # list all containers
docker compose up -d               # start services
docker compose down                # stop services
docker compose logs -f             # follow all logs
docker logs <container> -f         # follow single container
docker exec -it <container> sh     # shell into container
docker system prune -f             # clean up stopped containers
\`\`\`

### Systemd
\`\`\`
systemctl status <service>
systemctl restart <service>
systemctl enable <service>
journalctl -u <service> -f
journalctl -u <service> --since today
\`\`\`

### Networking
\`\`\`
ss -tlnp | grep <port>
ip a
ping -c 3 <ip>
ssh jaxraven@<ip>
\`\`\`

## Machine Notes

### Sentinel — 192.168.1.66 · AI / LLM
- Ollama runs as native **systemd** service on port **11434**
- GPU passthrough active — verify with \`nvidia-smi\`
- Open WebUI at **:8080** via Docker
- SearXNG (:8888) and Qdrant (:6333) via Docker Compose
- Restart Ollama: \`systemctl restart ollama\`
- Ollama model data: \`/usr/share/ollama/.ollama/models\`

### Relay — 192.168.1.155 · n8n Automation
- n8n via **Docker Compose** at \`/home/jaxraven/n8n\`
- Restart: \`cd /home/jaxraven/n8n && docker compose restart\`
- Tex workflow SSHs into Forge to monitor and heal Apache2

### Forge — 192.168.1.172 · Apache2 Web Dev
- Web root: \`/var/www/html\`
- This dashboard: \`/var/www/html/dashboard\`
- Restart Apache2: \`systemctl restart apache2\`
- Config: \`/etc/apache2/sites-enabled/\`

### Vault — 192.168.1.195 · Nextcloud / Storage
- Nextcloud 31 on Apache2 + MariaDB
- Tailscale external access: **100.81.181.15**
- Restart: \`systemctl restart apache2 mariadb\`

### Horizon — 192.168.1.214 · Monitoring
- Zabbix with PostgreSQL 15 + Apache2
- Web UI on port **80** — default login: **Admin / zabbix**
- Change default password immediately if not done

### Nova / Pulse — DNS
- Pi-hole primary: http://192.168.1.5/admin
- Pi-hole secondary: http://192.168.1.8/admin

## Troubleshooting

### Service not responding
- Check systemd: \`systemctl status <service>\`
- Check Docker: \`docker ps\` → \`docker logs <name>\`
- Check port: \`ss -tlnp | grep <port>\`
- Check firewall: \`ufw status\`
- Check resources: \`htop\`, \`df -h\`, \`free -h\`

### Ollama out of VRAM
- Check GPU: \`nvidia-smi\`
- List loaded models: \`ollama ps\`
- Switch to smaller model or restart service
`;

function renderRunbook() {
  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Runbook')}
    <div class="runbook-content" id="runbook-body"></div>
  `;
  document.getElementById('runbook-body').innerHTML = mdToHtml(RUNBOOK_MD);
}

/* ─── Settings ───────────────────────────────────────────────────────────────── */
const THEME_GROUPS = [
  {
    label: 'Backgrounds',
    vars: [
      { key: '--bg', label: 'Page background' },
    ]
  },
  {
    label: 'Text',
    vars: [
      { key: '--text',        label: 'Primary text' },
      { key: '--text-muted',  label: 'Muted text' },
      { key: '--text-subtle', label: 'Subtle text' },
      { key: '--text-bright', label: 'Bright text' },
    ]
  },
  {
    label: 'Accent Colors',
    vars: [
      { key: '--green',  label: 'Green' },
      { key: '--blue',   label: 'Blue' },
      { key: '--purple', label: 'Purple' },
      { key: '--red',    label: 'Red' },
      { key: '--orange', label: 'Orange' },
      { key: '--cyan',   label: 'Cyan' },
      { key: '--yellow', label: 'Yellow' },
    ]
  },
  {
    label: 'Sidebar',
    vars: [
      { key: '--nav-active-color', label: 'Active page highlight color' },
    ]
  },
  {
    label: 'Cards',
    vars: [
      { key: '--card-accent', label: 'Card accent color (border top)' },
    ]
  },
];

function toHex6(color) {
  // Strips alpha from 8-char hex so <input type=color> accepts it
  if (/^#[0-9a-f]{8}$/i.test(color)) return color.slice(0, 7);
  return color;
}

function toFullHex(color) {
  // Expands 3-digit hex to 6-digit
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return '#' + [...color.slice(1)].map(c => c + c).join('');
  }
  return color;
}

async function renderSettings() {
  const res  = await fetch(ROOT + 'api/settings.php');
  const vals = await res.json();

  const groups = THEME_GROUPS.map(g => `
    <div class="settings-group">
      <div class="settings-group-label">${g.label}</div>
      ${g.vars.map(v => {
        const raw  = vals[v.key] || '#000000';
        const hex6 = toHex6(raw);
        return `
          <div class="settings-row" data-var="${v.key}">
            <label class="settings-label">${v.label}</label>
            <div class="settings-control">
              <input type="color" class="settings-color-input" value="${hex6}"
                     data-var="${v.key}" data-raw="${raw}" onchange="onColorChange(this)">
              <span class="settings-hex-value" id="hex-${v.key.replace(/--/g,'').replace(/-/g,'_')}">${raw}</span>
            </div>
          </div>`;
      }).join('')}
    </div>`).join('');

  document.getElementById('page-content').innerHTML = `
    ${pageHeader('Settings')}

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>Appearance</span>
        <span class="settings-accordion-hint">Colors &amp; theme</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">${groups}</div>

        <div class="settings-group" style="margin-top:0">
          <div class="settings-group-label">Topology Map</div>
          <div class="settings-row">
            <label class="settings-label" for="set-topo-grid">Show grid / dots</label>
            <div class="settings-control">
              <label class="toggle-switch">
                <input type="checkbox" id="set-topo-grid" ${vals.topo_show_grid !== '0' ? 'checked' : ''}>
                <span class="toggle-track"><span class="toggle-thumb"></span></span>
              </label>
            </div>
          </div>
        </div>

        <div class="settings-accordion-footer">
          <button class="btn-secondary" onclick="resetTheme()">↺ Reset to defaults</button>
          <button class="btn-primary" onclick="saveTheme()">✓ Save</button>
        </div>
      </div>
    </div>

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>System &amp; Integrations</span>
        <span class="settings-accordion-hint">Timezone, location, SMTP, AI assistant</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">

          <div class="settings-group">
            <div class="settings-group-label">Regional</div>
            <div class="settings-row">
              <label class="settings-label" for="set-timezone">Timezone</label>
              <div class="settings-control">
                <select class="form-select settings-select" id="set-timezone">
                  ${Intl.supportedValuesOf('timeZone').map(tz =>
                    `<option value="${tz}"${tz === (vals.sys_timezone || 'America/New_York') ? ' selected' : ''}>${tz}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-zipcode">Location <span class="settings-alpha-note">(ZIP code)</span></label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-zipcode"
                       placeholder="e.g. 10001" maxlength="10" value="${vals.sys_zipcode || ''}">
              </div>
            </div>
          </div>


          <div class="settings-group">
            <div class="settings-group-label">Calendar</div>
            <div class="settings-row">
              <label class="settings-label" for="set-calendar-ics">Google Calendar ICS URL</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-calendar-ics"
                       placeholder="https://calendar.google.com/calendar/ical/..." value="${vals.calendar_ics_url || ''}">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-calendar-days">Look-ahead window</label>
              <div class="settings-control">
                <input type="number" class="form-input settings-text-input settings-text-input--short" id="set-calendar-days"
                       placeholder="30" value="${vals.calendar_days || '30'}" min="1" max="90">
              </div>
            </div>
          </div>

          <div class="settings-group">
            <div class="settings-group-label">SMTP</div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-host">Host</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-smtp-host"
                       placeholder="e.g. smtp.gmail.com" value="${esc(vals.smtp_host || '')}">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-port">Port</label>
              <div class="settings-control">
                <input type="number" class="form-input settings-text-input settings-text-input--short" id="set-smtp-port"
                       placeholder="587" value="${vals.smtp_port || '587'}" min="1" max="65535">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-user">Username</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-smtp-user"
                       placeholder="user@example.com" value="${esc(vals.smtp_user || '')}">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-pass">Password</label>
              <div class="settings-control" style="flex-direction:column;align-items:flex-start;gap:4px">
                <input type="password" class="form-input settings-text-input" id="set-smtp-pass"
                       placeholder="${vals.smtp_pass_set === '1' ? '(saved — leave blank to keep)' : 'Enter password'}">
                ${vals.smtp_pass_set === '1'
                  ? `<span class="smtp-pass-saved-hint">🔒 Password saved &amp; encrypted</span>`
                  : ''}
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-from">From address</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-smtp-from"
                       placeholder="homelab@example.com" value="${esc(vals.smtp_from || '')}">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-smtp-tls">Encryption</label>
              <div class="settings-control">
                <select class="form-select settings-select" id="set-smtp-tls">
                  ${[['tls','TLS / STARTTLS'],['ssl','SSL'],['none','None']].map(([v,l]) =>
                    `<option value="${v}"${(vals.smtp_tls||'tls')===v?' selected':''}>${l}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label"></label>
              <div class="settings-control">
                <button class="btn-secondary" onclick="openSmtpTestModal()">✉ Test SMTP</button>
              </div>
            </div>
          </div>

          <div class="settings-group">
            <div class="settings-group-label">AI Assistant</div>
            <div class="settings-row">
              <label class="settings-label" for="set-chat-enabled">Enable chat assistant</label>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" id="set-chat-enabled" ${vals.chat_enabled === '1' ? 'checked' : ''}>
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                </label>
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-chat-provider">LLM Provider</label>
              <div class="settings-control">
                <select class="form-select settings-select" id="set-chat-provider" onchange="chatProviderChange(this.value)">
                  ${[['','— Select provider —'],['claude','Anthropic Claude'],['openai','OpenAI'],['ollama','Ollama (local)'],['custom','Custom endpoint']].map(([v,l]) =>
                    `<option value="${v}"${(vals.chat_llm_provider||'')=== v?' selected':''}>${l}</option>`
                  ).join('')}
                </select>
              </div>
            </div>
            <div class="settings-row" id="chat-url-row">
              <label class="settings-label" for="set-chat-url">Base URL</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-chat-url"
                       placeholder="e.g. http://192.168.1.66:11434" value="${esc(vals.chat_llm_url || '')}">
              </div>
            </div>
            <div class="settings-row" id="chat-key-row">
              <label class="settings-label" for="set-chat-api-key">API Key</label>
              <div class="settings-control" style="flex-direction:column;align-items:flex-start;gap:4px">
                <input type="password" class="form-input settings-text-input" id="set-chat-api-key"
                       placeholder="${(vals.chat_api_key_openai_set === '1' || vals.chat_api_key_claude_set === '1') ? '(saved — leave blank to keep)' : 'Enter API key'}">
                ${(vals.chat_api_key_openai_set === '1' || vals.chat_api_key_claude_set === '1')
                  ? `<span class="smtp-pass-saved-hint">🔒 API key saved &amp; encrypted</span>` : ''}
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-chat-model">Model</label>
              <div class="settings-control" id="chat-model-control">
                <input type="text" class="form-input settings-text-input" id="set-chat-model"
                       placeholder="e.g. llama3.1:8b, gpt-4o, claude-sonnet-4-6" value="${esc(vals.chat_llm_model || '')}">
              </div>
            </div>
          </div>


        </div>
        <div class="settings-accordion-footer">
          <button class="btn-primary" onclick="saveSystemSettings()">✓ Save</button>
        </div>
      </div>
    </div>

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>Network Integration</span>
        <span class="settings-accordion-hint">UniFi or OPNsense live data</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">

          <div class="settings-group">
            <div class="settings-group-label">Integration</div>
            <div class="settings-row">
              <label class="settings-label" for="set-net-integration">Type</label>
              <div class="settings-control">
                <select class="form-select settings-select" id="set-net-integration"
                        onchange="onNetIntegrationChange(this.value)">
                  <option value=""${!vals.net_integration ? ' selected' : ''}>(none)</option>
                  <option value="unifi"${vals.net_integration==='unifi'?' selected':''}>UniFi Network Application</option>
                  <option value="opnsense"${vals.net_integration==='opnsense'?' selected':''}>OPNsense</option>
                </select>
              </div>
            </div>
          </div>

          <div class="settings-group" id="net-cfg-group" ${!vals.net_integration ? 'hidden' : ''}>
            <div class="settings-group-label">Connection</div>
            <div class="settings-row">
              <label class="settings-label" for="set-net-host">Host URL</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-net-host"
                       placeholder="https://192.168.1.1:8443" value="${esc(vals.net_host || '')}">
              </div>
            </div>

            <div class="settings-row net-unifi-only" ${vals.net_integration!=='unifi'?'hidden':''}>
              <label class="settings-label" for="set-net-site">Site name</label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input settings-text-input--short" id="set-net-site"
                       placeholder="default" value="${esc(vals.net_site || 'default')}">
              </div>
            </div>

            <div class="settings-row net-unifi-only" ${vals.net_integration!=='unifi'?'hidden':''}>
              <label class="settings-label" for="set-net-auth-mode">Auth method</label>
              <div class="settings-control">
                <select class="form-select settings-select" id="set-net-auth-mode"
                        onchange="onNetAuthModeChange(this.value)">
                  <option value="credentials"${(vals.net_auth_mode||'credentials')==='credentials'?' selected':''}>Username / Password</option>
                  <option value="apikey"${vals.net_auth_mode==='apikey'?' selected':''}>API Key (v8+, no 2FA)</option>
                </select>
              </div>
            </div>

            <div class="settings-row net-credentials-row" ${vals.net_integration==='unifi'&&vals.net_auth_mode==='apikey'?'hidden':''}>
              <label class="settings-label" for="set-net-user" id="net-user-label">
                ${vals.net_integration === 'opnsense' ? 'API Key' : 'Username'}
              </label>
              <div class="settings-control">
                <input type="text" class="form-input settings-text-input" id="set-net-user"
                       placeholder="${vals.net_integration === 'opnsense' ? 'API key' : 'admin'}"
                       value="${esc(vals.net_user || '')}">
              </div>
            </div>

            <div class="settings-row">
              <label class="settings-label" for="set-net-pass" id="net-pass-label">
                ${vals.net_integration === 'opnsense' ? 'API Secret' : vals.net_auth_mode === 'apikey' ? 'API Key' : 'Password'}
              </label>
              <div class="settings-control" style="flex-direction:column;align-items:flex-start;gap:4px">
                <input type="password" class="form-input settings-text-input" id="set-net-pass"
                       placeholder="${vals.net_pass_set === '1' ? '(saved — leave blank to keep)' : vals.net_integration === 'opnsense' ? 'API secret' : vals.net_auth_mode === 'apikey' ? 'Paste API key here' : 'Password'}">
                ${vals.net_pass_set === '1' ? '<span class="smtp-pass-saved-hint">🔒 Credential saved &amp; encrypted</span>' : ''}
              </div>
            </div>

            <div class="settings-row net-unifi-only" ${vals.net_integration!=='unifi'?'hidden':''}>
              <label class="settings-label" for="set-net-unifi-os">UniFi OS device</label>
              <div class="settings-control">
                <label class="toggle-switch" title="Enable for UDM Pro, UDM SE, UCK Gen2+">
                  <input type="checkbox" id="set-net-unifi-os" ${vals.net_unifi_os==='1'?'checked':''}>
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                </label>
                <span style="font-size:11px;color:var(--text-subtle);margin-left:8px">UDM, UDM Pro, UCK Gen2+</span>
              </div>
            </div>

            <div class="settings-row">
              <label class="settings-label" for="set-net-verify-ssl">Verify SSL</label>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" id="set-net-verify-ssl" ${vals.net_verify_ssl==='1'?'checked':''}>
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                </label>
                <span style="font-size:11px;color:var(--text-subtle);margin-left:8px">Disable for self-signed certs</span>
              </div>
            </div>
          </div>

        </div>
        <div class="settings-accordion-footer">
          <button class="btn-primary" onclick="saveNetIntegrationSettings()">✓ Save</button>
        </div>
      </div>
    </div>

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>News &amp; Feeds</span>
        <span class="settings-accordion-hint">RSS sources for the news dashboard widget</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">
          <div class="settings-group">
            <div class="settings-group-label">Widget</div>
            <div class="settings-row">
              <label class="settings-label" for="set-news-enabled">Enable news widget</label>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" id="set-news-enabled" ${(vals.news_enabled === '1') ? 'checked' : ''}>
                  <span class="toggle-track"><span class="toggle-thumb"></span></span>
                </label>
              </div>
            </div>
          </div>

          <div class="settings-group">
            <div class="settings-group-label">Sources</div>
            <div id="news-sources-list">
              ${buildNewsSourcesHTML(JSON.parse(vals.news_sources || '[]'))}
            </div>
            <div class="news-add-source-row">
              <input type="text"  class="form-input settings-text-input" id="news-add-name"
                     placeholder="Source name (e.g. CNN)" style="flex:0 0 180px">
              <input type="text"  class="form-input settings-text-input" id="news-add-url"
                     placeholder="RSS feed URL (e.g. https://...)" style="flex:1">
              <button class="btn-secondary" onclick="addNewsSource()">+ Add</button>
            </div>
          </div>
        </div>
        <div class="settings-accordion-footer">
          <button class="btn-primary" onclick="saveNewsSettings()">✓ Save</button>
        </div>
      </div>
    </div>

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>Security</span>
        <span class="settings-accordion-hint">Change dashboard password</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">
          <div class="settings-group">
            <div class="settings-group-label">Change Password</div>
            <div class="settings-row">
              <label class="settings-label" for="set-pw-current">Current password</label>
              <div class="settings-control">
                <input type="password" class="form-input settings-text-input" id="set-pw-current" autocomplete="current-password">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-pw-new">New password</label>
              <div class="settings-control">
                <input type="password" class="form-input settings-text-input" id="set-pw-new" autocomplete="new-password">
              </div>
            </div>
            <div class="settings-row">
              <label class="settings-label" for="set-pw-confirm">Confirm new password</label>
              <div class="settings-control">
                <input type="password" class="form-input settings-text-input" id="set-pw-confirm" autocomplete="new-password">
              </div>
            </div>
          </div>
        </div>
        <div class="settings-accordion-footer">
          <button class="btn-primary" onclick="changePassword()">✓ Save</button>
        </div>
      </div>
    </div>

    <div class="settings-accordion">
      <button class="settings-accordion-header" onclick="toggleAccordion(this)" aria-expanded="false">
        <span class="settings-accordion-icon">▶</span>
        <span>Danger Zone</span>
        <span class="settings-accordion-hint">Reset application data</span>
      </button>
      <div class="settings-accordion-body" hidden>
        <div class="settings-groups">
          <div class="settings-group">
            <div class="settings-group-label">Reset App</div>
            <div class="settings-row">
              <div class="settings-label" style="color:var(--text-muted)">Deletes all settings, services, machines, and notes. You will be taken back through the setup wizard. This cannot be undone.</div>
            </div>
            <div class="settings-row" style="margin-top:8px">
              <button class="btn-danger" onclick="showResetModal()">Reset App</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  // Post-render DOM updates
  setTimeout(() => {
    chatProviderChange(vals.chat_llm_provider || '');
  }, 0);
}

function toggleAccordion(btn) {
  const body     = btn.nextElementSibling;
  const icon     = btn.querySelector('.settings-accordion-icon');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!expanded));
  icon.textContent = expanded ? '▶' : '▼';
  body.hidden = expanded;
}

function onColorChange(input) {
  const key = input.dataset.var;
  const val = toFullHex(input.value);
  // Update live preview on :root
  document.documentElement.style.setProperty(key, val);
  // Update the hex label
  const labelId = 'hex-' + key.replace(/--/g,'').replace(/-/g,'_');
  const label = document.getElementById(labelId);
  if (label) label.textContent = val;
  input.dataset.raw = val;
}

async function saveTheme() {
  const payload = {};
  document.querySelectorAll('.settings-color-input').forEach(inp => {
    payload[inp.dataset.var] = toFullHex(inp.value);
  });
  payload.topo_show_grid = document.getElementById('set-topo-grid')?.checked ? '1' : '0';
  const res = await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    document.body.classList.toggle('topo-grid-off', payload.topo_show_grid === '0');
    toast('Theme saved');
  } else {
    toast('Save failed', 'err');
  }
}

async function saveSystemSettings() {
  const g = id => document.getElementById(id)?.value ?? '';
  const payload = {
    sys_timezone: g('set-timezone'),
    sys_zipcode:  g('set-zipcode'),
    calendar_ics_url: g('set-calendar-ics'),
    calendar_days:    g('set-calendar-days'),
    smtp_host:    g('set-smtp-host'),
    smtp_port:    g('set-smtp-port'),
    smtp_user:    g('set-smtp-user'),
    smtp_pass:    g('set-smtp-pass'),
    smtp_from:    g('set-smtp-from'),
    smtp_tls:     g('set-smtp-tls'),
    chat_enabled:            document.getElementById('set-chat-enabled')?.checked ? '1' : '0',
    chat_llm_provider:       g('set-chat-provider'),
    chat_llm_url:            g('set-chat-url'),
    chat_llm_model:          g('set-chat-model'),
    ...chatApiKeyPayload(),
  };
  const res = await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    toast('System settings saved');
    initChatBubble(); // re-apply show/hide based on new setting
  } else {
    toast('Save failed', 'err');
  }
}

/* ─── SMTP test modal ────────────────────────────────────────────────────────── */
function openSmtpTestModal() {
  if (document.getElementById('smtp-test-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'smtp-test-overlay';
  overlay.className = 'smtp-modal-overlay';
  overlay.innerHTML = `
    <div class="smtp-modal" role="dialog" aria-modal="true" aria-labelledby="smtp-modal-title">
      <div class="smtp-modal-header">
        <span id="smtp-modal-title">Test SMTP</span>
        <button class="smtp-modal-close" onclick="closeSmtpTestModal()" title="Close">✕</button>
      </div>
      <div class="smtp-modal-body">
        <p class="smtp-modal-desc">Send a test email to verify your SMTP configuration.</p>
        <div class="smtp-modal-field">
          <label class="smtp-modal-label" for="smtp-test-to">Send to</label>
          <input type="email" id="smtp-test-to" class="form-input smtp-modal-input"
                 placeholder="you@example.com" autocomplete="email">
        </div>
        <div id="smtp-test-result" class="smtp-test-result" hidden></div>
      </div>
      <div class="smtp-modal-footer">
        <button class="btn-secondary" onclick="closeSmtpTestModal()">Cancel</button>
        <button class="btn-primary" id="smtp-test-send-btn" onclick="sendSmtpTest()">✉ Send Test</button>
      </div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSmtpTestModal(); });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('smtp-modal-visible'));
  document.getElementById('smtp-test-to').focus();
}

function closeSmtpTestModal() {
  const overlay = document.getElementById('smtp-test-overlay');
  if (!overlay) return;
  overlay.classList.remove('smtp-modal-visible');
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

async function sendSmtpTest() {
  const toEl   = document.getElementById('smtp-test-to');
  const result = document.getElementById('smtp-test-result');
  const btn    = document.getElementById('smtp-test-send-btn');
  const to     = toEl?.value.trim();

  if (!to) { toEl.focus(); return; }

  btn.disabled    = true;
  btn.textContent = 'Sending…';
  result.hidden   = true;
  result.className = 'smtp-test-result';

  try {
    const res  = await fetch(ROOT + 'api/smtp-test.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ to }),
    });
    const data = await res.json();
    result.hidden = false;
    if (data.ok) {
      result.classList.add('smtp-test-ok');
      result.textContent = '✓ ' + (data.message || 'Email sent successfully.');
    } else {
      result.classList.add('smtp-test-err');
      result.textContent = '✕ ' + (data.error || 'Unknown error.');
    }
  } catch (e) {
    result.hidden = false;
    result.classList.add('smtp-test-err');
    result.textContent = '✕ Request failed: ' + e.message;
  } finally {
    btn.disabled    = false;
    btn.textContent = '✉ Send Test';
  }
}

/* ─── News settings helpers ──────────────────────────────────────────────────── */
let _newsSources = [];

function buildNewsSourcesHTML(sources) {
  if (!sources.length) return '<div class="news-empty-sources">No sources yet. Add one below.</div>';
  return sources.map((s, i) => `
    <div class="news-source-row" data-index="${i}" data-id="${esc(s.id || '')}" data-name="${esc(s.name)}" data-url="${esc(s.url)}">
      <label class="toggle-switch" title="${s.enabled ? 'Enabled' : 'Disabled'}">
        <input type="checkbox" class="news-source-toggle" data-index="${i}" ${s.enabled ? 'checked' : ''}>
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
      </label>
      <span class="news-source-name">${esc(s.name)}</span>
      <span class="news-source-url mono">${esc(s.url)}</span>
      <button class="news-source-delete" onclick="deleteNewsSource(${i})" title="Remove">✕</button>
    </div>`).join('');
}

function _loadNewsSources() {
  _newsSources = [];
  document.querySelectorAll('.news-source-row').forEach((row, i) => {
    const toggle = row.querySelector('.news-source-toggle');
    _newsSources.push({
      id:      row.dataset.id || ('src_' + i),
      name:    row.dataset.name || '',
      url:     row.dataset.url  || '',
      enabled: toggle?.checked ?? true,
    });
  });
}

function toggleNewsSource(index, checked) {
  // live update in DOM tracked via checkbox; will be collected on save
}

function deleteNewsSource(index) {
  _loadNewsSources();
  _newsSources.splice(index, 1);
  document.getElementById('news-sources-list').innerHTML = buildNewsSourcesHTML(_newsSources);
}

function addNewsSource() {
  const nameEl = document.getElementById('news-add-name');
  const urlEl  = document.getElementById('news-add-url');
  const name   = nameEl.value.trim();
  const url    = urlEl.value.trim();
  if (!name || !url) { toast('Name and URL required', 'err'); return; }
  _loadNewsSources();
  _newsSources.push({ id: 'custom_' + Date.now(), name, url, enabled: true });
  document.getElementById('news-sources-list').innerHTML = buildNewsSourcesHTML(_newsSources);
  nameEl.value = '';
  urlEl.value  = '';
}

async function changePassword() {
  const current = document.getElementById('set-pw-current')?.value ?? '';
  const newPw   = document.getElementById('set-pw-new')?.value ?? '';
  const confirm = document.getElementById('set-pw-confirm')?.value ?? '';

  if (!current || !newPw || !confirm) { toast('All fields are required', 'err'); return; }
  if (newPw !== confirm)               { toast('New passwords do not match', 'err'); return; }

  const res  = await fetch(ROOT + 'api/auth.php', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ current, new: newPw, confirm }),
  });
  const data = await res.json();
  if (res.ok) {
    toast('Password changed');
    document.getElementById('set-pw-current').value = '';
    document.getElementById('set-pw-new').value     = '';
    document.getElementById('set-pw-confirm').value = '';
  } else {
    toast(data.error || 'Failed to change password', 'err');
  }
}

/* ─── App reset ─────────────────────────────────────────────────────────────── */
function showResetModal() {
  const existing = document.getElementById('reset-modal-overlay');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'reset-modal-overlay';
  el.className = 'modal-overlay';
  el.style.cssText = 'display:flex;z-index:9999';
  el.innerHTML = `
    <div class="modal" style="max-width:420px">
      <div class="modal-header">
        <div class="modal-title" style="color:var(--red)">Reset App</div>
        <button class="modal-close" onclick="closeResetModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;line-height:1.6">
          This will permanently delete all settings, services, machines, notes, and credentials.
          The app will restart the setup wizard. There is no undo.
        </p>
        <label style="display:block;font-size:11px;font-weight:600;color:var(--text-muted);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px">Confirm with your password</label>
        <input type="password" id="reset-pw-input" class="form-input" style="width:100%" placeholder="Current password" autocomplete="current-password">
        <p id="reset-err" style="display:none;margin-top:8px;font-size:12px;color:var(--red)"></p>
      </div>
      <div class="modal-footer">
        <div></div>
        <div class="modal-footer-right" style="gap:8px;display:flex">
          <button class="btn-secondary" onclick="closeResetModal()">Cancel</button>
          <button class="btn-danger" id="reset-confirm-btn" onclick="confirmReset()">Reset App</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener('click', e => { if (e.target === el) closeResetModal(); });
  setTimeout(() => document.getElementById('reset-pw-input')?.focus(), 50);
}

function closeResetModal() {
  document.getElementById('reset-modal-overlay')?.remove();
}

async function confirmReset() {
  const pw  = document.getElementById('reset-pw-input')?.value ?? '';
  const err = document.getElementById('reset-err');
  const btn = document.getElementById('reset-confirm-btn');
  if (!pw) { err.textContent = 'Password is required.'; err.style.display = 'block'; return; }

  btn.disabled = true;
  btn.textContent = 'Resetting…';
  err.style.display = 'none';

  try {
    const res  = await fetch(ROOT + 'api/reset.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      window.location.href = ROOT + 'setup.php';
    } else {
      err.textContent = data.error || 'Reset failed. Please try again.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Reset App';
    }
  } catch (e) {
    err.textContent = 'Network error. Please try again.';
    err.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Reset App';
  }
}

/* ─── Network integration settings ─────────────────────────────────────────── */
function onNetIntegrationChange(val) {
  const cfgGroup  = document.getElementById('net-cfg-group');
  const unifiRows = document.querySelectorAll('.net-unifi-only');
  const userLabel = document.getElementById('net-user-label');
  const passLabel = document.getElementById('net-pass-label');
  const userInput = document.getElementById('set-net-user');
  const passInput = document.getElementById('set-net-pass');

  cfgGroup && (cfgGroup.hidden = !val);
  unifiRows.forEach(r => r.hidden = val !== 'unifi');

  if (val === 'opnsense') {
    if (userLabel) userLabel.textContent = 'API Key';
    if (passLabel) passLabel.textContent = 'API Secret';
    if (userInput) userInput.placeholder = 'API key';
    if (passInput) passInput.placeholder = 'API secret';
    document.querySelectorAll('.net-credentials-row').forEach(r => r.hidden = false);
  } else {
    if (userLabel) userLabel.textContent = 'Username';
    if (passLabel) passLabel.textContent = 'Password';
    if (userInput) userInput.placeholder = 'admin';
    if (passInput) passInput.placeholder = 'Password';
    // Re-apply auth mode visibility
    const authMode = document.getElementById('set-net-auth-mode')?.value || 'credentials';
    onNetAuthModeChange(authMode);
  }
}

function onNetAuthModeChange(mode) {
  const passLabel    = document.getElementById('net-pass-label');
  const passInput    = document.getElementById('set-net-pass');
  const credRows     = document.querySelectorAll('.net-credentials-row');

  const isApiKey = mode === 'apikey';
  credRows.forEach(r => r.hidden = isApiKey);
  if (passLabel) passLabel.textContent = isApiKey ? 'API Key'         : 'Password';
  if (passInput) passInput.placeholder = isApiKey ? 'Paste API key here' : 'Password';
}

async function saveNetIntegrationSettings() {
  const g = id => document.getElementById(id)?.value ?? '';
  const c = id => document.getElementById(id)?.checked ?? false;
  const payload = {
    net_integration: g('set-net-integration'),
    net_host:        g('set-net-host').trim().replace(/\/$/, ''),
    net_site:        g('set-net-site') || 'default',
    net_user:        g('set-net-user'),
    net_pass:        g('set-net-pass'),
    net_verify_ssl:  c('set-net-verify-ssl') ? '1' : '0',
    net_unifi_os:    c('set-net-unifi-os')   ? '1' : '0',
    net_auth_mode:   g('set-net-auth-mode') || 'credentials',
  };
  const res = await fetch(ROOT + 'api/settings.php', {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  res.ok ? toast('Network integration saved') : toast('Save failed', 'err');
}

async function saveNewsSettings() {
  _loadNewsSources();
  const payload = {
    news_enabled: document.getElementById('set-news-enabled')?.checked ? '1' : '0',
    news_sources: JSON.stringify(_newsSources),
  };
  const res = await fetch(ROOT + 'api/settings.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  res.ok ? toast('News settings saved') : toast('Save failed', 'err');
}

async function resetTheme() {
  if (!confirm('Reset all colors to defaults?')) return;
  await fetch(ROOT + 'api/settings.php?scope=theme', { method: 'DELETE' });
  // Remove all inline :root overrides
  const root = document.documentElement;
  THEME_GROUPS.flatMap(g => g.vars).forEach(v => root.style.removeProperty(v.key));
  toast('Theme reset to defaults');
  renderSettings();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — MACHINES
═══════════════════════════════════════════════════════════════════════════════ */
function machineFields(data = {}) {
  const isEdit = data.id != null;
  return [
    { key: 'icon',   label: 'Icon',       type: 'icon',   value: data.icon   || 'docker.png' },
    { key: 'name',   label: 'Name',       type: 'text',   required: true, value: data.name   || '', placeholder: 'e.g. Atlas' },
    { key: 'ip',     label: 'IP Address', type: 'text',   value: data.ip     || '', placeholder: '192.168.1.x' },
    { key: 'ssh_user', label: 'SSH User', type: 'text', required: !isEdit, value: data.ssh_user || '', placeholder: 'e.g. jaxraven' },
    { key: 'ssh_password', label: 'SSH Password', type: 'password', required: !isEdit, value: '', placeholder: isEdit ? 'Leave blank to keep current password' : 'Required for SSH polling' },
    { key: 'ssh_port', label: 'SSH Port', type: 'number', value: data.ssh_port ?? 22, placeholder: '22' },
    { key: 'vlan',   label: 'VLAN',       type: 'number', value: data.vlan   ?? 1 },
    { key: 'role',   label: 'Role',       type: 'text',   value: data.role   || '', placeholder: 'e.g. Web Server' },
    { key: 'os',     label: 'OS',         type: 'text',   value: data.os     || '', placeholder: 'Ubuntu, Debian…' },
    { key: 'notes',  label: 'Notes',      type: 'textarea', value: data.notes || '' },
  ];
}

function machinePhpPayload(vals) {
  return {
    icon: vals.icon || 'docker.png',
    name: vals.name?.trim() || '',
    ip: vals.ip?.trim() || '',
    vlan: Number(vals.vlan ?? 1),
    role: vals.role?.trim() || '',
    os: vals.os?.trim() || '',
    notes: vals.notes || '',
  };
}

function machineBackendPayload(vals) {
  return {
    name:     vals.name?.trim() || '',
    ip:       vals.ip?.trim() || '',
    user:     vals.ssh_user?.trim() || '',
    password: vals.ssh_password || '',
    os:       vals.os?.trim() || '',
    port:     Number(vals.ssh_port ?? 22) || 22,
  };
}

function addMachine() {
  openModal({ title: '+ Add Machine', icon: 'docker.png', fields: machineFields(),
    onSave: async (vals) => {
      const backendPayload = machineBackendPayload(vals);
      const phpPayload = machinePhpPayload(vals);
      let backendMachine = null;
      let backendRegistered = false;
      try {
        try {
          backendMachine = await backendFetch('/machines', 'POST', backendPayload);
          backendRegistered = true;
        } catch (error) {
          if (!/already exists/i.test(error.message)) throw error;
          await backendFetch(`/machines/${encodeURIComponent(backendPayload.name)}`, 'DELETE');
          backendMachine = await backendFetch('/machines', 'POST', backendPayload);
          backendRegistered = true;
        }
        const res = await apiFetch('api/machines.php', 'POST', phpPayload);
        DATA.manual_machines.push(res);
        await refreshBackendIntegration();
        toast('Machine added');
        rerender();
      } catch (error) {
        if (backendRegistered && backendMachine) {
          try { await backendFetch(`/machines/${encodeURIComponent(backendMachine.name)}`, 'DELETE'); } catch { /* ignore rollback */ }
        }
        throw error;
      }
    },
  });
}

function editHomeMachine(id, e) {
  e?.stopPropagation();
  const m = DATA.machines.find(x => x.id === id);
  if (!m) return;
  openModal({ title: `Edit — ${m.name}`, icon: m.icon, fields: machineFields(m),
    onSave: async (vals) => {
      await saveMachineEdits(m, vals);
    },
  });
}

function editHomeMachineDisplay(id, e) {
  e?.stopPropagation();
  const m = DATA.machines.find(x => x.id === id);
  if (!m) return;
  const prefs = getHmcDisplayPrefs(id);
  const hasSnapshot = !!m.snapshot;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:320px">
      <div class="modal-header">
        <span class="modal-title">Card Display — ${m.name}</span>
      </div>
      <div class="modal-body" style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">
        ${[
          ['role',     'Role'],
          ['badges',   'IP / VLAN / OS badges'],
          ['notes',    'Notes'],
          ['services', 'Services list'],
          ['stats',    `Live stats${hasSnapshot ? '' : ' (no data available)'}`],
        ].map(([key, label]) => `
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:14px;color:var(--text)${key==='stats'&&!hasSnapshot?';opacity:0.45':''}">
            <input type="checkbox" id="hmcd-${key}"
              ${prefs[key] ? 'checked' : ''}
              ${key === 'stats' && !hasSnapshot ? 'disabled' : ''}
              style="accent-color:var(--green);width:15px;height:15px;cursor:pointer">
            ${label}
          </label>`).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="hmcd-cancel">Cancel</button>
        <div class="modal-footer-right">
          <button class="btn-primary" id="hmcd-apply">Apply</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#hmcd-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
  overlay.querySelector('#hmcd-apply').onclick = async () => {
    const newPrefs = {};
    ['role', 'badges', 'notes', 'services', 'stats'].forEach(key => {
      newPrefs[key] = overlay.querySelector(`#hmcd-${key}`).checked;
    });
    saveHmcDisplayPrefs(id, newPrefs);
    overlay.remove();

    await refreshMachinesGrid();
  };
}

function editMachine(id, e) {
  e?.stopPropagation();
  const m = DATA.machines.find(x => x.id === id);
  if (!m) return;
  openModal({ title: `Edit — ${m.name}`, icon: m.icon, fields: machineFields(m),
    onSave: async (vals) => {
      await saveMachineEdits(m, vals);
    },
    onDelete: () => deleteMachine(id),
  });
}

async function saveMachineEdits(machine, vals) {
  const phpPayload = machinePhpPayload(vals);
  const backendPayload = machineBackendPayload(vals);
  const existingBackend = (DATA.backend_machines_raw || []).find(item => backendMachineKey(item.name) === backendMachineKey(machine.name));
  const nameChanged = backendMachineKey(machine.name) !== backendMachineKey(backendPayload.name);
  const ipChanged = (machine.ip || '').trim() !== backendPayload.ip;
  const userChanged = (machine.ssh_user || '').trim() !== backendPayload.user;
  const passwordChanged = Boolean(backendPayload.password);
  const wantsBackendSync = Boolean(existingBackend) || Boolean(backendPayload.user) || Boolean(backendPayload.password);

  if (wantsBackendSync && !backendPayload.user) {
    throw new Error('SSH user is required for backend machine sync');
  }
  if (wantsBackendSync && (nameChanged || ipChanged || userChanged || passwordChanged || !existingBackend) && !backendPayload.password) {
    throw new Error('Re-enter the SSH password to update backend connection details');
  }

  if (existingBackend && (nameChanged || ipChanged || userChanged || passwordChanged)) {
    await backendFetch(`/machines/${encodeURIComponent(machine.name)}`, 'DELETE');
    await backendFetch('/machines', 'POST', backendPayload);
  } else if (!existingBackend && backendPayload.user && backendPayload.password) {
    await backendFetch('/machines', 'POST', backendPayload);
  }

  const res = await apiFetch(`api/machines.php?id=${machine.id}`, 'PUT', phpPayload);
  const manualMachine = DATA.manual_machines.find(item => item.id === machine.id);
  if (manualMachine) Object.assign(manualMachine, res);
  await refreshBackendIntegration();
  toast('Machine saved');
  rerender();
}

function deleteMachine(id, e) {
  e?.stopPropagation();
  const machine = DATA?.machines?.find(m => m.id === id);
  const name    = machine?.name || 'this machine';
  showConfirmModal({
    title:   'Delete Machine',
    message: `Are you sure you want to delete <strong>${htmlEsc(name)}</strong>? This cannot be undone.`,
    danger:  true,
    label:   'Delete',
    onConfirm: () => _deleteMachineConfirmed(id),
  });
}

async function _deleteMachineConfirmed(id) {
  const machine = DATA?.machines?.find(item => item.id === id);
  if (machine) {
    try {
      await backendFetch(`/machines/${encodeURIComponent(machine.name)}`, 'DELETE');
    } catch (error) {
      if (!/not found/i.test(error.message)) throw error;
    }
  }
  await apiFetch(`api/machines.php?id=${id}`, 'DELETE');
  DATA.manual_machines = DATA.manual_machines.filter(x => x.id !== id);
  if (machine) {
    await saveIgnoredAutoServiceKeys(
      IGNORED_AUTO_SERVICE_KEYS.filter(key => !key.startsWith(`${backendMachineKey(machine.name)}::`))
    );
  }
  await refreshBackendIntegration();
  toast('Machine deleted', 'warn'); rerender();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — SERVICES
═══════════════════════════════════════════════════════════════════════════════ */
function serviceFields(data = {}) {
  const machineOpts = DATA.machines.map(m => m.name);
  const typeOpts    = ['AI','Automation','Storage','Monitoring','DNS','Search','Web','Other'];
  const deployOpts  = ['Docker','Docker Compose','Native','Native systemd'];
  return [
    { key: 'icon',       label: 'Icon',       type: 'icon',   value: data.icon       || 'docker.png' },
    { key: 'name',       label: 'Name',       type: 'text',   required: true, value: data.name       || '', placeholder: 'e.g. My Service' },
    { key: 'machine',    label: 'Machine',    type: 'select', options: machineOpts,   value: data.machine    || '' },
    { key: 'url',        label: 'URL',        type: 'url',    value: data.url        || '', placeholder: 'http://192.168.1.x:port' },
    { key: 'port',       label: 'Port',       type: 'number', value: data.port       ?? 80 },
    { key: 'ip',         label: 'IP Address', type: 'text',   value: data.ip         || '', placeholder: '192.168.1.x' },
    { key: 'type',       label: 'Type',       type: 'select', options: typeOpts,      value: data.type       || 'Other' },
    { key: 'deployment', label: 'Deployment', type: 'select', options: deployOpts,   value: data.deployment || 'Docker' },
    { key: 'login_hint', label: 'Login Hint', type: 'text',   value: data.login_hint || '', placeholder: 'e.g. local admin' },
    { key: 'tags',       label: 'Tags',       type: 'tags',   value: data.tags       || [] },
    { key: 'notes',      label: 'Notes',      type: 'textarea', value: data.notes    || '' },
  ];
}

function servicePayload(vals, extra = {}) {
  return {
    icon: vals.icon || 'docker.png',
    name: vals.name || '',
    machine: vals.machine || '',
    backend_key: extra.backend_key || vals.backend_key || '',
    source: extra.source || vals.source || 'manual',
    url: vals.url || '',
    port: Number(vals.port ?? 80),
    ip: vals.ip || '',
    type: vals.type || 'Other',
    deployment: vals.deployment || '',
    login_hint: vals.login_hint || '',
    tags: Array.isArray(vals.tags) ? vals.tags : [],
    notes: vals.notes || '',
  };
}

function addService() {
  openModal({ title: '+ Add Service', icon: 'docker.png', fields: serviceFields(),
    onSave: async (vals) => {
      const res = await apiFetch('api/services.php', 'POST', servicePayload(vals, { source: 'manual' }));
      DATA.manual_services.push(res);
      applyBackendData(DATA.backend_machines_raw, DATA.backend_services_raw);
      toast('Service added'); rerender();
    },
  });
}

function editService(id, e) {
  e?.stopPropagation();
  const s = DATA.services.find(x => x.id === id);
  if (!s) return;
  openModal({ title: `Edit — ${s.name}`, icon: s.icon, fields: serviceFields(s),
    onSave: async (vals) => {
      let res;
      if (s.backend_discovered) {
        const payload = servicePayload(vals, { backend_key: s.backend_key, source: 'override' });
        res = await apiFetch('api/services.php', 'POST', payload);
        DATA.manual_services.push(res);
        await saveIgnoredAutoServiceKeys(IGNORED_AUTO_SERVICE_KEYS.filter(key => key !== s.backend_key));
      } else {
        res = await apiFetch(`api/services.php?id=${id}`, 'PUT', servicePayload(vals, { backend_key: s.backend_key, source: s.source || 'manual' }));
        Object.assign(s, res);
        const manualService = DATA.manual_services.find(item => item.id === id);
        if (manualService) Object.assign(manualService, res);
      }
      applyBackendData(DATA.backend_machines_raw, DATA.backend_services_raw);
      toast('Service saved'); rerender();
    },
    onDelete: () => deleteService(id),
  });
}

function deleteService(id, e) {
  e?.stopPropagation();
  const service = DATA.services.find(x => x.id === id);
  const name    = service?.name || 'this service';
  showConfirmModal({
    title:     'Delete Service',
    message:   `Are you sure you want to delete <strong>${htmlEsc(name)}</strong>? This cannot be undone.`,
    danger:    true,
    label:     'Delete',
    onConfirm: () => _deleteServiceConfirmed(id),
  });
}

async function _deleteServiceConfirmed(id) {
  const service = DATA.services.find(x => x.id === id);
  if (!service) return;
  if (!service.backend_discovered) {
    await apiFetch(`api/services.php?id=${id}`, 'DELETE');
    DATA.manual_services = DATA.manual_services.filter(x => x.id !== id);
  }
  if (service.backend_key) {
    await saveIgnoredAutoServiceKeys([...IGNORED_AUTO_SERVICE_KEYS, service.backend_key]);
  }
  applyBackendData(DATA.backend_machines_raw, DATA.backend_services_raw);
  toast('Service deleted', 'warn'); rerender();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — MODELS
═══════════════════════════════════════════════════════════════════════════════ */
function modelFields(data = {}) {
  const machineOpts = DATA.machines.map(m => m.name);
  return [
    { key: 'icon',     label: 'Icon',      type: 'icon',   value: data.icon     || 'ollama.png' },
    { key: 'name',     label: 'Model ID',  type: 'text',   required: true, value: data.name     || '', placeholder: 'e.g. llama3.1:8b' },
    { key: 'machine',  label: 'Machine',   type: 'select', options: machineOpts, value: data.machine || '' },
    { key: 'vram_gb',  label: 'VRAM (GB)', type: 'number', value: data.vram_gb  ?? 0 },
    { key: 'best_for', label: 'Best For',  type: 'text',   value: data.best_for || '', placeholder: 'e.g. Code generation' },
  ];
}

function addModel() {
  openModal({ title: '+ Add Model', icon: 'ollama.png', fields: modelFields(),
    onSave: async (vals) => {
      vals.vram_gb = parseFloat(vals.vram_gb) || 0;
      const res = await apiFetch('api/models.php', 'POST', vals);
      DATA.models.push(res); toast('Model added'); rerender();
    },
  });
}

function editModel(id) {
  const m = DATA.models.find(x => x.id === id);
  if (!m) return;
  openModal({ title: `Edit — ${m.name}`, icon: m.icon, fields: modelFields(m),
    onSave: async (vals) => {
      vals.vram_gb = parseFloat(vals.vram_gb) || 0;
      const res = await apiFetch(`api/models.php?id=${id}`, 'PUT', vals);
      Object.assign(m, res); toast('Model saved'); rerender();
    },
    onDelete: () => deleteModel(id),
  });
}

async function deleteModel(id) {
  if (!confirm('Delete this model?')) return;
  await apiFetch(`api/models.php?id=${id}`, 'DELETE');
  DATA.models = DATA.models.filter(x => x.id !== id);
  toast('Model deleted', 'warn'); rerender();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — WORKFLOWS
═══════════════════════════════════════════════════════════════════════════════ */
function workflowFields(data = {}) {
  const machineOpts = DATA.machines.map(m => m.name);
  return [
    { key: 'icon',    label: 'Icon',    type: 'icon',     value: data.icon    || 'n8n.png' },
    { key: 'name',    label: 'Name',    type: 'text',     required: true, value: data.name    || '', placeholder: 'e.g. Backup Job' },
    { key: 'machine', label: 'Machine', type: 'select',   options: machineOpts, value: data.machine || '' },
    { key: 'status',  label: 'Status',  type: 'select',   options: ['active','paused','stopped'], value: data.status || 'active' },
    { key: 'notes',   label: 'Notes',   type: 'textarea', value: data.notes   || '' },
  ];
}

function addWorkflow() {
  openModal({ title: '+ Add Workflow', icon: 'n8n.png', fields: workflowFields(),
    onSave: async (vals) => {
      const res = await apiFetch('api/workflows.php', 'POST', vals);
      DATA.workflows.push(res); toast('Workflow added'); rerender();
    },
  });
}

function editWorkflow(id, e) {
  e?.stopPropagation();
  const w = DATA.workflows.find(x => x.id === id);
  if (!w) return;
  openModal({ title: `Edit — ${w.name}`, icon: w.icon, fields: workflowFields(w),
    onSave: async (vals) => {
      const res = await apiFetch(`api/workflows.php?id=${id}`, 'PUT', vals);
      Object.assign(w, res); toast('Workflow saved'); rerender();
    },
    onDelete: () => deleteWorkflow(id),
  });
}

async function deleteWorkflow(id, e) {
  e?.stopPropagation();
  if (!confirm('Delete this workflow?')) return;
  await apiFetch(`api/workflows.php?id=${id}`, 'DELETE');
  DATA.workflows = DATA.workflows.filter(x => x.id !== id);
  toast('Workflow deleted', 'warn'); rerender();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — NOTES
═══════════════════════════════════════════════════════════════════════════════ */
function addNote() {
  openModal({ title: '+ Add Note', icon: '⚑',
    fields: [{ key: 'note', label: 'Note', type: 'textarea', required: true, value: '', placeholder: 'Pin a note…' }],
    onSave: async (vals) => {
      const res = await apiFetch('api/notes.php', 'POST', vals);
      DATA.pinned_notes.push(res); toast('Note added'); rerender();
    },
  });
}

function editNote(id, text) {
  openModal({ title: 'Edit Note', icon: '⚑',
    fields: [{ key: 'note', label: 'Note', type: 'textarea', required: true, value: text }],
    onSave: async (vals) => {
      await apiFetch(`api/notes.php?id=${id}`, 'PUT', vals);
      const n = DATA.pinned_notes.find(x => x.id === id);
      if (n) n.note = vals.note;
      toast('Note saved'); rerender();
    },
    onDelete: () => deleteNote(id),
  });
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  await apiFetch(`api/notes.php?id=${id}`, 'DELETE');
  DATA.pinned_notes = DATA.pinned_notes.filter(x => x.id !== id);
  toast('Note deleted', 'warn'); rerender();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CRUD — NETWORK
═══════════════════════════════════════════════════════════════════════════════ */
function editNetworkConfig() {
  const { network } = DATA;
  openModal({ title: 'Edit Network Config', icon: '⬢',
    fields: [
      { key: 'gateway', label: 'Gateway IP',  type: 'text', value: network.gateway, placeholder: '192.168.1.1' },
      { key: 'device',  label: 'Device Name', type: 'text', value: network.device,  placeholder: 'UniFi Dream Machine…' },
    ],
    onSave: async (vals) => {
      await apiFetch('api/network.php?resource=config', 'PUT', vals);
      Object.assign(DATA.network, vals); toast('Network config saved'); rerender();
    },
  });
}

function addVlan() {
  openModal({ title: '+ Add VLAN', icon: '⬢',
    fields: [
      { key: 'vlan_id', label: 'VLAN ID', type: 'number', value: '' },
      { key: 'name',    label: 'Name',    type: 'text',   value: '', placeholder: 'e.g. IoT' },
      { key: 'subnet',  label: 'Subnet',  type: 'text',   value: '', placeholder: '192.168.x.0/24' },
    ],
    onSave: async (vals) => {
      const res = await apiFetch('api/network.php?resource=vlans', 'POST', vals);
      DATA.network.vlans.push({ id: res.vlan_id, name: res.name, subnet: res.subnet });
      toast('VLAN added');
      document.querySelector('#vlans-table tbody').innerHTML = renderVlanRows(DATA.network.vlans);
    },
  });
}

function editVlan(id) {
  const v = DATA.network.vlans.find(x => x.id === id);
  if (!v) return;
  openModal({ title: 'Edit VLAN', icon: '⬢',
    fields: [
      { key: 'vlan_id', label: 'VLAN ID', type: 'number', value: v.id },
      { key: 'name',    label: 'Name',    type: 'text',   value: v.name },
      { key: 'subnet',  label: 'Subnet',  type: 'text',   value: v.subnet },
    ],
    onSave: async (vals) => {
      await apiFetch(`api/network.php?resource=vlans&id=${id}`, 'PUT', vals);
      Object.assign(v, { id: parseInt(vals.vlan_id), name: vals.name, subnet: vals.subnet });
      toast('VLAN saved');
      document.querySelector('#vlans-table tbody').innerHTML = renderVlanRows(DATA.network.vlans);
    },
    onDelete: () => deleteVlan(id),
  });
}

async function deleteVlan(id) {
  if (!confirm('Delete this VLAN?')) return;
  await apiFetch(`api/network.php?resource=vlans&id=${id}`, 'DELETE');
  DATA.network.vlans = DATA.network.vlans.filter(x => x.id !== id);
  toast('VLAN deleted', 'warn');
  document.querySelector('#vlans-table tbody').innerHTML = renderVlanRows(DATA.network.vlans);
  closeModal();
}

function addUnifi() {
  openModal({ title: '+ Add UniFi Device', icon: 'ubiquiti-unifi.png',
    fields: [
      { key: 'name', label: 'Name', type: 'text', value: '', placeholder: 'e.g. USW-24' },
      { key: 'ip',   label: 'IP',   type: 'text', value: '', placeholder: '192.168.1.x' },
      { key: 'role', label: 'Role', type: 'text', value: '', placeholder: 'Switch, AP…' },
    ],
    onSave: async (vals) => {
      const res = await apiFetch('api/network.php?resource=unifi', 'POST', vals);
      DATA.network.unifi_devices.push(res); toast('Device added');
      document.querySelector('#unifi-table tbody').innerHTML = renderUnifiRows(DATA.network.unifi_devices);
    },
  });
}

function editUnifi(id) {
  const d = DATA.network.unifi_devices.find(x => x.id === id);
  if (!d) return;
  openModal({ title: 'Edit UniFi Device', icon: 'ubiquiti-unifi.png',
    fields: [
      { key: 'name', label: 'Name', type: 'text', value: d.name },
      { key: 'ip',   label: 'IP',   type: 'text', value: d.ip   },
      { key: 'role', label: 'Role', type: 'text', value: d.role },
    ],
    onSave: async (vals) => {
      await apiFetch(`api/network.php?resource=unifi&id=${id}`, 'PUT', vals);
      Object.assign(d, vals); toast('Device saved');
      document.querySelector('#unifi-table tbody').innerHTML = renderUnifiRows(DATA.network.unifi_devices);
    },
    onDelete: () => deleteUnifi(id),
  });
}

async function deleteUnifi(id) {
  if (!confirm('Delete this device?')) return;
  await apiFetch(`api/network.php?resource=unifi&id=${id}`, 'DELETE');
  DATA.network.unifi_devices = DATA.network.unifi_devices.filter(x => x.id !== id);
  toast('Device deleted', 'warn');
  document.querySelector('#unifi-table tbody').innerHTML = renderUnifiRows(DATA.network.unifi_devices);
  closeModal();
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MODAL SYSTEM
═══════════════════════════════════════════════════════════════════════════════ */
function openModal({ title, icon, fields, onSave, onDelete }) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

  // Determine title icon display
  const titleIconHtml = icon && /\.(png|svg|jpg|webp)$/i.test(icon)
    ? `<img src="${ICONS_PATH}${icon}" style="width:18px;height:18px;object-fit:contain" alt="">`
    : `<span>${icon || ''}</span>`;

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <span class="modal-title">${titleIconHtml}${title}</span>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
      </div>
      <div class="modal-body" id="modal-body">${buildFormHTML(fields)}</div>
      <div class="modal-footer">
        <div>${onDelete ? `<button class="btn-danger" onclick="handleModalDelete()">Delete</button>` : ''}</div>
        <div class="modal-footer-right">
          <button class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button class="btn-primary" id="modal-save-btn" onclick="handleModalSave()">Save</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay._onSave   = onSave;
  overlay._onDelete = onDelete;
  overlay._fields   = fields;

  overlay.querySelectorAll('.form-tags-input input').forEach(wireTagInput);


  overlay._escHandler = (e) => { if (e.key === 'Escape') closeModal(); };
  document.addEventListener('keydown', overlay._escHandler);
  setTimeout(() => overlay.querySelector('.form-input, .form-textarea, .form-select')?.focus(), 50);
}

/** Update the icon preview box — handles both PNG filenames and emoji */
function updateIconDisplay(el, value) {
  if (value && /\.(png|svg|jpg|webp)$/i.test(value)) {
    el.innerHTML = `<img src="${ICONS_PATH}${value}" style="width:32px;height:32px;object-fit:contain"
                         onerror="this.parentNode.textContent='?'">`;
  } else {
    el.textContent = value || '⚙️';
  }
}

function buildFormHTML(fields) {
  return fields.map(f => {
    if (f.type === 'icon') return buildIconPickerHTML(f);

    const base = `id="field-${f.key}" name="${f.key}"`;
    const val  = htmlEsc(String(f.value ?? ''));
    const req  = f.required ? '<span class="required">*</span>' : '';
    let input;

    if (f.type === 'textarea') {
      input = `<textarea class="form-textarea" ${base} placeholder="${f.placeholder || ''}">${val}</textarea>`;
    } else if (f.type === 'select') {
      const opts = (f.options || []).map(o =>
        `<option value="${htmlEsc(o)}"${o === f.value ? ' selected' : ''}>${htmlEsc(o)}</option>`
      ).join('');
      input = `<select class="form-select" ${base}><option value=""></option>${opts}</select>`;
    } else if (f.type === 'tags') {
      const chips = (f.value || []).map(t => tagChipHTML(t)).join('');
      input = `
        <div class="form-tags-input" data-field="${f.key}" onclick="this.querySelector('input').focus()">
          ${chips}
          <input type="text" placeholder="Add tag, press Enter…" data-tags-for="${f.key}">
        </div>
        <input type="hidden" id="field-${f.key}" name="${f.key}" value="${htmlEsc(JSON.stringify(f.value || []))}">`;
    } else {
      input = `<input class="form-input" type="${f.type}" ${base} value="${val}" placeholder="${f.placeholder || ''}">`;
    }
    return `<div class="form-group"><label class="form-label" for="field-${f.key}">${f.label}${req}</label>${input}</div>`;
  }).join('');
}

function buildIconPickerHTML(f) {
  const current = f.value || 'docker.png';
  const isPng   = /\.(png|svg|jpg|webp)$/i.test(current);
  const preview = isPng
    ? `<img src="${ICONS_PATH}${current}" style="width:32px;height:32px;object-fit:contain" onerror="this.style.display='none'">`
    : `<span style="font-size:24px">${current || '?'}</span>`;
  const label = current ? current.replace(/\.[^.]+$/, '') : 'none';

  return `
    <div class="form-group icon-picker-group">
      <span class="form-label">Icon</span>
      <div class="icon-preview-row">
        <div class="icon-current" data-icon-key="${f.key}">${preview}</div>
        <div class="icon-current-label" id="icon-label-${f.key}">${htmlEsc(label)}</div>
        <button type="button" class="btn-choose-icon" onclick="openIconPicker('${f.key}')">Choose Icon</button>
      </div>
      <input type="hidden" id="field-${f.key}" name="${f.key}" value="${current}">
    </div>`;
}

/* ─── Icon Picker Sub-modal ──────────────────────────────────────────────────── */
let _allIcons     = null;  // cached icon list from API
let _iconPickerKey = null; // which field we're picking for

async function openIconPicker(key) {
  _iconPickerKey = key;

  // Fetch icon list once, cache it
  if (!_allIcons) {
    try {
      const res = await fetch(ROOT + 'api/icons.php');
      _allIcons = await res.json();
    } catch {
      _allIcons = AVAILABLE_ICONS;
    }
  }

  // Build sub-modal
  const picker = document.createElement('div');
  picker.id        = 'icon-picker-overlay';
  picker.className = 'icon-picker-overlay';
  picker.innerHTML = `
    <div class="icon-picker-modal">
      <div class="icon-picker-header">
        <span class="icon-picker-title">Choose Icon</span>
        <button type="button" class="icon-picker-close" onclick="closeIconPicker()">✕</button>
      </div>
      <div class="icon-picker-search-row">
        <input type="text" id="icon-picker-search" class="form-input"
               placeholder="Search ${_allIcons.length} icons…"
               oninput="filterIconGrid(this.value)" autocomplete="off">
      </div>
      <div class="icon-picker-grid" id="icon-picker-grid"></div>
    </div>`;
  document.body.appendChild(picker);

  // Focus search
  requestAnimationFrame(() => document.getElementById('icon-picker-search')?.focus());

  // Render initial grid
  filterIconGrid('');
}

function filterIconGrid(query) {
  const grid = document.getElementById('icon-picker-grid');
  if (!grid || !_allIcons) return;

  const q = query.trim().toLowerCase();
  const matches = q
    ? _allIcons.filter(f => f.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').includes(q))
    : _allIcons;

  if (matches.length === 0) {
    grid.innerHTML = '<div class="icon-picker-empty">No icons match your search.</div>';
    return;
  }

  grid.innerHTML = matches.map(name => {
    const label = name.replace(/\.[^.]+$/, '');
    return `
      <button type="button" class="icon-picker-btn" title="${htmlEsc(label)}"
              onclick="selectIcon('${htmlEsc(name)}')">
        <img src="${ICONS_PATH}${name}" loading="lazy"
             onerror="this.style.opacity='0.2'">
        <span>${htmlEsc(label)}</span>
      </button>`;
  }).join('');
}

function selectIcon(value) {
  // Update hidden input + preview in the main modal
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    const hidden = overlay.querySelector(`#field-${_iconPickerKey}`);
    if (hidden) hidden.value = value;
    const disp = overlay.querySelector(`.icon-current[data-icon-key="${_iconPickerKey}"]`);
    if (disp) updateIconDisplay(disp, value);
    const lbl = overlay.querySelector(`#icon-label-${_iconPickerKey}`);
    if (lbl) lbl.textContent = value.replace(/\.[^.]+$/, '');
  }
  closeIconPicker();
}

function closeIconPicker() {
  document.getElementById('icon-picker-overlay')?.remove();
  _iconPickerKey = null;
}

function tagChipHTML(text) {
  return `<span class="tag-chip">${htmlEsc(text)}<button type="button" class="tag-chip-remove" onclick="removeTagChip(this)">×</button></span>`;
}

function removeTagChip(btn) {
  const chip      = btn.closest('.tag-chip');
  const container = chip.closest('.form-tags-input');
  chip.remove();
  syncTagsHidden(container, container.dataset.field);
}

function wireTagInput(input) {
  const key = input.dataset.tagsFor;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.value.trim().replace(/,+$/, '');
      if (!val) return;
      const container = input.closest('.form-tags-input');
      const chip = document.createElement('span');
      chip.innerHTML = tagChipHTML(val);
      container.insertBefore(chip.firstElementChild, input);
      input.value = '';
      syncTagsHidden(container, key);
    }
    if (e.key === 'Backspace' && !input.value) {
      const container = input.closest('.form-tags-input');
      const chips = container.querySelectorAll('.tag-chip');
      if (chips.length) { chips[chips.length - 1].remove(); syncTagsHidden(container, key); }
    }
  });
}

function syncTagsHidden(container, key) {
  const tags = [...container.querySelectorAll('.tag-chip')].map(c => c.textContent.slice(0, -1).trim());
  const hidden = document.getElementById(`field-${key}`);
  if (hidden) hidden.value = JSON.stringify(tags);
}

function collectModalValues(overlay) {
  const vals = {};
  overlay.querySelectorAll('[id^="field-"]').forEach(el => {
    const key = el.name || el.id.replace('field-', '');
    if (el.type === 'number') vals[key] = el.value === '' ? 0 : parseFloat(el.value);
    else {
      try { vals[key] = JSON.parse(el.value); } catch { vals[key] = el.value; }
    }
  });
  return vals;
}

async function handleModalSave() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  const vals = collectModalValues(overlay);

  let valid = true;
  overlay._fields.forEach(f => {
    if (!f.required) return;
    const el    = overlay.querySelector(`#field-${f.key}`);
    const empty = !vals[f.key] || String(vals[f.key]).trim() === '';
    if (el) el.classList.toggle('error', empty);
    if (empty) valid = false;
  });
  if (!valid) { toast('Fill in all required fields', 'error'); return; }

  const btn = document.getElementById('modal-save-btn');
  btn.disabled = true; btn.textContent = 'Saving…';
  try {
    await overlay._onSave(vals);
    closeModal();
  } catch (e) {
    toast(`Error: ${e.message}`, 'error');
    btn.disabled = false; btn.textContent = 'Save';
  }
}

function handleModalDelete() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay?._onDelete) { closeModal(); overlay._onDelete(); }
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  if (overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
  overlay.remove();
}

/* ─── API helper ─────────────────────────────────────────────────────────────── */
async function apiFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(ROOT + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function rerender() { renderPage(); pingAllServices(); }

/* ─── Toast ──────────────────────────────────────────────────────────────────── */
/**
 * Generic confirmation modal.
 * Options: { title, message (HTML ok), label, danger, onConfirm }
 */
function showConfirmModal({ title = 'Confirm', message = 'Are you sure?', label = 'Confirm', danger = false, onConfirm }) {
  const existing = document.getElementById('confirm-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-modal-overlay';
  overlay.className = 'confirm-modal-overlay';
  overlay.innerHTML = `
    <div class="confirm-modal" role="dialog" aria-modal="true">
      <div class="confirm-modal-title">${htmlEsc(title)}</div>
      <div class="confirm-modal-msg">${message}</div>
      <div class="confirm-modal-actions">
        <button class="btn-secondary" id="confirm-modal-cancel">Cancel</button>
        <button class="${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-modal-ok">${htmlEsc(label)}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.getElementById  = id => overlay.querySelector('#' + id); // scoped helper
  overlay.querySelector('#confirm-modal-cancel').addEventListener('click', close);
  overlay.querySelector('#confirm-modal-ok').addEventListener('click', () => {
    close();
    onConfirm?.();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('#confirm-modal-cancel').focus();
}

function toast(msg, type = 'ok') {
  const el = document.createElement('div');
  el.className = `toast${type !== 'ok' ? ' ' + type : ''}`;
  el.textContent = msg;
  document.getElementById('toast-container')?.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

/* ─── Markdown renderer ──────────────────────────────────────────────────────── */
function mdToHtml(src) {
  let out = '', inCode = false, codeBuf = [], inUl = false;
  function fmt(s) {
    return htmlEsc(s)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  for (const line of src.split('\n')) {
    if (line.startsWith('```')) {
      if (inCode) { out += `<pre><code>${htmlEsc(codeBuf.join('\n'))}</code></pre>\n`; codeBuf = []; inCode = false; }
      else { if (inUl) { out += '</ul>\n'; inUl = false; } inCode = true; }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }
    if (inUl && !line.startsWith('- ')) { out += '</ul>\n'; inUl = false; }
    if      (line.startsWith('#### ')) out += `<h4>${fmt(line.slice(5))}</h4>\n`;
    else if (line.startsWith('### '))  out += `<h3>${fmt(line.slice(4))}</h3>\n`;
    else if (line.startsWith('## '))   out += `<h2>${fmt(line.slice(3))}</h2>\n`;
    else if (line.startsWith('# '))    out += `<h1>${fmt(line.slice(2))}</h1>\n`;
    else if (line.startsWith('- '))  { if (!inUl) { out += '<ul>\n'; inUl = true; } out += `<li>${fmt(line.slice(2))}</li>\n`; }
    else if (line.trim()) out += `<p>${fmt(line)}</p>\n`;
  }
  if (inUl) out += '</ul>\n';
  if (inCode) out += `<pre><code>${htmlEsc(codeBuf.join('\n'))}</code></pre>\n`;
  return out;
}

/* ─── Utils ──────────────────────────────────────────────────────────────────── */
function htmlEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function esc(s) { return String(s).replace(/"/g, '&quot;'); }

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME — MACHINE NOTES SECTION (mnotes widget)
═══════════════════════════════════════════════════════════════════════════════ */
const MNOTES_LAYOUT_KEY     = 'homelab-mnotes-layout';
const MNOTES_DEFAULT_CARD_W = 420;
const MNOTES_DEFAULT_CARD_H = 300;
const MNOTES_MIN_W = 280, MNOTES_MAX_W = 960, MNOTES_MIN_H = 180, MNOTES_MAX_H = 800;

let mnotesEditActive       = false;
let _pendingHiddenMnoteIds = null;
let mnotesResizeState      = null;

/* ─── Layout persistence ─────────────────────────────────────────────────────── */
function getMnotesLayout() {
  try { return JSON.parse(localStorage.getItem(MNOTES_LAYOUT_KEY)) || {}; }
  catch { return {}; }
}

function applyMnotesLayout() {
  const layout = getMnotesLayout();
  const grid   = document.getElementById('home-mnotes-grid');
  if (!grid || (!layout.order && !layout.sizes)) return;

  if (layout.order?.length) {
    const cards = [...grid.querySelectorAll('.hmnote-card')];
    layout.order.forEach(id => {
      const card = cards.find(c => c.dataset.machineId === String(id));
      if (card) grid.appendChild(card);
    });
  }
  if (layout.sizes && Object.keys(layout.sizes).length) {
    grid.classList.add('mnotes-layout-custom');
    grid.querySelectorAll('.hmnote-card').forEach(card => {
      const sz = layout.sizes[card.dataset.machineId];
      const w  = sz?.w || MNOTES_DEFAULT_CARD_W;
      const h  = sz?.h || MNOTES_DEFAULT_CARD_H;
      card.style.width     = w + 'px';
      card.style.minHeight = h + 'px';
      card.style.flex      = '0 0 auto';
    });
  }
}

/* ─── Render ─────────────────────────────────────────────────────────────────── */
async function renderHomeMnotesSection(el) {
  const hiddenIds  = _pendingHiddenMnoteIds ?? await getHiddenHomeMnoteIds();
  const hiddenSet  = new Set(hiddenIds);

  let noteData = { ids: [], notes: {} };
  try {
    const res = await fetch(ROOT + 'api/machine-notes.php?all=1');
    noteData  = await res.json();
  } catch {}

  const noteIds   = new Set(noteData.ids || []);
  const visibleMs = DATA.machines.filter(m => noteIds.has(m.id) && !hiddenSet.has(m.id));

  el.innerHTML = `<div class="home-mnotes-grid${getMnotesLayout().sizes ? ' mnotes-layout-custom' : ''}" id="home-mnotes-grid">
    ${visibleMs.length === 0
      ? `<div class="mnotes-widget-empty">No machine notes on dashboard. Use <strong>Edit Layout</strong> to add some.</div>`
      : visibleMs.map(m => hmnoteCardHTML(m, noteData.notes[m.id] || '')).join('')}
  </div>`;

  applyMnotesLayout();
}

function hmnoteCardHTML(m, content) {
  return `
    <div class="hmnote-card" data-machine-id="${m.id}" style="border-top-color:${mc(m.name)}">
      <div class="hmnote-card-actions" style="display:${mnotesEditActive ? '' : 'none'}">
        <button class="btn-card-delete" onclick="hideHomeMnote(${m.id}, event)" title="Hide from dashboard">✕</button>
      </div>
      <div class="hmnote-card-header">
        <div class="hmnote-card-title">
          ${renderIcon(m.icon, 16)}
          <span class="hmnote-machine-name" style="color:${mc(m.name)}">${m.name}</span>
        </div>
      </div>
      <div class="hmnote-card-body">${mdToHtml(content)}</div>
    </div>`;
}

function syncMnotesCardActions() {
  document.querySelectorAll('.hmnote-card-actions').forEach(a => {
    a.style.display = mnotesEditActive ? '' : 'none';
  });
}

async function refreshMnotesGrid() {
  const bodyEl = document.getElementById('home-section-body-mnotes');
  if (!bodyEl) return;
  await renderHomeMnotesSection(bodyEl);
  if (mnotesEditActive) {
    const grid = document.getElementById('home-mnotes-grid');
    if (grid) activateMnotesEditOnGrid(grid);
  }
}

/* ─── Hide / Add ─────────────────────────────────────────────────────────────── */
async function hideHomeMnote(machineId, e) {
  e?.stopPropagation();
  if (_pendingHiddenMnoteIds !== null) {
    if (!_pendingHiddenMnoteIds.includes(machineId)) _pendingHiddenMnoteIds.push(machineId);
    toast('Note hidden — click Save to apply', 'warn');
    await refreshMnotesGrid();
  } else {
    const ids = await getHiddenHomeMnoteIds();
    if (!ids.includes(machineId)) await saveHiddenHomeMnoteIds([...ids, machineId]);
    toast('Note hidden from dashboard', 'warn');
    rerender();
  }
}

async function addHomeMnote() {
  const hiddenIds = _pendingHiddenMnoteIds ?? await getHiddenHomeMnoteIds();
  const hiddenSet = new Set(hiddenIds);

  let noteIds = new Set();
  try {
    const res = await fetch(ROOT + 'api/machine-notes.php');
    noteIds   = new Set((await res.json()).ids || []);
  } catch {}

  // Machines that have a note but are currently hidden from the widget
  const available = DATA.machines.filter(m => noteIds.has(m.id) && hiddenSet.has(m.id));

  if (available.length === 0) {
    toast('All machine notes are already on the dashboard');
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:360px">
      <div class="modal-header"><span class="modal-title">Add Machine Note</span></div>
      <div class="modal-body" style="padding:20px 24px;display:flex;flex-direction:column;gap:10px">
        ${available.map(m => `
          <button class="mnotes-add-machine-btn" data-id="${m.id}"
            style="border-left-color:${mc(m.name)};text-align:left;display:flex;align-items:center;gap:10px;
                   padding:10px 14px;background:var(--bg-card-alt);border:1px solid var(--border);
                   border-left-width:3px;border-radius:6px;cursor:pointer;color:var(--text);font-size:14px">
            ${renderIcon(m.icon, 16)}
            <span style="font-family:var(--mono);font-weight:600;color:${mc(m.name)}">${m.name}</span>
          </button>`).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="mnotes-add-cancel">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#mnotes-add-cancel').onclick = () => overlay.remove();
  overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
  overlay.querySelectorAll('.mnotes-add-machine-btn').forEach(btn => {
    btn.onclick = async () => {
      const id = parseInt(btn.dataset.id);
      overlay.remove();
      if (_pendingHiddenMnoteIds !== null) {
        _pendingHiddenMnoteIds = _pendingHiddenMnoteIds.filter(hid => hid !== id);
        toast('Note added — click Save to apply');
        await refreshMnotesGrid();
      } else {
        const ids = await getHiddenHomeMnoteIds();
        await saveHiddenHomeMnoteIds(ids.filter(hid => hid !== id));
        rerender();
      }
    };
  });
}

/* ─── Edit mode ──────────────────────────────────────────────────────────────── */
function activateMnotesEditOnGrid(grid) {
  grid.querySelectorAll('.hmnote-card').forEach(card => {
    if (!card.style.width) {
      card.style.width     = MNOTES_DEFAULT_CARD_W + 'px';
      card.style.minHeight = MNOTES_DEFAULT_CARD_H + 'px';
    }
    card.style.flex = '0 0 auto';
  });
  grid.classList.add('mnotes-layout-edit');
  grid.querySelectorAll('.hmnote-card').forEach(addMnotesEditHandles);
}

function enterMnotesEditMode() {
  if (mnotesEditActive) return;
  mnotesEditActive       = true;
  _pendingHiddenMnoteIds = [...HOME_HIDDEN_MNOTE_IDS];

  const grid = document.getElementById('home-mnotes-grid');
  if (grid) activateMnotesEditOnGrid(grid);

  document.getElementById('mnotes-edit-btn').style.display   = 'none';
  document.getElementById('mnotes-add-btn').style.display    = '';
  document.getElementById('mnotes-save-btn').style.display   = '';
  document.getElementById('mnotes-reset-btn').style.display  = '';
  document.getElementById('mnotes-cancel-btn').style.display = '';
  syncMnotesCardActions();
}

function exitMnotesEditMode() {
  mnotesEditActive       = false;
  _pendingHiddenMnoteIds = null;

  const grid = document.getElementById('home-mnotes-grid');
  if (grid) {
    grid.classList.remove('mnotes-layout-edit');
    grid.querySelectorAll('.hmnote-card').forEach(removeMnotesEditHandles);
  }

  document.getElementById('mnotes-edit-btn').style.display   = '';
  document.getElementById('mnotes-add-btn').style.display    = 'none';
  document.getElementById('mnotes-save-btn').style.display   = 'none';
  document.getElementById('mnotes-reset-btn').style.display  = 'none';
  document.getElementById('mnotes-cancel-btn').style.display = 'none';
  syncMnotesCardActions();
}

function saveMnotesLayoutEdit() {
  const grid = document.getElementById('home-mnotes-grid');
  if (!grid) return;

  const order = [], sizes = {};
  grid.querySelectorAll('.hmnote-card').forEach(card => {
    const id = card.dataset.machineId;
    order.push(parseInt(id));
    sizes[id] = { w: card.offsetWidth, h: card.offsetHeight };
  });

  localStorage.setItem(MNOTES_LAYOUT_KEY, JSON.stringify({ order, sizes }));
  if (_pendingHiddenMnoteIds !== null) saveHiddenHomeMnoteIds(_pendingHiddenMnoteIds);
  exitMnotesEditMode();
  grid.classList.add('mnotes-layout-custom');
  toast('Notes layout saved');
}

function cancelMnotesLayoutEdit() {
  exitMnotesEditMode();
  rerender();
}

function confirmResetMnotesLayout() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div class="modal-header"><span class="modal-title">Reset Notes Layout</span></div>
      <div class="modal-body" style="padding:20px 24px">
        <p style="margin:0;color:var(--text-muted);font-size:14px">
          Reset all note cards to their default size and order?
          You'll still need to click <strong style="color:var(--text)">Save</strong> to apply.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="mnr-no">No</button>
        <div class="modal-footer-right"><button class="btn-danger" id="mnr-yes">Yes, Reset</button></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#mnr-no').onclick  = () => overlay.remove();
  overlay.querySelector('#mnr-yes').onclick = () => { overlay.remove(); resetMnotesLayout(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function resetMnotesLayout() {
  const grid = document.getElementById('home-mnotes-grid');
  if (!grid) return;
  grid.querySelectorAll('.hmnote-card').forEach(card => {
    card.style.width     = MNOTES_DEFAULT_CARD_W + 'px';
    card.style.minHeight = MNOTES_DEFAULT_CARD_H + 'px';
    card.style.flex      = '0 0 auto';
  });
  const cards = [...grid.querySelectorAll('.hmnote-card')];
  cards.sort((a, b) => parseInt(a.dataset.machineId) - parseInt(b.dataset.machineId));
  cards.forEach(c => grid.appendChild(c));
  grid.classList.add('mnotes-layout-custom');
  toast('Layout reset — click Save to apply');
}

/* ─── Card edit handles (drag + resize) ──────────────────────────────────────── */
function addMnotesEditHandles(card) {
  const dh = document.createElement('div');
  dh.className = 'layout-drag-handle';
  dh.innerHTML = '<span class="drag-dots">⠿</span> drag to reorder';
  card.insertBefore(dh, card.firstChild);

  const rh = document.createElement('div');
  rh.className = 'mnotes-resize-handle';
  card.appendChild(rh);

  card.setAttribute('draggable', 'true');
  card.addEventListener('dragstart', onMnotesDragStart);
  card.addEventListener('dragover',  onMnotesDragOver);
  card.addEventListener('dragleave', onMnotesDragLeave);
  card.addEventListener('drop',      onMnotesDrop);
  card.addEventListener('dragend',   onMnotesDragEnd);

  rh.addEventListener('pointerdown', startMnotesResize);
}

function removeMnotesEditHandles(card) {
  card.querySelector('.layout-drag-handle')?.remove();
  card.querySelector('.mnotes-resize-handle')?.remove();
  card.removeAttribute('draggable');
  card.removeEventListener('dragstart', onMnotesDragStart);
  card.removeEventListener('dragover',  onMnotesDragOver);
  card.removeEventListener('dragleave', onMnotesDragLeave);
  card.removeEventListener('drop',      onMnotesDrop);
  card.removeEventListener('dragend',   onMnotesDragEnd);
}

let _mnoteDragSrc = null;

function onMnotesDragStart(e) {
  _mnoteDragSrc = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
  setTimeout(() => _mnoteDragSrc?.classList.add('layout-dragging'), 0);
}
function onMnotesDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  if (target === _mnoteDragSrc) return;
  const rect = target.getBoundingClientRect();
  target.classList.remove('layout-drop-before', 'layout-drop-after');
  target.classList.add(e.clientX < rect.left + rect.width / 2 ? 'layout-drop-before' : 'layout-drop-after');
}
function onMnotesDragLeave(e) {
  e.currentTarget.classList.remove('layout-drop-before', 'layout-drop-after');
}
function onMnotesDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target === _mnoteDragSrc) return;
  const rect = target.getBoundingClientRect();
  if (e.clientX < rect.left + rect.width / 2) target.before(_mnoteDragSrc);
  else target.after(_mnoteDragSrc);
  target.classList.remove('layout-drop-before', 'layout-drop-after');
}
function onMnotesDragEnd() {
  _mnoteDragSrc?.classList.remove('layout-dragging');
  document.querySelectorAll('.hmnote-card.layout-drop-before, .hmnote-card.layout-drop-after')
          .forEach(el => el.classList.remove('layout-drop-before', 'layout-drop-after'));
  _mnoteDragSrc = null;
}

function startMnotesResize(e) {
  e.preventDefault();
  e.stopPropagation();
  const card = e.currentTarget.closest('.hmnote-card');
  mnotesResizeState = {
    handle: e.currentTarget,
    card,
    startX: e.clientX, startY: e.clientY,
    startW: card.offsetWidth, startH: card.offsetHeight,
  };
  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.addEventListener('pointermove', onMnotesResize);
  e.currentTarget.addEventListener('pointerup',   endMnotesResize);
}
function onMnotesResize(e) {
  if (!mnotesResizeState) return;
  const { card, startX, startY, startW, startH } = mnotesResizeState;
  card.style.width     = Math.min(MNOTES_MAX_W, Math.max(MNOTES_MIN_W, startW + (e.clientX - startX))) + 'px';
  card.style.minHeight = Math.min(MNOTES_MAX_H, Math.max(MNOTES_MIN_H, startH + (e.clientY - startY))) + 'px';
}
function endMnotesResize(e) {
  if (!mnotesResizeState) return;
  mnotesResizeState.handle.removeEventListener('pointermove', onMnotesResize);
  mnotesResizeState.handle.removeEventListener('pointerup',   endMnotesResize);
  mnotesResizeState = null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   LAYOUT EDIT MODE — drag to reorder, resize handles
═══════════════════════════════════════════════════════════════════════════════ */

const LAYOUT_KEY      = 'homelab-machine-layout';
const HMC_DISPLAY_KEY = 'homelab-hmc-display';
const HMC_DISPLAY_DEFAULTS = { role: true, badges: true, notes: true, services: true, stats: false };
const MIN_W = 300, MAX_W = 920, MIN_H = 200, MAX_H = 740;
const DEFAULT_CARD_W = 380, DEFAULT_CARD_H = 260;

function getHmcDisplayPrefs(machineId) {
  try {
    const all = JSON.parse(localStorage.getItem(HMC_DISPLAY_KEY)) || {};
    return { ...HMC_DISPLAY_DEFAULTS, ...(all[machineId] || {}) };
  } catch { return { ...HMC_DISPLAY_DEFAULTS }; }
}

function saveHmcDisplayPrefs(machineId, prefs) {
  try {
    const all = JSON.parse(localStorage.getItem(HMC_DISPLAY_KEY)) || {};
    all[machineId] = prefs;
    localStorage.setItem(HMC_DISPLAY_KEY, JSON.stringify(all));
  } catch {}
}

let layoutEditActive  = false;
let layoutDragSrc     = null;
let resizeState       = null;
let _pendingHiddenIds = null; // non-null only during layout edit mode; committed on Save

/* ─── Persist / restore ──────────────────────────────────────────────────────── */
function getLayout() {
  try { return JSON.parse(localStorage.getItem(LAYOUT_KEY)) || {}; }
  catch { return {}; }
}

function applyLayout() {
  const layout = getLayout();
  const grid   = document.getElementById('home-machines-grid');
  if (!grid || (!layout.order && !layout.sizes)) return;

  // Restore order by re-appending cards
  if (layout.order?.length) {
    const cards = [...grid.querySelectorAll('.home-machine-card')];
    layout.order.forEach(id => {
      const card = cards.find(c => c.dataset.machineId === String(id));
      if (card) grid.appendChild(card);
    });
  }

  // Restore sizes — keep grid in flex mode so explicit widths don't overlap
  if (layout.sizes && Object.keys(layout.sizes).length) {
    grid.classList.add('layout-has-custom');
    grid.querySelectorAll('.home-machine-card').forEach(card => {
      const sz = layout.sizes[card.dataset.machineId];
      // New cards not yet in saved layout get the default size
      const w = sz?.w || DEFAULT_CARD_W;
      const h = sz?.h || DEFAULT_CARD_H;
      card.style.width     = w + 'px';
      card.style.minHeight = h + 'px';
      card.style.flex      = '0 0 auto';
    });
  }
}

/* ─── Enter edit mode ────────────────────────────────────────────────────────── */
function activateLayoutEditOnGrid(grid) {
  grid.querySelectorAll('.home-machine-card').forEach(card => {
    if (!card.style.width) {
      card.style.width     = DEFAULT_CARD_W + 'px';
      card.style.minHeight = DEFAULT_CARD_H + 'px';
    }
    card.style.flex = '0 0 auto';
  });
  grid.classList.add('layout-edit');
  grid.querySelectorAll('.home-machine-card').forEach(addEditHandles);
}

function enterLayoutEditMode() {
  if (layoutEditActive) return;
  layoutEditActive = true;
  _pendingHiddenIds = [...HOME_HIDDEN_MACHINE_IDS];

  const grid = document.getElementById('home-machines-grid');
  if (!grid) return;

  activateLayoutEditOnGrid(grid);

  // Swap buttons
  document.getElementById('layout-edit-btn').style.display       = 'none';
  document.getElementById('home-add-machine-btn').style.display  = '';
  document.getElementById('layout-save-btn').style.display       = '';
  document.getElementById('layout-reset-btn').style.display      = '';
  document.getElementById('layout-cancel-btn').style.display     = '';
  syncHomeMachineDashboardActions();
}

/* ─── Exit edit mode ─────────────────────────────────────────────────────────── */
function exitLayoutEditMode() {
  layoutEditActive  = false;
  _pendingHiddenIds = null;
  const grid = document.getElementById('home-machines-grid');
  if (!grid) return;

  grid.classList.remove('layout-edit');
  grid.querySelectorAll('.home-machine-card').forEach(removeEditHandles);

  document.getElementById('layout-edit-btn').style.display       = '';
  document.getElementById('home-add-machine-btn').style.display  = 'none';
  document.getElementById('layout-save-btn').style.display       = 'none';
  document.getElementById('layout-reset-btn').style.display      = 'none';
  document.getElementById('layout-cancel-btn').style.display     = 'none';
  syncHomeMachineDashboardActions();
}

/* ─── Save / Cancel ──────────────────────────────────────────────────────────── */
function saveLayoutEdit() {
  const grid = document.getElementById('home-machines-grid');
  if (!grid) return;

  const order = [];
  const sizes = {};
  grid.querySelectorAll('.home-machine-card').forEach(card => {
    const id = card.dataset.machineId;
    order.push(parseInt(id));
    sizes[id] = { w: card.offsetWidth, h: card.offsetHeight };
  });

  localStorage.setItem(LAYOUT_KEY, JSON.stringify({ order, sizes }));
  if (_pendingHiddenIds !== null) {
    saveHiddenHomeMachineIds(_pendingHiddenIds);
  }
  exitLayoutEditMode();
  // Keep grid in flex mode so saved widths don't collide with CSS grid
  grid.classList.add('layout-has-custom');
  toast('Layout saved');
}

function cancelLayoutEdit() {
  exitLayoutEditMode();
  // Rerender resets everything, then reapply saved layout
  rerender();
}

function confirmResetLayout() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:380px">
      <div class="modal-header">
        <span class="modal-title">Reset Layout</span>
      </div>
      <div class="modal-body" style="padding:20px 24px">
        <p style="margin:0;color:var(--text-muted);font-size:14px">
          Reset all cards to their default size and order?
          You'll still need to click <strong style="color:var(--text)">Save</strong> to apply.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="reset-no-btn">No</button>
        <button class="btn-danger" id="reset-yes-btn">Yes, Reset</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.querySelector('#reset-no-btn').onclick  = () => overlay.remove();
  overlay.querySelector('#reset-yes-btn').onclick = () => { overlay.remove(); resetLayout(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

function resetLayout() {
  const grid = document.getElementById('home-machines-grid');
  if (!grid) return;
  // Set every card back to the default size
  grid.querySelectorAll('.home-machine-card').forEach(card => {
    card.style.width     = DEFAULT_CARD_W + 'px';
    card.style.minHeight = DEFAULT_CARD_H + 'px';
    card.style.flex      = '0 0 auto';
  });
  // Re-sort cards to original machine id order (ascending)
  const cards = [...grid.querySelectorAll('.home-machine-card')];
  cards.sort((a, b) => parseInt(a.dataset.machineId) - parseInt(b.dataset.machineId));
  cards.forEach(c => grid.appendChild(c));
  // Keep flex mode active so the explicit default sizes are respected
  grid.classList.add('layout-has-custom');
  toast('Layout reset — click Save to apply');
}

/* ─── Drag-to-reorder ────────────────────────────────────────────────────────── */
function addEditHandles(card) {
  // Drag handle bar
  const dh = document.createElement('div');
  dh.className = 'layout-drag-handle';
  dh.innerHTML = '<span class="drag-dots">⠿</span> drag to reorder';
  card.insertBefore(dh, card.firstChild);

  // Resize corner handle (SE)
  const rh = document.createElement('div');
  rh.className = 'layout-resize-handle';
  card.appendChild(rh);

  // Pencil button — configure card display fields
  const actionsBar = card.querySelector('.home-machine-dashboard-actions');
  if (actionsBar) {
    const pb = document.createElement('button');
    pb.className = 'btn-card-edit layout-display-edit-btn';
    pb.title = 'Configure card display';
    pb.innerHTML = '✎';
    const machineId = parseInt(card.dataset.machineId);
    pb.onclick = (e) => { e.stopPropagation(); editHomeMachineDisplay(machineId, e); };
    actionsBar.insertBefore(pb, actionsBar.firstChild);
  }

  // Enable drag
  card.setAttribute('draggable', 'true');
  card.addEventListener('dragstart',  onDragStart);
  card.addEventListener('dragover',   onDragOver);
  card.addEventListener('dragleave',  onDragLeave);
  card.addEventListener('drop',       onDrop);
  card.addEventListener('dragend',    onDragEnd);

  // Resize pointer events
  rh.addEventListener('pointerdown', startResize);
}

function removeEditHandles(card) {
  card.querySelector('.layout-drag-handle')?.remove();
  card.querySelector('.layout-resize-handle')?.remove();
  card.querySelector('.layout-display-edit-btn')?.remove();
  card.removeAttribute('draggable');
  card.removeEventListener('dragstart',  onDragStart);
  card.removeEventListener('dragover',   onDragOver);
  card.removeEventListener('dragleave',  onDragLeave);
  card.removeEventListener('drop',       onDrop);
  card.removeEventListener('dragend',    onDragEnd);
}

function onDragStart(e) {
  layoutDragSrc = e.currentTarget;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', ''); // Firefox requires this
  setTimeout(() => layoutDragSrc?.classList.add('layout-dragging'), 0);
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  if (target === layoutDragSrc) return;
  // Show insert indicator: left half = before, right half = after
  const rect = target.getBoundingClientRect();
  target.classList.remove('layout-drop-before', 'layout-drop-after');
  target.classList.add(e.clientX < rect.left + rect.width / 2 ? 'layout-drop-before' : 'layout-drop-after');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('layout-drop-before', 'layout-drop-after');
}

function onDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  if (target === layoutDragSrc) return;
  const rect = target.getBoundingClientRect();
  if (e.clientX < rect.left + rect.width / 2) {
    target.before(layoutDragSrc);
  } else {
    target.after(layoutDragSrc);
  }
  target.classList.remove('layout-drop-before', 'layout-drop-after');
}

function onDragEnd() {
  layoutDragSrc?.classList.remove('layout-dragging');
  document.querySelectorAll('.layout-drop-before, .layout-drop-after')
          .forEach(el => el.classList.remove('layout-drop-before', 'layout-drop-after'));
  layoutDragSrc = null;
}

/* ─── Resize ─────────────────────────────────────────────────────────────────── */
function startResize(e) {
  e.preventDefault();
  e.stopPropagation();
  const card = e.currentTarget.closest('.home-machine-card, .hmnote-card');

  resizeState = {
    handle: e.currentTarget,
    card,
    startX: e.clientX,
    startY: e.clientY,
    startW: card.offsetWidth,
    startH: card.offsetHeight,
  };

  e.currentTarget.setPointerCapture(e.pointerId);
  e.currentTarget.addEventListener('pointermove', onResize);
  e.currentTarget.addEventListener('pointerup',   endResize);
}

function onResize(e) {
  if (!resizeState) return;
  const { card, startX, startY, startW, startH } = resizeState;
  const newW = Math.min(MAX_W, Math.max(MIN_W, startW + (e.clientX - startX)));
  const newH = Math.min(MAX_H, Math.max(MIN_H, startH + (e.clientY - startY)));
  card.style.width     = newW + 'px';
  card.style.minHeight = newH + 'px';
}

function endResize(e) {
  if (!resizeState) return;
  resizeState.handle.removeEventListener('pointermove', onResize);
  resizeState.handle.removeEventListener('pointerup',   endResize);
  resizeState = null;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   HOME ASSISTANT PAGE
═══════════════════════════════════════════════════════════════════════════════ */

const HA_DOMAIN_META = {
  light:               { label: 'Lights',         icon: '💡', priority: 1  },
  switch:              { label: 'Switches',        icon: '⏻',  priority: 2  },
  input_boolean:       { label: 'Toggles',         icon: '⊙',  priority: 3  },
  fan:                 { label: 'Fans',            icon: '◎',  priority: 4  },
  climate:             { label: 'Climate',         icon: '❄',  priority: 5  },
  cover:               { label: 'Covers',          icon: '▭',  priority: 6  },
  media_player:        { label: 'Media',           icon: '▶',  priority: 7  },
  lock:                { label: 'Locks',           icon: '⊡',  priority: 8  },
  sensor:              { label: 'Sensors',         icon: '◎',  priority: 9  },
  binary_sensor:       { label: 'Binary Sensors',  icon: '◉',  priority: 10 },
  scene:               { label: 'Scenes',          icon: '◈',  priority: 11 },
  script:              { label: 'Scripts',         icon: '▤',  priority: 12 },
  automation:          { label: 'Automations',     icon: '⟳',  priority: 13 },
  person:              { label: 'People',          icon: '◎',  priority: 14 },
  weather:             { label: 'Weather',         icon: '☁',  priority: 15 },
  alarm_control_panel: { label: 'Alarm',           icon: '⊡',  priority: 16 },
};

/* ── State ────────────────────────────────────────────────────────────────────── */
let _haStates       = [];
let _haPageConfig   = { sections: [] };
let _haConnected    = false;
let _haUrl          = '';
let _haEditing      = false;
let _haRefreshTimer = null;
// Drag state
let _haDragEntityId  = null;
let _haDragFromSec   = null;

/* ── Bootstrap ────────────────────────────────────────────────────────────────── */
async function renderHomeAssistant() {
  document.getElementById('page-content').innerHTML =
    pageHeader('Home Assistant') +
    `<div class="ha-page"><div class="text-muted" style="padding:40px;text-align:center;font-size:13px">Connecting…</div></div>`;
  startClock();
  clearInterval(_haRefreshTimer);
  _haEditing = false;

  try {
    const cfg = await apiFetch('api/homeassistant.php?resource=config');
    _haConnected = cfg.connected;
    _haUrl       = cfg.url;

    if (!cfg.url || !cfg.has_token) { _renderHASetup(false); return; }
    if (!cfg.connected)             { _renderHASetup(true);  return; }

    await Promise.all([_haLoadStates(), _haLoadPageConfig()]);
    _haRenderLayout();
    _haRefreshTimer = setInterval(_haAutoRefresh, 30000);
  } catch (e) {
    document.querySelector('.ha-page').innerHTML =
      `<div class="ha-error">Failed to load: ${htmlEsc(e.message)}</div>`;
  }
}

async function _haLoadStates() {
  _haStates = await apiFetch('api/homeassistant.php?resource=states');
}

async function _haLoadPageConfig() {
  try {
    _haPageConfig = await apiFetch('api/homeassistant.php?resource=page_config');
  } catch { _haPageConfig = { sections: [] }; }
}

async function _haAutoRefresh() {
  if (CURRENT_PAGE !== 'homeassistant') { clearInterval(_haRefreshTimer); return; }
  try { _haStates = await apiFetch('api/homeassistant.php?resource=states'); _haRenderLayout(); }
  catch { /* non-fatal */ }
}

/* ── Setup screen ─────────────────────────────────────────────────────────────── */
function _renderHASetup(isConfigured) {
  const desc = isConfigured
    ? 'Unable to connect. Verify your URL is reachable and token is valid.'
    : 'Connect your Home Assistant instance to control and monitor devices.';
  document.querySelector('.ha-page').innerHTML = `
    <div class="ha-setup">
      <h3>Connect Home Assistant</h3>
      <p>${desc}</p>
      <div class="ha-setup-form">
        <label class="ha-label">Home Assistant URL</label>
        <input id="ha-url-input" class="ha-input" type="url"
               placeholder="http://192.168.1.185:8123" value="${htmlEsc(_haUrl)}">
        <label class="ha-label">Long-Lived Access Token</label>
        <input id="ha-token-input" class="ha-input" type="password"
               placeholder="${isConfigured ? 'Leave blank to keep saved token' : 'Paste your token here'}">
        <div style="font-size:11px;color:var(--text-subtle)">
          Generate in Home Assistant: Profile → Security → Long-Lived Access Tokens
        </div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn-primary" onclick="haSaveConfig()">Connect</button>
          ${isConfigured ? `<button class="btn-secondary" onclick="haDisconnect()">Disconnect</button>` : ''}
        </div>
      </div>
    </div>`;
}

async function haSaveConfig() {
  const url   = document.getElementById('ha-url-input')?.value?.trim();
  const token = document.getElementById('ha-token-input')?.value?.trim();
  if (!url) { toast('URL is required', 'error'); return; }
  const body = { url };
  if (token) body.token = token;
  try {
    await apiFetch('api/homeassistant.php?resource=config', 'PUT', body);
    toast('Connecting…');
    renderHomeAssistant();
  } catch (e) { toast(e.message, 'error'); }
}

async function haDisconnect() {
  if (!confirm('Remove Home Assistant connection?')) return;
  await apiFetch('api/homeassistant.php?resource=config', 'DELETE');
  _haStates = []; _haConnected = false; _haUrl = '';
  renderHomeAssistant();
}

/* ── Layout render ────────────────────────────────────────────────────────────── */
function _haRenderLayout() {
  const container = document.querySelector('.ha-page');
  if (!container) return;

  const sections = _haPageConfig.sections || [];
  const addedIds = new Set(sections.flatMap(s => s.entities));
  const unaddedCount = _haStates.filter(e => !addedIds.has(e.entity_id)).length;

  container.innerHTML = `
    <div class="ha-header-bar">
      <div class="ha-status">
        <span class="ha-conn-dot ${_haConnected ? 'connected' : ''}"></span>
        <span style="font-size:12px;font-family:var(--mono);color:var(--text-muted)">
          ${_haConnected ? 'Connected' : 'Disconnected'} · ${htmlEsc(_haUrl)}
        </span>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${_haEditing ? `
          <button class="btn-secondary" style="font-size:12px;padding:5px 10px" onclick="haExitEditMode()">Cancel</button>
          <button class="btn-primary"   style="font-size:12px;padding:5px 10px" onclick="haSaveLayout()">Save Layout</button>
        ` : `
          <button class="ha-icon-btn" title="Refresh" onclick="_haAutoRefresh()">↺</button>
          <button class="ha-icon-btn" onclick="haEnterEditMode()">⊞ Edit Layout</button>
          <button class="ha-icon-btn" title="Settings" onclick="haShowSettings()">⚙</button>
        `}
      </div>
    </div>
    ${_haEditing ? `
      <div class="ha-edit-toolbar">
        <button class="ha-icon-btn" onclick="haAddSection()">+ Add Section</button>
        <button class="ha-icon-btn" onclick="haShowAddEntityModal(null)">
          + Add Entity${unaddedCount > 0 ? ` <span class="ha-badge">${unaddedCount}</span>` : ''}
        </button>
      </div>` : ''}
    <div id="ha-sections">
      ${sections.map((sec, idx) => _haRenderSection(sec, idx, sections.length)).join('')}
    </div>
    ${!_haEditing && sections.length === 0 ? `
      <div class="ha-empty-state">
        <div style="font-size:28px;margin-bottom:10px">◈</div>
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">
          No entities added. Edit the layout to create sections and add entities.
        </div>
        <button class="btn-primary" onclick="haEnterEditMode()">Edit Layout</button>
      </div>` : ''}
    ${_haEditing && sections.length === 0 ? `
      <div class="ha-empty-hint">No sections yet. Click <strong>+ Add Section</strong> to get started.</div>
    ` : ''}`;
}

function _haRenderSection(sec, idx, total) {
  const entities = (sec.entities || [])
    .map(eid => _haStates.find(e => e.entity_id === eid))
    .filter(Boolean);

  return `
    <div class="ha-section${_haEditing ? ' ha-section-editing' : ''}" data-sec="${sec.id}">
      <div class="ha-section-titlebar">
        ${_haEditing ? `
          <span class="ha-drag-handle" title="Reorder">⠿</span>
          <input class="ha-section-name-input" value="${htmlEsc(sec.name)}"
                 onchange="haRenameSection('${sec.id}',this.value)">
          <div class="ha-section-actions">
            <button class="ha-icon-btn ha-btn-xs" onclick="haMoveSectionUp(${idx})" ${idx===0?'disabled':''}>↑</button>
            <button class="ha-icon-btn ha-btn-xs" onclick="haMoveSectionDown(${idx})" ${idx===total-1?'disabled':''}>↓</button>
            <button class="ha-icon-btn ha-btn-xs" onclick="haShowAddEntityModal('${sec.id}')">+ Add</button>
            <button class="ha-icon-btn ha-btn-xs ha-btn-danger" onclick="haDeleteSection('${sec.id}')">Delete</button>
          </div>
        ` : `<span class="ha-section-title-text">${htmlEsc(sec.name)}</span>`}
      </div>
      <div class="ha-entity-grid${_haEditing ? ' ha-drop-zone' : ''}"
           data-sec="${sec.id}"
           ${_haEditing ? `ondragover="haEntityDragOver(event)" ondragleave="haEntityDragLeave(event)" ondrop="haEntityDrop(event,'${sec.id}')"` : ''}>
        ${entities.length === 0 && _haEditing
          ? `<div class="ha-drop-hint">Drag entities here or use + Add</div>`
          : entities.map(e => _haEntityCard(e, e.entity_id.split('.')[0], sec.id)).join('')}
      </div>
    </div>`;
}

/* ── Edit mode ────────────────────────────────────────────────────────────────── */
function haEnterEditMode() {
  _haEditing = true;
  _haRenderLayout();
}

function haExitEditMode() {
  _haEditing = false;
  // Reload config from server to discard unsaved changes
  _haLoadPageConfig().then(() => _haRenderLayout());
}

async function haSaveLayout() {
  try {
    await apiFetch('api/homeassistant.php?resource=page_config', 'PUT', _haPageConfig);
    _haEditing = false;
    _haRenderLayout();
    toast('Layout saved');
  } catch (e) { toast(e.message, 'error'); }
}

function haAddSection() {
  const id   = 's_' + Date.now();
  const name = 'New Section';
  _haPageConfig.sections.push({ id, name, entities: [] });
  _haRenderLayout();
  // Focus the new section's name input
  setTimeout(() => {
    const inputs = document.querySelectorAll('.ha-section-name-input');
    if (inputs.length) inputs[inputs.length - 1].focus();
  }, 50);
}

function haRenameSection(sectionId, name) {
  const sec = _haPageConfig.sections.find(s => s.id === sectionId);
  if (sec) sec.name = name.trim() || 'Unnamed Section';
}

function haMoveSectionUp(idx) {
  if (idx <= 0) return;
  const secs = _haPageConfig.sections;
  [secs[idx - 1], secs[idx]] = [secs[idx], secs[idx - 1]];
  _haRenderLayout();
}

function haMoveSectionDown(idx) {
  const secs = _haPageConfig.sections;
  if (idx >= secs.length - 1) return;
  [secs[idx], secs[idx + 1]] = [secs[idx + 1], secs[idx]];
  _haRenderLayout();
}

function haDeleteSection(sectionId) {
  const sec = _haPageConfig.sections.find(s => s.id === sectionId);
  if (!sec) return;
  const count = sec.entities.length;
  const msg = count > 0
    ? `Delete section "${sec.name}"? Its ${count} ${count===1?'entity':'entities'} will be removed from the page (not from Home Assistant).`
    : `Delete section "${sec.name}"?`;
  if (!confirm(msg)) return;
  _haPageConfig.sections = _haPageConfig.sections.filter(s => s.id !== sectionId);
  _haRenderLayout();
}

/* ── Add Entity Modal ─────────────────────────────────────────────────────────── */
function haShowAddEntityModal(targetSectionId) {
  const addedIds = new Set(_haPageConfig.sections.flatMap(s => s.entities));
  const unadded  = _haStates.filter(e => !addedIds.has(e.entity_id));

  if (unadded.length === 0) {
    toast('All entities are already on the page', 'info');
    return;
  }

  // Group unadded by domain
  const byDomain = {};
  for (const e of unadded) {
    const d = e.entity_id.split('.')[0];
    (byDomain[d] = byDomain[d] || []).push(e);
  }
  const domainOrder = Object.keys(HA_DOMAIN_META);
  const domains = Object.keys(byDomain).sort((a,b) =>
    (domainOrder.indexOf(a)+1 || 99) - (domainOrder.indexOf(b)+1 || 99));

  const sectionOptions = _haPageConfig.sections.map(s =>
    `<option value="${s.id}" ${s.id === targetSectionId ? 'selected' : ''}>${htmlEsc(s.name)}</option>`
  ).join('');

  const entityRows = domains.map(d => {
    const meta = HA_DOMAIN_META[d] || { icon: '◎', label: d };
    return `
      <div class="ha-add-domain-group">
        <div class="ha-add-domain-header">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
            <input type="checkbox" class="ha-add-domain-check" data-domain="${d}"
                   onchange="haToggleAddDomain('${d}',this.checked)">
            ${meta.icon} ${meta.label} (${byDomain[d].length})
          </label>
        </div>
        ${byDomain[d].map(e => {
          const name = e.attributes?.friendly_name || e.entity_id;
          return `
            <label class="ha-add-entity-row">
              <input type="checkbox" class="ha-add-check" value="${e.entity_id}">
              <span class="ha-add-entity-name">${htmlEsc(name)}</span>
              <span class="ha-add-entity-id">${htmlEsc(e.entity_id)}</span>
            </label>`;
        }).join('')}
      </div>`;
  }).join('');

  // Use a custom modal since openModal() doesn't support this UI
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal ha-add-modal">
      <div class="modal-header">
        <span class="modal-icon">◈</span>
        <span class="modal-title">Add Entities to Page</span>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        ${_haPageConfig.sections.length > 0 ? `
          <div style="margin-bottom:12px">
            <label class="ha-label">Add to section</label>
            <select id="ha-add-target-section" class="ha-input">
              ${sectionOptions}
            </select>
          </div>` : `
          <div class="ha-add-warn">
            No sections exist. <button class="link-btn" onclick="this.closest('.modal-overlay').remove();haAddSection()">Create a section first.</button>
          </div>`}
        <div style="margin-bottom:8px">
          <input class="ha-input" type="text" placeholder="Search entities…"
                 oninput="haFilterAddModal(this.value)">
        </div>
        <div class="ha-add-entity-list" id="ha-add-entity-list">
          ${entityRows}
        </div>
      </div>
      <div class="modal-footer">
        <span id="ha-add-count" style="font-size:12px;color:var(--text-muted)">0 selected</span>
        <div style="display:flex;gap:8px">
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          ${_haPageConfig.sections.length > 0
            ? `<button class="btn-primary" onclick="haConfirmAddEntities()">Add Selected</button>`
            : ''}
        </div>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener('change', () => _haUpdateAddCount());
  overlay.querySelector('.modal')?.addEventListener('click', e => e.stopPropagation());
  overlay.addEventListener('click', () => overlay.remove());
}

function haToggleAddDomain(domain, checked) {
  document.querySelectorAll(`#ha-add-entity-list .ha-add-check`).forEach(cb => {
    if (cb.value.startsWith(domain + '.')) cb.checked = checked;
  });
  _haUpdateAddCount();
}

function _haUpdateAddCount() {
  const n = document.querySelectorAll('#ha-add-entity-list .ha-add-check:checked').length;
  const el = document.getElementById('ha-add-count');
  if (el) el.textContent = `${n} selected`;
}

function haFilterAddModal(q) {
  const lower = q.toLowerCase();
  document.querySelectorAll('#ha-add-entity-list .ha-add-entity-row').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(lower) ? '' : 'none';
  });
  document.querySelectorAll('#ha-add-entity-list .ha-add-domain-group').forEach(grp => {
    const visible = [...grp.querySelectorAll('.ha-add-entity-row')].some(r => r.style.display !== 'none');
    grp.style.display = visible ? '' : 'none';
  });
}

function haConfirmAddEntities() {
  const checked = [...document.querySelectorAll('#ha-add-entity-list .ha-add-check:checked')]
    .map(cb => cb.value);
  if (checked.length === 0) { toast('No entities selected', 'error'); return; }

  const targetId = document.getElementById('ha-add-target-section')?.value;
  const sec = _haPageConfig.sections.find(s => s.id === targetId);
  if (!sec) { toast('Select a section', 'error'); return; }

  for (const eid of checked) {
    if (!sec.entities.includes(eid)) sec.entities.push(eid);
  }

  document.querySelector('.modal-overlay')?.remove();
  _haRenderLayout();
  toast(`Added ${checked.length} ${checked.length === 1 ? 'entity' : 'entities'} to "${sec.name}"`);
}

/* ── Remove Entity ────────────────────────────────────────────────────────────── */
function haConfirmRemoveEntity(entityId, sectionId) {
  const entity = _haStates.find(e => e.entity_id === entityId);
  const name   = entity?.attributes?.friendly_name || entityId;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <span class="modal-icon">⊡</span>
        <span class="modal-title">Remove Entity</span>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <p style="margin:0;font-size:13px;color:var(--text-muted)">
          Remove <strong style="color:var(--text)">${htmlEsc(name)}</strong> from this page?
        </p>
        <p style="margin:10px 0 0;font-size:12px;color:var(--text-subtle)">
          This only removes it from your dashboard. The entity remains in Home Assistant.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-danger"    onclick="haDoRemoveEntity('${entityId}','${sectionId}')">Remove from Page</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal')?.addEventListener('click', e => e.stopPropagation());
  overlay.addEventListener('click', () => overlay.remove());
}

function haDoRemoveEntity(entityId, sectionId) {
  document.querySelector('.modal-overlay')?.remove();
  const sec = _haPageConfig.sections.find(s => s.id === sectionId);
  if (sec) sec.entities = sec.entities.filter(e => e !== entityId);
  _haRenderLayout();
}

/* ── Drag & Drop (entities between/within sections) ───────────────────────────── */
function haEntityDragStart(event, entityId, sectionId) {
  _haDragEntityId = entityId;
  _haDragFromSec  = sectionId;
  event.dataTransfer.effectAllowed = 'move';
  event.currentTarget.classList.add('ha-dragging');
}

function haEntityDragEnd(event) {
  event.currentTarget.classList.remove('ha-dragging');
  document.querySelectorAll('.ha-drop-zone').forEach(z => z.classList.remove('ha-drag-over'));
}

function haEntityDragOver(event) {
  if (!_haDragEntityId) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.currentTarget.classList.add('ha-drag-over');
}

function haEntityDragLeave(event) {
  event.currentTarget.classList.remove('ha-drag-over');
}

function haEntityDrop(event, targetSectionId) {
  event.preventDefault();
  event.currentTarget.classList.remove('ha-drag-over');
  if (!_haDragEntityId || !_haDragFromSec) return;

  // Determine insert position based on mouse Y relative to existing entity cards
  const grid      = event.currentTarget;
  const cards     = [...grid.querySelectorAll('.ha-entity[data-entity]')];
  let   insertIdx = cards.length; // default: append

  for (let i = 0; i < cards.length; i++) {
    const rect   = cards[i].getBoundingClientRect();
    const midY   = rect.top + rect.height / 2;
    const midX   = rect.left + rect.width  / 2;
    // Use X for row-major grid, Y for secondary
    if (event.clientY < midY || (Math.abs(event.clientY - midY) < 10 && event.clientX < midX)) {
      insertIdx = i; break;
    }
  }

  // Remove from source
  const srcSec = _haPageConfig.sections.find(s => s.id === _haDragFromSec);
  if (srcSec) srcSec.entities = srcSec.entities.filter(e => e !== _haDragEntityId);

  // Insert into target at computed position
  const tgtSec = _haPageConfig.sections.find(s => s.id === targetSectionId);
  if (tgtSec) {
    const list = tgtSec.entities.filter(e => e !== _haDragEntityId); // dedupe
    list.splice(insertIdx, 0, _haDragEntityId);
    tgtSec.entities = list;
  }

  _haDragEntityId = null;
  _haDragFromSec  = null;
  _haRenderLayout();
}

/* ── Entity cards ─────────────────────────────────────────────────────────────── */
function _haEntityCard(entity, domain, sectionId) {
  const name    = entity.attributes?.friendly_name || entity.entity_id.split('.')[1].replace(/_/g, ' ');
  const state   = entity.state;
  const attrs   = entity.attributes || {};
  const unavail = state === 'unavailable' || state === 'unknown';
  const eid     = entity.entity_id;
  const meta    = HA_DOMAIN_META[domain] || { icon: '◎' };

  if (_haEditing) {
    return `
      <div class="ha-entity ha-entity-compact${unavail ? ' ha-unavailable' : ''}"
           data-entity="${eid}"
           draggable="true"
           ondragstart="haEntityDragStart(event,'${eid}','${sectionId}')"
           ondragend="haEntityDragEnd(event)">
        <span class="ha-drag-handle" style="font-size:14px;margin-right:4px">⠿</span>
        <span class="ha-entity-domain-icon">${meta.icon}</span>
        <span class="ha-entity-name" style="flex:1">${htmlEsc(name)}</span>
        <button class="ha-remove-btn" onclick="haConfirmRemoveEntity('${eid}','${sectionId}')">×</button>
      </div>`;
  }

  let body = '';

  if (domain === 'light') {
    const on  = state === 'on';
    const bri = attrs.brightness != null ? Math.round(attrs.brightness / 255 * 100) : null;
    body = `
      <div class="ha-entity-row">
        <span class="ha-entity-name">${htmlEsc(name)}</span>
        ${!unavail ? `<button class="ha-toggle${on ? ' on' : ''}" onclick="haToggle('${eid}')"><span class="ha-toggle-thumb"></span></button>` : ''}
      </div>
      <div class="ha-entity-state ${on ? 'ha-state-on' : 'ha-state-off'}">
        ${unavail ? 'Unavailable' : on ? `On${bri != null ? ` · ${bri}%` : ''}` : 'Off'}
      </div>
      ${on && bri != null && !unavail ? `
        <div class="ha-brightness-bar"><div class="ha-brightness-fill" style="width:${bri}%"></div></div>
        <div class="ha-btn-row">
          ${[25,50,75,100].map(b => `<button class="ha-btn-sm${bri===b?' active':''}" onclick="haSetBrightness('${eid}',${b})">${b}%</button>`).join('')}
        </div>` : ''}`;

  } else if (['switch','input_boolean','fan','automation'].includes(domain)) {
    const on = state === 'on';
    const stateLabel = domain === 'automation' ? (on ? 'Enabled' : 'Disabled') : (on ? 'On' : 'Off');
    body = `
      <div class="ha-entity-row">
        <span class="ha-entity-name">${htmlEsc(name)}</span>
        ${!unavail ? `<button class="ha-toggle${on ? ' on' : ''}" onclick="haToggle('${eid}')"><span class="ha-toggle-thumb"></span></button>` : ''}
      </div>
      <div class="ha-entity-state ${on ? 'ha-state-on' : 'ha-state-off'}">${unavail ? 'Unavailable' : stateLabel}</div>`;

  } else if (domain === 'sensor') {
    const unit = attrs.unit_of_measurement || '';
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div class="ha-sensor-value">
        <span class="ha-value">${unavail ? '—' : htmlEsc(state)}</span>
        ${unit ? `<span class="ha-unit">${htmlEsc(unit)}</span>` : ''}
      </div>`;

  } else if (domain === 'binary_sensor') {
    const on  = state === 'on';
    const [onL, offL] = _haBinaryLabels(attrs.device_class || '');
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div style="margin-top:6px">
        <span class="ha-state-chip ${on ? 'on' : 'off'}">${unavail ? 'Unavailable' : on ? onL : offL}</span>
      </div>`;

  } else if (domain === 'climate') {
    const cur   = attrs.current_temperature;
    const tgt   = attrs.temperature;
    const unit  = attrs.temperature_unit || '°';
    const modes = attrs.hvac_modes || [];
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div class="ha-climate-temps">
        ${cur != null ? `<span style="font-size:16px;font-weight:600;color:var(--text-bright)">${cur}${unit}</span>` : ''}
        ${tgt != null ? `<span style="font-size:12px;color:var(--text-muted)">→ ${tgt}${unit}</span>` : ''}
      </div>
      <div class="ha-entity-state">${htmlEsc(state)}</div>
      ${!unavail && modes.length ? `
        <div class="ha-btn-row">
          ${modes.map(m=>`<button class="ha-btn-sm${state===m?' active':''}" onclick="haSetHvacMode('${eid}','${m}')">${m}</button>`).join('')}
        </div>` : ''}
      ${tgt != null && !unavail ? `
        <div class="ha-temp-controls">
          <button class="ha-btn-sm" onclick="haAdjustTemp('${eid}',${tgt},-0.5)">−</button>
          <span style="font-size:13px;min-width:40px;text-align:center">${tgt}${unit}</span>
          <button class="ha-btn-sm" onclick="haAdjustTemp('${eid}',${tgt},0.5)">+</button>
        </div>` : ''}`;

  } else if (domain === 'cover') {
    const pos = attrs.current_position;
    body = `
      <div class="ha-entity-row">
        <span class="ha-entity-name">${htmlEsc(name)}</span>
        <span class="ha-entity-state">${unavail ? 'Unavailable' : htmlEsc(state)}</span>
      </div>
      ${pos != null ? `<div class="ha-brightness-bar"><div class="ha-brightness-fill" style="width:${pos}%"></div></div>` : ''}
      ${!unavail ? `
        <div class="ha-btn-row">
          <button class="ha-btn-sm" onclick="haCallService('cover','open_cover','${eid}')">Open</button>
          <button class="ha-btn-sm" onclick="haCallService('cover','stop_cover','${eid}')">Stop</button>
          <button class="ha-btn-sm" onclick="haCallService('cover','close_cover','${eid}')">Close</button>
        </div>` : ''}`;

  } else if (domain === 'media_player') {
    const playing = state === 'playing';
    const title   = attrs.media_title  || '';
    const artist  = attrs.media_artist || '';
    body = `
      <div class="ha-entity-row">
        <span class="ha-entity-name">${htmlEsc(name)}</span>
        <span class="ha-entity-state ${playing ? 'ha-state-on' : ''}">${unavail ? 'Unavailable' : htmlEsc(state)}</span>
      </div>
      ${title ? `<div class="ha-media-title">${htmlEsc(title)}${artist ? ` — ${htmlEsc(artist)}` : ''}</div>` : ''}
      ${!unavail && state !== 'off' ? `
        <div class="ha-btn-row">
          <button class="ha-btn-sm" onclick="haCallService('media_player','media_previous_track','${eid}')">⏮</button>
          <button class="ha-btn-sm" onclick="haCallService('media_player','${playing?'media_pause':'media_play'}','${eid}')">${playing?'⏸':'▶'}</button>
          <button class="ha-btn-sm" onclick="haCallService('media_player','media_next_track','${eid}')">⏭</button>
        </div>` : ''}`;

  } else if (domain === 'scene') {
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <button class="ha-activate-btn" onclick="haCallService('scene','turn_on','${eid}')">Activate</button>`;

  } else if (domain === 'script') {
    const running = state === 'on';
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <button class="ha-activate-btn${running?' running':''}" onclick="haCallService('script','turn_on','${eid}')">${running ? 'Running…' : 'Run'}</button>`;

  } else if (domain === 'lock') {
    const locked = state === 'locked';
    body = `
      <div class="ha-entity-row">
        <span class="ha-entity-name">${htmlEsc(name)}</span>
        <span class="ha-entity-state">${unavail ? 'Unavailable' : htmlEsc(state)}</span>
      </div>
      ${!unavail ? `<button class="ha-btn-sm" style="margin-top:6px" onclick="haCallService('lock','${locked?'unlock':'lock'}','${eid}')">${locked?'Unlock':'Lock'}</button>` : ''}`;

  } else if (domain === 'weather') {
    const temp = attrs.temperature;
    const unit = attrs.temperature_unit || '°';
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div class="ha-sensor-value">
        <span class="ha-value">${temp != null ? temp : '—'}</span>
        <span class="ha-unit">${htmlEsc(unit)}</span>
      </div>
      <div class="ha-entity-state">${htmlEsc(state)}</div>`;

  } else if (domain === 'person' || domain === 'device_tracker') {
    const home = state === 'home';
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div style="margin-top:6px">
        <span class="ha-state-chip ${home ? 'on' : 'off'}">${htmlEsc(state)}</span>
      </div>`;

  } else {
    body = `
      <div class="ha-entity-name">${htmlEsc(name)}</div>
      <div class="ha-entity-state">${unavail ? 'Unavailable' : htmlEsc(state)}</div>`;
  }

  return `
    <div class="ha-entity${unavail ? ' ha-unavailable' : ''}" data-entity="${eid}">
      <div class="ha-entity-domain-icon">${meta.icon}</div>
      ${body}
    </div>`;
}

function _haBinaryLabels(deviceClass) {
  const map = {
    battery:'Low|Normal', battery_charging:'Charging|Not charging',
    cold:'Cold|Normal', connectivity:'Connected|Disconnected',
    door:'Open|Closed', garage_door:'Open|Closed', gas:'Detected|Clear',
    heat:'Hot|Normal', light:'Light|No light', lock:'Unlocked|Locked',
    moisture:'Wet|Dry', motion:'Detected|Clear', moving:'Moving|Stopped',
    occupancy:'Occupied|Clear', opening:'Open|Closed', plug:'Plugged|Unplugged',
    power:'Powered|No power', presence:'Home|Away', problem:'Problem|OK',
    running:'Running|Not running', safety:'Unsafe|Safe', smoke:'Detected|Clear',
    sound:'Detected|Clear', tamper:'Tampered|Clear', update:'Update available|Up-to-date',
    vibration:'Detected|Clear', window:'Open|Closed',
  };
  return (map[deviceClass] || 'On|Off').split('|');
}

/* ── Service calls ────────────────────────────────────────────────────────────── */
async function haToggle(entityId) {
  const domain = entityId.split('.')[0];
  const entity = _haStates.find(e => e.entity_id === entityId);
  if (!entity) return;
  await haCallService(domain, entity.state === 'on' ? 'turn_off' : 'turn_on', entityId);
}

async function haSetBrightness(entityId, pct) {
  await haCallService('light', 'turn_on', entityId, { brightness_pct: pct });
}

async function haSetHvacMode(entityId, mode) {
  await haCallService('climate', 'set_hvac_mode', entityId, { hvac_mode: mode });
}

async function haAdjustTemp(entityId, current, delta) {
  const temp = Math.round((current + delta) * 2) / 2;
  await haCallService('climate', 'set_temperature', entityId, { temperature: temp });
}

async function haCallService(domain, service, entityId, extraData = {}) {
  const entity = _haStates.find(e => e.entity_id === entityId);
  if (entity) {
    if (service === 'turn_on')  entity.state = 'on';
    if (service === 'turn_off') entity.state = 'off';
    _haRenderLayout();
  }
  try {
    await apiFetch('api/homeassistant.php?resource=service', 'POST', {
      domain, service, data: { entity_id: entityId, ...extraData },
    });
    setTimeout(async () => {
      try { _haStates = await apiFetch('api/homeassistant.php?resource=states'); _haRenderLayout(); }
      catch { /* non-fatal */ }
    }, 1500);
  } catch (e) {
    toast(e.message, 'error');
    try { _haStates = await apiFetch('api/homeassistant.php?resource=states'); _haRenderLayout(); }
    catch { /* non-fatal */ }
  }
}

/* ── Settings modal ───────────────────────────────────────────────────────────── */
function haShowSettings() {
  openModal({
    title: 'Home Assistant Settings', icon: '◈',
    fields: [
      { key: 'url',   label: 'URL',          type: 'text',     value: _haUrl, placeholder: 'http://192.168.1.185:8123' },
      { key: 'token', label: 'Access Token', type: 'password', value: '',     placeholder: 'Leave blank to keep saved token' },
    ],
    onSave: async (vals) => {
      const body = { url: vals.url?.trim() };
      if (vals.token?.trim()) body.token = vals.token.trim();
      await apiFetch('api/homeassistant.php?resource=config', 'PUT', body);
      toast('Reconnecting…');
      renderHomeAssistant();
    },
    onDelete: async () => {
      if (!confirm('Disconnect Home Assistant?')) return;
      await apiFetch('api/homeassistant.php?resource=config', 'DELETE');
      _haStates = []; _haConnected = false; _haUrl = '';
      renderHomeAssistant();
    },
  });
}

/* ═══════════════════════════════════════════════════════════════════════════════
   TOPOLOGY WIDGET  (read-only map viewer on home page)
═══════════════════════════════════════════════════════════════════════════════ */
const TW_CANVAS_W = 4000, TW_CANVAS_H = 2400;

let _twData    = { nodes:{}, connections:{}, texts:{}, nextId:1 };
let _twZoom    = 0.2;
let _twPan     = null;    // { startX, startY, scrollLeft, scrollTop }
let _twAdjust  = false;   // true = viewport-adjust mode (pan+zoom enabled)
let _twSnap    = null;    // snapshot {zoom,scrollX,scrollY} for cancel

/* ── Init ────────────────────────────────────────────────────────────────────── */
async function initTopoWidget(el) {
  el.innerHTML = `
    <div class="tw-widget" id="tw-widget">
      <div class="tw-canvas-wrap" id="tw-canvas-wrap">
        <div class="tw-scroll-spacer" id="tw-scroll-spacer">
          <div class="tw-canvas" id="tw-canvas">
            <svg class="tw-svg" id="tw-svg">
              <defs>
                <marker id="tw-arrow" markerWidth="9" markerHeight="7"
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0,9 3.5,0 7" fill="#484f58"/>
                </marker>
              </defs>
              <g id="tw-conns-g"></g>
            </svg>
          </div>
        </div>
      </div>
      <div class="tw-adjust-hint" id="tw-adjust-hint" style="display:none">
        Drag to pan · Scroll to zoom · Click Save View when done
      </div>
      <div class="tw-zoom-bar" id="tw-zoom-bar" style="display:none">
        <button class="tw-zoom-btn" onclick="twZoomBy(-0.05)">－</button>
        <span id="tw-zoom-lbl">20%</span>
        <button class="tw-zoom-btn" onclick="twZoomBy(0.05)">＋</button>
        <button class="tw-zoom-btn" onclick="twZoomFit()" title="Fit all nodes">⊡</button>
      </div>
    </div>`;

  try {
    const data = await apiFetch('api/topology.php');
    _twData = data || { nodes:{}, connections:{}, texts:{}, nextId:1 };
  } catch { _twData = { nodes:{}, connections:{}, texts:{}, nextId:1 }; }

  _twRenderAll();

  // Load saved viewport or auto-fit
  const vp = await _twLoadViewport();
  if (vp && vp.zoom) {
    _twZoom = vp.zoom;
    _twApplyZoom();
    setTimeout(() => {
      const wrap = document.getElementById('tw-canvas-wrap');
      if (wrap) { wrap.scrollLeft = vp.scrollX || 0; wrap.scrollTop = vp.scrollY || 0; }
    }, 30);
  } else {
    twZoomFit();
  }

  _twBindEvents();
}

/* ── Viewport persistence ─────────────────────────────────────────────────────── */
async function _twLoadViewport() {
  try {
    const res = await apiFetch('api/settings.php');
    const raw = res.topo_widget_viewport;
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function _twSaveViewport(zoom, scrollX, scrollY) {
  await apiFetch('api/settings.php', 'PUT', {
    topo_widget_viewport: JSON.stringify({ zoom, scrollX, scrollY })
  });
}

/* ── Adjust-view mode ─────────────────────────────────────────────────────────── */
function twEnterAdjust() {
  const wrap = document.getElementById('tw-canvas-wrap');
  _twAdjust = true;
  _twSnap   = { zoom: _twZoom, scrollX: wrap?.scrollLeft || 0, scrollY: wrap?.scrollTop || 0 };

  document.getElementById('tw-adjust-btn')?.style && (document.getElementById('tw-adjust-btn').style.display = 'none');
  document.getElementById('tw-save-btn')?.style   && (document.getElementById('tw-save-btn').style.display   = '');
  document.getElementById('tw-cancel-btn')?.style && (document.getElementById('tw-cancel-btn').style.display = '');

  const hint = document.getElementById('tw-adjust-hint');
  const bar  = document.getElementById('tw-zoom-bar');
  if (hint) hint.style.display = '';
  if (bar)  bar.style.display  = '';

  const widget = document.getElementById('tw-widget');
  if (widget) widget.classList.add('tw-adjusting');
}

async function twSaveView() {
  const wrap = document.getElementById('tw-canvas-wrap');
  try {
    await _twSaveViewport(_twZoom, wrap?.scrollLeft || 0, wrap?.scrollTop || 0);
    toast('View saved');
  } catch(e) { toast(e.message, 'error'); }
  _twExitAdjust(false);
}

function twCancelAdjust() {
  if (_twSnap) {
    _twZoom = _twSnap.zoom;
    _twApplyZoom();
    setTimeout(() => {
      const wrap = document.getElementById('tw-canvas-wrap');
      if (wrap) { wrap.scrollLeft = _twSnap.scrollX; wrap.scrollTop = _twSnap.scrollY; }
    }, 10);
  }
  _twExitAdjust(true);
}

function _twExitAdjust(cancelled) {
  _twAdjust = false;
  _twSnap   = null;

  document.getElementById('tw-adjust-btn')?.style && (document.getElementById('tw-adjust-btn').style.display = '');
  document.getElementById('tw-save-btn')?.style   && (document.getElementById('tw-save-btn').style.display   = 'none');
  document.getElementById('tw-cancel-btn')?.style && (document.getElementById('tw-cancel-btn').style.display = 'none');

  const hint = document.getElementById('tw-adjust-hint');
  const bar  = document.getElementById('tw-zoom-bar');
  if (hint) hint.style.display = 'none';
  if (bar)  bar.style.display  = 'none';

  const widget = document.getElementById('tw-widget');
  if (widget) widget.classList.remove('tw-adjusting');
}

/* ── Zoom ────────────────────────────────────────────────────────────────────── */
function twZoomBy(delta) {
  if (!_twAdjust) return;
  const wrap = document.getElementById('tw-canvas-wrap');
  if (!wrap) return;
  const cx = (wrap.scrollLeft + wrap.clientWidth  / 2) / _twZoom;
  const cy = (wrap.scrollTop  + wrap.clientHeight / 2) / _twZoom;
  _twZoom = Math.round(Math.max(0.05, Math.min(2, _twZoom + delta)) * 100) / 100;
  _twApplyZoom();
  wrap.scrollLeft = cx * _twZoom - wrap.clientWidth  / 2;
  wrap.scrollTop  = cy * _twZoom - wrap.clientHeight / 2;
}

function twZoomFit() {
  const nodes = Object.values(_twData.nodes || {});
  if (!nodes.length) { _twZoom = 0.15; _twApplyZoom(); return; }

  const wrap = document.getElementById('tw-canvas-wrap');
  if (!wrap) return;

  const minX = Math.min(...nodes.map(n => n.x));
  const minY = Math.min(...nodes.map(n => n.y));
  const maxX = Math.max(...nodes.map(n => n.x + (n.w || 64)));
  const maxY = Math.max(...nodes.map(n => n.y + (n.h || 64)));

  const pad  = 60;
  const cw   = maxX - minX + pad * 2;
  const ch   = maxY - minY + pad * 2;

  const zx = wrap.clientWidth  / cw;
  const zy = wrap.clientHeight / ch;
  _twZoom = Math.round(Math.max(0.05, Math.min(2, Math.min(zx, zy))) * 100) / 100;
  _twApplyZoom();

  // Center on the bounding box
  const centerX = (minX - pad + cw / 2) * _twZoom;
  const centerY = (minY - pad + ch / 2) * _twZoom;
  wrap.scrollLeft = centerX - wrap.clientWidth  / 2;
  wrap.scrollTop  = centerY - wrap.clientHeight / 2;
}

function _twApplyZoom() {
  const canvas = document.getElementById('tw-canvas');
  const spacer = document.getElementById('tw-scroll-spacer');
  const lbl    = document.getElementById('tw-zoom-lbl');
  if (canvas) canvas.style.transform = `scale(${_twZoom})`;
  if (spacer) { spacer.style.width = TW_CANVAS_W * _twZoom + 'px'; spacer.style.height = TW_CANVAS_H * _twZoom + 'px'; }
  if (lbl)    lbl.textContent = Math.round(_twZoom * 100) + '%';
}

/* ── Events (pan + scroll-zoom in adjust mode) ───────────────────────────────── */
function _twBindEvents() {
  const wrap = document.getElementById('tw-canvas-wrap');
  if (!wrap) return;

  wrap.addEventListener('pointerdown', e => {
    if (!_twAdjust) return;
    if (e.button !== 0) return;
    _twPan = { startX: e.clientX, startY: e.clientY,
               scrollLeft: wrap.scrollLeft, scrollTop: wrap.scrollTop };
    wrap.style.cursor = 'grabbing';
    wrap.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  wrap.addEventListener('pointermove', e => {
    if (!_twPan) return;
    wrap.scrollLeft = _twPan.scrollLeft - (e.clientX - _twPan.startX);
    wrap.scrollTop  = _twPan.scrollTop  - (e.clientY - _twPan.startY);
  });

  wrap.addEventListener('pointerup', () => {
    if (_twPan) { _twPan = null; wrap.style.cursor = ''; }
  });

  wrap.addEventListener('wheel', e => {
    if (!_twAdjust) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    twZoomBy(delta);
  }, { passive: false });
}

/* ── Render ──────────────────────────────────────────────────────────────────── */
function _twRenderAll() {
  const canvas = document.getElementById('tw-canvas');
  if (!canvas) return;

  // Remove old nodes/texts (keep svg)
  canvas.querySelectorAll('.tw-node, .tw-text').forEach(el => el.remove());

  // Render nodes
  for (const n of Object.values(_twData.nodes || {})) {
    const dir = n.dir === 'topo' ? 'topology/' : '';
    const src = ICONS_PATH + dir + n.icon;
    const el  = document.createElement('div');
    el.className  = 'tw-node';
    el.style.left = n.x + 'px';
    el.style.top  = n.y + 'px';
    el.innerHTML  = `
      <img src="${src}" style="width:${n.w}px;height:${n.h}px;display:block;object-fit:contain"
           loading="lazy" draggable="false" onerror="this.style.opacity='0.2'">
      ${n.labelVis !== false ? `<div class="tw-node-label" style="color:${n.labelColor||''}">${htmlEsc(n.label||'')}</div>` : ''}`;
    canvas.appendChild(el);
  }

  // Render text boxes
  for (const t of Object.values(_twData.texts || {})) {
    const el = document.createElement('div');
    el.className  = 'tw-text';
    el.style.left     = t.x + 'px';
    el.style.top      = t.y + 'px';
    el.style.fontSize = (t.fontSize || 14) + 'px';
    el.style.color    = t.color || 'var(--text-muted)';
    el.textContent    = t.text || '';
    canvas.appendChild(el);
  }

  // Render connections
  _twRenderConnections();
}

function _twRenderConnections() {
  const g = document.getElementById('tw-conns-g');
  if (!g) return;
  g.innerHTML = '';

  for (const c of Object.values(_twData.connections || {})) {
    const a = _twData.nodes[c.from], b = _twData.nodes[c.to];
    if (!a || !b) continue;

    const acX = a.x + a.w / 2, acY = a.y + a.h / 2;
    const bcX = b.x + b.w / 2, bcY = b.y + b.h / 2;
    const dx  = bcX - acX, dy = bcY - acY;
    const len = Math.hypot(dx, dy);
    if (len < 2) continue;

    const nx = dx / len, ny = dy / len;
    const ra = Math.min(a.w, a.h) / 2 + 4;
    const rb = Math.min(b.w, b.h) / 2 + 4;
    const x1 = acX + nx * ra, y1 = acY + ny * ra;
    const x2 = bcX - nx * rb, y2 = bcY - ny * rb;

    const color = c.color || '#484f58';
    const dash  = c.style === 'dashed' ? '8 4' : c.style === 'dotted' ? '2 4' : 'none';

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', dash);
    line.setAttribute('marker-end', 'url(#tw-arrow)');
    g.appendChild(line);

    if (c.label) {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', mx); txt.setAttribute('y', my - 5);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('fill', color);
      txt.setAttribute('font-size', '11');
      txt.setAttribute('font-family', 'var(--mono)');
      txt.textContent = c.label;
      g.appendChild(txt);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   CHAT ASSISTANT  (placeholder — LLM wiring TBD)
═══════════════════════════════════════════════════════════════════════════════ */

function buildChatHTML() {
  return `
    <div id="chat-bubble" title="AI Assistant" onclick="chatToggle()" style="display:none">
      <span class="chat-bubble-icon">✦</span>
    </div>
    <div id="chat-window" style="display:none">
      <div class="chat-header">
        <span class="chat-title">✦ AI Assistant</span>
        <div class="chat-header-actions">
          <button class="chat-hdr-btn" title="Clear conversation" onclick="chatClear()">↺</button>
          <button class="chat-hdr-btn" title="Close" onclick="chatClose()">✕</button>
        </div>
      </div>
      <div class="chat-messages" id="chat-messages">
        <div class="chat-welcome">
          <div class="chat-welcome-icon">✦</div>
          <div class="chat-welcome-text">AI Assistant is not yet configured. Enable and connect an LLM provider in <strong>Settings → System &amp; Integrations → AI Assistant</strong>.</div>
        </div>
      </div>
      <div class="chat-input-bar">
        <textarea class="chat-textarea" id="chat-input" rows="1"
                  placeholder="Message assistant…"
                  onkeydown="chatKeyDown(event)"
                  oninput="chatAutoResize(this)"></textarea>
        <button class="chat-send-btn" id="chat-send-btn" onclick="chatSend()" title="Send">▲</button>
      </div>
    </div>`;
}

async function initChatBubble() {
  try {
    const res  = await fetch(ROOT + 'api/settings.php');
    const vals = await res.json();
    const enabled = vals.chat_enabled === '1';
    const bubble  = document.getElementById('chat-bubble');
    const win     = document.getElementById('chat-window');
    if (bubble) bubble.style.display = enabled ? '' : 'none';
    if (win) win.style.display = 'none';
    if (enabled) {
      // Restore session history
      try {
        const saved = sessionStorage.getItem('chat_history');
        if (saved) {
          _chatHistory = JSON.parse(saved);
          chatRestoreMessages();
        }
      } catch { _chatHistory = []; }
      // Restore open/closed state
      if (sessionStorage.getItem('chat_open') === '1' && bubble && win) {
        bubble.style.display = 'none';
        win.style.display    = '';
      }
      await chatContextRegenerate();
      chatContextUpdateIndicator();
    }
  } catch { /* non-fatal */ }
}

function chatRestoreMessages() {
  const msgs = document.getElementById('chat-messages');
  if (!msgs || !_chatHistory.length) return;
  msgs.innerHTML = '';
  for (const m of _chatHistory) {
    const el = document.createElement('div');
    if (m.role === 'user') {
      el.className = 'chat-msg chat-msg-user';
      el.textContent = m.content;
    } else {
      el.className = 'chat-msg chat-msg-bot';
      el.innerHTML = `<span class="chat-msg-icon">✦</span><span class="chat-msg-text">${chatFormatMarkdown(m.content)}</span>`;
    }
    msgs.appendChild(el);
  }
  msgs.scrollTop = msgs.scrollHeight;
}

function chatToggle() {
  const bubble = document.getElementById('chat-bubble');
  const win    = document.getElementById('chat-window');
  if (!bubble || !win) return;
  bubble.style.display = 'none';
  win.style.display    = '';
  sessionStorage.setItem('chat_open', '1');
  setTimeout(() => document.getElementById('chat-input')?.focus(), 50);
}

function chatClose() {
  const bubble = document.getElementById('chat-bubble');
  const win    = document.getElementById('chat-window');
  if (win)    win.style.display    = 'none';
  if (bubble) bubble.style.display = '';
  sessionStorage.removeItem('chat_open');
}

function chatClear() {
  // Show inline confirmation inside the chat window
  const win = document.getElementById('chat-window');
  if (!win || win.querySelector('.chat-confirm-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'chat-confirm-overlay';
  overlay.innerHTML = `
    <div class="chat-confirm-box">
      <div class="chat-confirm-msg">Clear conversation?</div>
      <div class="chat-confirm-actions">
        <button class="btn-secondary" onclick="this.closest('.chat-confirm-overlay').remove()">Cancel</button>
        <button class="btn-danger"    onclick="chatClearConfirmed()">Clear</button>
      </div>
    </div>`;
  win.appendChild(overlay);
}

function chatClearConfirmed() {
  document.querySelector('.chat-confirm-overlay')?.remove();
  _chatHistory = [];
  sessionStorage.removeItem('chat_history');
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  msgs.innerHTML = `
    <div class="chat-welcome">
      <div class="chat-welcome-icon">✦</div>
      <div class="chat-welcome-text">Conversation cleared.</div>
    </div>`;
}

function chatKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatSend();
  }
}

function chatAutoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

/* ─── Chat context helpers ──────────────────────────────────────────────────── */

async function chatContextLoad() {
  try {
    const res = await fetch(ROOT + 'api/context.php');
    if (!res.ok) return;
    const data = await res.json();

    const guide   = data.guide          ?? {};
    const infra   = data.infrastructure ?? {};
    const mn      = data.machine_notes  ?? {};

    CHAT_CONTEXT_TS = infra.generated_at ?? null;

    // Assemble the full system prompt from the three segments
    const parts = [];
    if (guide.content)   parts.push('## Application Guide\n\n' + guide.content.trim());
    if (infra.content)   parts.push('## Infrastructure\n\n'    + infra.content.trim());
    if (mn.content)      parts.push('## Per-Machine Notes\n\n' + mn.content.trim());

    CHAT_CONTEXT = parts.length ? parts.join('\n\n---\n\n') : null;
  } catch { /* non-fatal */ }
}

async function chatContextRegenerate() {
  const btn = document.getElementById('chat-ctx-btn');
  if (btn) btn.classList.add('chat-ctx-spinning');
  try {
    const res = await fetch(ROOT + 'api/context.php?action=regenerate', { method: 'POST' });
    if (!res.ok) { toast('Context regen failed', 'err'); return; }
    const data = await res.json();
    await chatContextLoad();
    chatContextUpdateIndicator();
  } catch { toast('Context regen failed', 'err'); }
  finally {
    if (btn) btn.classList.remove('chat-ctx-spinning');
  }
}

function chatContextUpdateIndicator() {
  const el = document.getElementById('chat-ctx-ts');
  if (!el) return;
  if (!CHAT_CONTEXT_TS) { el.textContent = 'no context'; return; }
  const d     = new Date(CHAT_CONTEXT_TS * 1000);
  const hh    = String(d.getHours()).padStart(2, '0');
  const mm    = String(d.getMinutes()).padStart(2, '0');
  const today = new Date();
  el.textContent = d.toDateString() === today.toDateString()
    ? `ctx ${hh}:${mm}`
    : `ctx ${d.getMonth()+1}/${d.getDate()} ${hh}:${mm}`;
}


async function chatSend() {
  const input = document.getElementById('chat-input');
  const msgs  = document.getElementById('chat-messages');
  const send  = document.getElementById('chat-send-btn');
  if (!input || !msgs) return;
  const text = input.value.trim();
  if (!text) return;

  msgs.querySelector('.chat-welcome')?.remove();

  // User bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg chat-msg-user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);
  _chatHistory.push({ role: 'user', content: text });

  input.value = '';
  input.style.height = 'auto';
  if (send) send.disabled = true;
  msgs.scrollTop = msgs.scrollHeight;

  // Bot bubble with loading dots
  const botMsg = document.createElement('div');
  botMsg.className = 'chat-msg chat-msg-bot';
  botMsg.innerHTML = `<span class="chat-msg-icon">✦</span><span class="chat-msg-text"><span class="chat-loading-dots"><span></span><span></span><span></span></span></span>`;
  msgs.appendChild(botMsg);
  msgs.scrollTop = msgs.scrollHeight;
  const textEl = botMsg.querySelector('.chat-msg-text');

  try {
    const system = CHAT_CONTEXT
      ? `You are a helpful assistant for a homelab. Use the following context about the homelab to answer questions accurately.\n\n---\n\n${CHAT_CONTEXT}\n\n---`
      : 'You are a helpful assistant for a homelab.';

    const res  = await fetch(ROOT + 'api/chat.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        message: text,
        history: _chatHistory.slice(0, -1),  // exclude current user msg
        system,
      }),
    });
    const data = await res.json();

    if (data.error) {
      textEl.innerHTML = `<span class="chat-msg-err">${htmlEsc(data.error)}</span>`;
      _chatHistory.pop(); // remove failed user msg
    } else {
      textEl.innerHTML = chatFormatMarkdown(data.reply);
      _chatHistory.push({ role: 'assistant', content: data.reply });
    }
  } catch (e) {
    textEl.innerHTML = `<span class="chat-msg-err">Request failed: ${htmlEsc(e.message)}</span>`;
    _chatHistory.pop();
  }

  sessionStorage.setItem('chat_history', JSON.stringify(_chatHistory));
  if (send) send.disabled = false;
  msgs.scrollTop = msgs.scrollHeight;
}

/** Minimal markdown → HTML: fenced code, inline code, bold, italic, bullets, newlines */
function chatFormatMarkdown(text) {
  let s = htmlEsc(text);
  // Fenced code blocks
  s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre class="chat-code-block">$1</pre>');
  // Inline code
  s = s.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
  // Bold
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Bullet lines
  s = s.replace(/^- (.+)$/gm, '<li>$1</li>');
  s = s.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  // Newlines → <br> (outside pre blocks — simple approach)
  s = s.replace(/\n/g, '<br>');
  return s;
}

const CLAUDE_MODELS = [
  { id: 'claude-opus-4-6',           label: 'Claude Opus 4.6' },
  { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4.6' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
  { id: 'claude-opus-4-5-20250929',  label: 'Claude Opus 4.5' },
  { id: 'claude-sonnet-4-5-20250929',label: 'Claude Sonnet 4.5' },
  { id: 'claude-opus-4-20250514',    label: 'Claude Opus 4' },
  { id: 'claude-sonnet-4-20250514',  label: 'Claude Sonnet 4' },
];

const OPENAI_MODELS = [
  { id: 'gpt-4o',          label: 'GPT-4o' },
  { id: 'gpt-4o-mini',     label: 'GPT-4o mini' },
  { id: 'gpt-4.1',         label: 'GPT-4.1' },
  { id: 'gpt-4.1-mini',    label: 'GPT-4.1 mini' },
  { id: 'gpt-4.1-nano',    label: 'GPT-4.1 nano' },
  { id: 'gpt-4.5-preview', label: 'GPT-4.5 preview' },
  { id: 'gpt-4-turbo',     label: 'GPT-4 Turbo' },
  { id: 'o4-mini',         label: 'o4 mini' },
  { id: 'o3',              label: 'o3' },
  { id: 'o3-mini',         label: 'o3 mini' },
  { id: 'o1',              label: 'o1' },
  { id: 'o1-mini',         label: 'o1 mini' },
  { id: 'gpt-3.5-turbo',   label: 'GPT-3.5 Turbo (legacy)' },
];

/** Provider show/hide logic for settings page */
function chatProviderChange(val) {
  const urlRow = document.getElementById('chat-url-row');
  const keyRow = document.getElementById('chat-key-row');
  if (!urlRow || !keyRow) return;
  const needsUrl = val === 'ollama' || val === 'custom';
  const needsKey = val === 'openai' || val === 'claude' || val === 'custom';
  urlRow.style.display = needsUrl ? '' : 'none';
  keyRow.style.display = needsKey ? '' : 'none';
  const urlInput = document.getElementById('set-chat-url');
  if (urlInput) urlInput.placeholder = val === 'ollama' ? 'e.g. http://192.168.1.66:11434' : 'e.g. http://my-llm-server/v1';
  _chatSetModelField(val);
}

function _chatSetModelField(provider) {
  const ctrl    = document.getElementById('chat-model-control');
  if (!ctrl) return;
  const current = document.getElementById('set-chat-model')?.value ?? '';

  if (provider === 'claude') {
    ctrl.innerHTML = _chatModelSelect(CLAUDE_MODELS, current || 'claude-sonnet-4-6');
  } else if (provider === 'openai') {
    ctrl.innerHTML = _chatModelSelect(OPENAI_MODELS, current || 'gpt-4o');
  } else if (provider === 'ollama') {
    ctrl.innerHTML = `
      <select class="form-select settings-select" id="set-chat-model" style="flex:1">
        ${current ? `<option value="${esc(current)}" selected>${esc(current)}</option>` : '<option value="">— fetch models —</option>'}
      </select>
      <button class="btn-secondary" style="padding:5px 10px;font-size:12px" onclick="chatFetchOllamaModels()" title="Fetch models from Ollama">⟳</button>`;
  } else {
    ctrl.innerHTML = `<input type="text" class="form-input settings-text-input" id="set-chat-model"
      placeholder="e.g. llama3.1:8b, gpt-4o, claude-sonnet-4-6" value="${esc(current)}">`;
  }
}

function _chatModelSelect(list, current) {
  const opts = list.map(m =>
    `<option value="${m.id}"${m.id === current ? ' selected' : ''}>${m.label}</option>`
  ).join('');
  return `<select class="form-select settings-select" id="set-chat-model">${opts}</select>`;
}

async function chatFetchOllamaModels() {
  const url = document.getElementById('set-chat-url')?.value?.trim();
  if (!url) { toast('Enter the Ollama base URL first', 'err'); return; }
  const btn = document.querySelector('#chat-model-control button');
  if (btn) btn.textContent = '…';
  try {
    const data = await apiFetch(`api/chat.php?action=ollama_models&url=${encodeURIComponent(url)}`);
    if (data.error) { toast('Ollama: ' + data.error, 'err'); return; }
    const current = document.getElementById('set-chat-model')?.value ?? '';
    const ctrl    = document.getElementById('chat-model-control');
    if (!ctrl) return;
    const opts = data.models.map(m =>
      `<option value="${esc(m)}"${m === current ? ' selected' : ''}>${esc(m)}</option>`
    ).join('');
    ctrl.innerHTML = `
      <select class="form-select settings-select" id="set-chat-model" style="flex:1">
        ${opts || '<option value="">No models found</option>'}
      </select>
      <button class="btn-secondary" style="padding:5px 10px;font-size:12px" onclick="chatFetchOllamaModels()" title="Refresh">⟳</button>`;
    toast(`${data.models.length} model${data.models.length !== 1 ? 's' : ''} loaded`);
  } catch (e) {
    toast('Failed to fetch models', 'err');
  }
  if (btn) btn.textContent = '⟳';
}

/** Build the API key part of the save payload based on current provider */
function chatApiKeyPayload() {
  const provider = document.getElementById('set-chat-provider')?.value ?? '';
  const key      = document.getElementById('set-chat-api-key')?.value ?? '';
  if (!key) return {};
  if (provider === 'openai' || provider === 'custom') return { chat_api_key_openai: key };
  if (provider === 'claude')                          return { chat_api_key_claude:  key };
  return {};
}
