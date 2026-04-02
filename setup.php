<?php
session_start();
require_once __DIR__ . '/api/db.php';
$db   = db();
$done = $db->query("SELECT value FROM app_settings WHERE key='setup_complete'")->fetchColumn();
if ($done === '1') {
    header('Location: /dashboard3/login.php');
    exit;
}
$timezones = DateTimeZone::listIdentifiers();
$tzJson    = json_encode($timezones);
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Setup — Homelab</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      color: #c9d1d9;
      background:
        radial-gradient(ellipse at 15% 8%,  rgba(24,48,130,0.45) 0%, transparent 52%),
        radial-gradient(ellipse at 85% 90%, rgba(14,8,60,0.55)   0%, transparent 50%),
        radial-gradient(ellipse at 65% 25%, rgba(6,36,80,0.30)   0%, transparent 46%),
        radial-gradient(ellipse at 35% 78%, rgba(4,22,55,0.28)   0%, transparent 42%),
        #05090f;
      padding: 32px 16px;
    }

    /* ── Card ─────────────────────────────────────────────── */
    .card {
      width: 100%;
      max-width: 540px;
      background: rgba(12, 18, 35, 0.72);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 20px;
      backdrop-filter: blur(32px) saturate(1.4);
      -webkit-backdrop-filter: blur(32px) saturate(1.4);
      box-shadow:
        0 2px 0 rgba(255,255,255,0.06) inset,
        0 24px 64px rgba(0,0,0,0.6),
        0 0 0 1px rgba(255,255,255,0.03);
      overflow: visible;
      position: relative;
    }

    /* ── Welcome ──────────────────────────────────────────── */
    .welcome-wrap {
      padding: 52px 40px 36px;
      text-align: center;
    }
    .welcome-icon {
      width: 56px; height: 56px;
      margin: 0 auto 24px;
      border-radius: 14px;
      background: linear-gradient(145deg, rgba(88,166,255,0.18) 0%, rgba(63,185,80,0.10) 100%);
      border: 1px solid rgba(88,166,255,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      box-shadow: 0 0 28px rgba(88,166,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08);
    }
    .welcome-title {
      font-size: 30px;
      font-weight: 700;
      color: #f0f6fc;
      letter-spacing: -0.6px;
      margin-bottom: 12px;
    }
    .welcome-desc {
      font-size: 14px;
      color: #6e7681;
      line-height: 1.7;
      max-width: 380px;
      margin: 0 auto 40px;
    }
    .welcome-footer {
      padding: 0 40px 40px;
      display: flex;
      justify-content: center;
    }

    /* ── Wizard step header ───────────────────────────────── */
    .wiz-header {
      padding: 28px 40px 0;
    }
    .wiz-meta {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .wiz-counter {
      font-size: 11px;
      font-weight: 600;
      color: #484f58;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .wiz-step-name {
      font-size: 11px;
      font-weight: 600;
      color: #58a6ff;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .wiz-track {
      display: flex;
      gap: 4px;
      height: 3px;
    }
    .wiz-seg {
      flex: 1;
      height: 100%;
      border-radius: 2px;
      background: rgba(255,255,255,0.07);
      transition: background 0.35s, box-shadow 0.35s;
    }
    .wiz-seg.done   { background: rgba(63,185,80,0.5); }
    .wiz-seg.active { background: #58a6ff; box-shadow: 0 0 6px rgba(88,166,255,0.5); }

    /* ── Card body ────────────────────────────────────────── */
    .card-body {
      padding: 24px 40px 0;
    }

    .step-panel { display: none; }
    .step-panel.active { display: block; }

    .step-title {
      font-size: 19px;
      font-weight: 700;
      color: #f0f6fc;
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }
    .step-desc {
      font-size: 13px;
      color: #6e7681;
      margin-bottom: 24px;
      line-height: 1.65;
    }
    .step-desc .req { color: #e57368; font-weight: 500; }

    /* ── Form elements ────────────────────────────────────── */
    .field { margin-bottom: 16px; }
    .field-row { display: flex; gap: 12px; }
    .field-row .field { flex: 1; }

    .field-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: #6e7681;
      margin-bottom: 7px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .field-sub {
      font-size: 11px;
      color: #373e47;
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
      margin-left: 4px;
    }

    input[type="password"],
    input[type="text"],
    input[type="url"],
    input[type="number"],
    select,
    .tz-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      color: #e6edf3;
      font-size: 13px;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      -webkit-appearance: none;
      font-family: inherit;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
    }
    input::placeholder { color: #373e47; }
    input:focus, select:focus, .tz-input:focus {
      border-color: rgba(88,166,255,0.45);
      box-shadow: 0 0 0 3px rgba(88,166,255,0.08), inset 0 1px 3px rgba(0,0,0,0.3);
    }
    select option { background: #0d1117; }

    /* ── Timezone dropdown ────────────────────────────────── */
    .tz-select { position: relative; }
    .tz-input { cursor: pointer; }
    .tz-list {
      position: absolute;
      top: calc(100% + 5px);
      left: 0; right: 0;
      background: #0b1120;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      max-height: 220px;
      overflow-y: auto;
      z-index: 9999;
      display: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.7);
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.08) transparent;
    }
    .tz-list.open { display: block; }
    .tz-option {
      padding: 8px 14px;
      font-size: 12px;
      color: #6e7681;
      cursor: pointer;
      transition: background .1s, color .1s;
    }
    .tz-option + .tz-option { border-top: 1px solid rgba(255,255,255,0.03); }
    .tz-option:hover    { background: rgba(88,166,255,0.09); color: #c9d1d9; }
    .tz-option.selected { color: #58a6ff; background: rgba(88,166,255,0.07); }

    /* ── Password strength ────────────────────────────────── */
    .pw-bar { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.06); margin-top: 8px; overflow: hidden; }
    .pw-bar-fill { height: 100%; border-radius: 2px; width: 0; transition: width .3s, background .3s; }
    .pw-hint { font-size: 11px; color: #373e47; margin-top: 5px; min-height: 15px; transition: color .3s; }

    /* ── Toggle ───────────────────────────────────────────── */
    .toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 11px 0;
      border-bottom: 1px solid rgba(255,255,255,0.045);
    }
    .toggle-row:last-child { border-bottom: none; }
    .toggle-lbl  { font-size: 13px; color: #c9d1d9; }
    .toggle-sub  { font-size: 11px; color: #484f58; margin-top: 2px; }
    .toggle {
      position: relative; width: 36px; height: 20px; flex-shrink: 0;
    }
    .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
    .toggle-track {
      position: absolute; inset: 0;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 10px; cursor: pointer;
      transition: background .2s, border-color .2s;
    }
    .toggle input:checked + .toggle-track { background: rgba(63,185,80,0.22); border-color: rgba(63,185,80,0.45); }
    .toggle-knob {
      position: absolute; top: 2px; left: 2px;
      width: 14px; height: 14px; border-radius: 50%;
      background: #484f58; transition: transform .2s, background .2s;
    }
    .toggle input:checked ~ .toggle-knob { transform: translateX(16px); background: #3fb950; }

    /* ── Segment tabs (integration / auth mode) ───────────── */
    .seg-tabs { display: flex; gap: 6px; margin-bottom: 20px; }
    .seg-tab {
      flex: 1; padding: 9px 8px;
      border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
      background: rgba(255,255,255,0.025); color: #6e7681;
      font-size: 12px; font-weight: 600; cursor: pointer; text-align: center;
      transition: all 0.15s; font-family: inherit;
    }
    .seg-tab:hover { border-color: rgba(255,255,255,0.14); color: #c9d1d9; }
    .seg-tab.active {
      border-color: rgba(88,166,255,0.38);
      background: rgba(88,166,255,0.09);
      color: #58a6ff;
    }

    .int-fields { display: none; }
    .int-fields.visible { display: block; }

    /* ── News source list ─────────────────────────────────── */
    .news-list {
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      overflow: hidden;
    }

    /* ── Confirm screen ───────────────────────────────────── */
    .confirm-wrap {
      padding: 32px 40px 0;
    }
    .confirm-title {
      font-size: 19px; font-weight: 700; color: #f0f6fc; margin-bottom: 6px; letter-spacing: -0.2px;
    }
    .confirm-desc {
      font-size: 13px; color: #6e7681; margin-bottom: 22px; line-height: 1.6;
    }
    .confirm-list {
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 11px;
      overflow: hidden;
    }
    .confirm-item {
      display: flex; align-items: baseline; gap: 14px;
      padding: 11px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.045);
    }
    .confirm-item:last-child { border-bottom: none; }
    .confirm-key {
      font-size: 11px; font-weight: 600; color: #373e47;
      text-transform: uppercase; letter-spacing: 0.4px;
      width: 84px; flex-shrink: 0;
    }
    .confirm-val { font-size: 12px; color: #c9d1d9; flex: 1; line-height: 1.5; }
    .ok   { color: #3fb950; font-weight: 600; }
    .skip { color: #373e47; }

    /* ── Footer ───────────────────────────────────────────── */
    .card-footer {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 40px 32px;
      margin-top: 12px;
    }
    .btn-row { display: flex; gap: 8px; }

    /* Buttons */
    .btn {
      padding: 9px 22px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
      font-family: inherit;
    }
    .btn:disabled { opacity: 0.38; cursor: not-allowed; }

    .btn-ghost {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.08);
      color: #6e7681;
    }
    .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #c9d1d9; border-color: rgba(255,255,255,0.12); }

    .btn-primary {
      background: rgba(88,166,255,0.14);
      border-color: rgba(88,166,255,0.32);
      color: #58a6ff;
    }
    .btn-primary:hover { background: rgba(88,166,255,0.22); border-color: rgba(88,166,255,0.5); }

    .btn-primary-lg {
      background: rgba(88,166,255,0.14);
      border-color: rgba(88,166,255,0.32);
      color: #58a6ff;
      padding: 11px 36px;
      font-size: 14px;
    }
    .btn-primary-lg:hover { background: rgba(88,166,255,0.22); border-color: rgba(88,166,255,0.5); }

    .btn-confirm {
      background: rgba(63,185,80,0.14);
      border-color: rgba(63,185,80,0.32);
      color: #3fb950;
    }
    .btn-confirm:hover { background: rgba(63,185,80,0.22); border-color: rgba(63,185,80,0.5); }

    .btn-danger-soft {
      background: rgba(255,255,255,0.03);
      border-color: rgba(248,81,73,0.18);
      color: #6e7681;
    }
    .btn-danger-soft:hover { background: rgba(248,81,73,0.08); border-color: rgba(248,81,73,0.32); color: #f85149; }

    /* ── Error banner ─────────────────────────────────────── */
    .err {
      margin: 0 40px 12px;
      padding: 10px 14px;
      background: rgba(248,81,73,0.09);
      border: 1px solid rgba(248,81,73,0.25);
      border-radius: 9px;
      color: #f85149; font-size: 12px;
      display: none;
    }
    .err.on { display: block; }

    /* ── Misc ─────────────────────────────────────────────── */
    .check-row {
      display: flex; align-items: center; gap: 9px;
      cursor: pointer; color: #6e7681; font-size: 12px;
      margin-bottom: 10px;
    }
    .check-row input { width: 14px; height: 14px; accent-color: #58a6ff; cursor: pointer; }

    .field-note { font-size: 11px; color: #373e47; margin-top: 5px; line-height: 1.5; }

    hr.divider {
      border: none; border-top: 1px solid rgba(255,255,255,0.06);
      margin: 18px 0 16px;
    }
  </style>
</head>
<body>

<div class="card" id="card">

  <!-- ══ WELCOME ══════════════════════════════════════════════ -->
  <div id="screen-welcome">
    <div class="welcome-wrap">
      <div class="welcome-icon">⬡</div>
      <div class="welcome-title">Homelab</div>
      <div class="welcome-desc">A self-hosted dashboard for keeping tabs on your home network, services, and machines. This wizard will walk you through the initial setup in a few quick steps.</div>
    </div>
    <div class="welcome-footer">
      <button class="btn btn-primary-lg" onclick="startSetup()">Get Started</button>
    </div>
  </div>

  <!-- ══ WIZARD ═══════════════════════════════════════════════ -->
  <div id="screen-wizard" style="display:none">
    <div class="wiz-header">
      <div class="wiz-meta">
        <span class="wiz-counter">Step <span id="wiz-num">1</span> of 7</span>
        <span class="wiz-step-name" id="wiz-name">Password</span>
      </div>
      <div class="wiz-track">
        <div class="wiz-seg" id="wseg-1"></div>
        <div class="wiz-seg" id="wseg-2"></div>
        <div class="wiz-seg" id="wseg-3"></div>
        <div class="wiz-seg" id="wseg-4"></div>
        <div class="wiz-seg" id="wseg-5"></div>
        <div class="wiz-seg" id="wseg-6"></div>
        <div class="wiz-seg" id="wseg-7"></div>
      </div>
    </div>

    <div class="card-body">

      <!-- Step 1: Password -->
      <div class="step-panel" id="step-1">
        <div class="step-title">Create your password</div>
        <div class="step-desc">Protects access to the dashboard. <span class="req">Required to continue.</span></div>
        <div class="field">
          <label class="field-label">Password</label>
          <input type="password" id="pw1" placeholder="At least 6 characters" autocomplete="new-password" oninput="checkPwStrength(this.value)">
          <div class="pw-bar"><div class="pw-bar-fill" id="pw-bar-fill"></div></div>
          <div class="pw-hint" id="pw-hint">Choose a strong password</div>
        </div>
        <div class="field">
          <label class="field-label">Confirm password</label>
          <input type="password" id="pw2" placeholder="Repeat password" autocomplete="new-password">
        </div>
      </div>

      <!-- Step 2: System -->
      <div class="step-panel" id="step-2">
        <div class="step-title">System settings</div>
        <div class="step-desc">Used for the clock, weather widget, and time-related features. All optional.</div>
        <div class="field">
          <label class="field-label">Timezone</label>
          <div class="tz-select" id="tz-select">
            <input type="text" class="tz-input" id="tz-search" placeholder="Search timezones..." autocomplete="off" readonly
              onclick="tzOpen()" oninput="tzFilter(this.value)" onfocus="tzOpen()">
            <input type="hidden" id="s2-timezone" value="America/New_York">
            <div class="tz-list" id="tz-list"></div>
          </div>
        </div>
        <div class="field">
          <label class="field-label">ZIP code <span class="field-sub">for weather widget</span></label>
          <input type="text" id="s2-zipcode" placeholder="e.g. 10001" maxlength="10">
        </div>
      </div>

      <!-- Step 3: Calendar -->
      <div class="step-panel" id="step-3">
        <div class="step-title">Calendar</div>
        <div class="step-desc">Paste a Google Calendar ICS URL to show upcoming events on your home page.</div>
        <div class="field">
          <label class="field-label">ICS URL</label>
          <input type="url" id="s3-cal-ics" placeholder="https://calendar.google.com/calendar/ical/.../basic.ics">
          <div class="field-note">Google Calendar: Settings > your calendar > Integrate calendar > Secret address in iCal format</div>
        </div>
        <div class="field">
          <label class="field-label">Look-ahead <span class="field-sub">days</span></label>
          <input type="number" id="s3-cal-days" placeholder="30" value="30" min="1" max="90" style="max-width:110px">
        </div>
      </div>

      <!-- Step 4: SMTP -->
      <div class="step-panel" id="step-4">
        <div class="step-title">Email</div>
        <div class="step-desc">Set up outbound email for alerts and notifications. Leave blank to skip.</div>
        <div class="field-row">
          <div class="field" style="flex:3">
            <label class="field-label">SMTP host</label>
            <input type="text" id="s4-smtp-host" placeholder="smtp.gmail.com">
          </div>
          <div class="field" style="flex:1">
            <label class="field-label">Port</label>
            <input type="number" id="s4-smtp-port" placeholder="587" value="587" min="1" max="65535">
          </div>
        </div>
        <div class="field">
          <label class="field-label">Username</label>
          <input type="text" id="s4-smtp-user" placeholder="you@example.com" autocomplete="off">
        </div>
        <div class="field">
          <label class="field-label">Password</label>
          <input type="password" id="s4-smtp-pass" placeholder="App password" autocomplete="new-password">
        </div>
        <div class="field-row">
          <div class="field">
            <label class="field-label">From address</label>
            <input type="text" id="s4-smtp-from" placeholder="homelab@example.com">
          </div>
          <div class="field">
            <label class="field-label">Encryption</label>
            <select id="s4-smtp-tls">
              <option value="tls">TLS / STARTTLS</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 5: AI -->
      <div class="step-panel" id="step-5">
        <div class="step-title">AI Assistant</div>
        <div class="step-desc">Connect an AI provider to enable the chat assistant. Leaving this off means AI chat will be disabled until you enable it in Settings.</div>
        <div class="field" style="margin-bottom:20px">
          <div class="toggle-row" style="border:none;padding-bottom:0">
            <div>
              <div class="toggle-lbl" style="font-size:14px;font-weight:600;color:#e6edf3">Enable AI chat</div>
              <div class="toggle-sub">Show AI assistant on your dashboard</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="s5-ai-enabled" onchange="onAiToggle(this.checked)">
              <div class="toggle-track"></div>
              <div class="toggle-knob"></div>
            </label>
          </div>
        </div>
        <div id="ai-config-fields" style="display:none">
          <hr class="divider">
          <div class="field">
            <label class="field-label">Provider</label>
            <select id="s5-ai-provider" onchange="onAiProviderChange(this.value)">
              <option value="">Select a provider</option>
              <option value="claude">Anthropic Claude</option>
              <option value="openai">OpenAI</option>
              <option value="ollama">Ollama (local)</option>
              <option value="custom">Custom endpoint</option>
            </select>
          </div>
          <div id="ai-url-field" style="display:none">
            <div class="field">
              <label class="field-label">Endpoint URL</label>
              <input type="url" id="s5-ai-url" placeholder="http://192.168.1.66:11434">
            </div>
          </div>
          <div id="ai-apikey-field" style="display:none">
            <div class="field">
              <label class="field-label">API key</label>
              <input type="password" id="s5-ai-apikey" placeholder="sk-..." autocomplete="new-password">
            </div>
          </div>
          <div class="field">
            <label class="field-label">Model <span class="field-sub">optional</span></label>
            <input type="text" id="s5-ai-model" placeholder="e.g. claude-sonnet-4-6, gpt-4o, llama3.1:8b">
          </div>
        </div>
      </div>

      <!-- Step 6: Network -->
      <div class="step-panel" id="step-6">
        <div class="step-title">Network</div>
        <div class="step-desc">Connect to your router or controller to pull live stats.</div>
        <div class="seg-tabs">
          <button class="seg-tab active" onclick="selectIntegration('none', this)">None</button>
          <button class="seg-tab" onclick="selectIntegration('unifi', this)">UniFi</button>
          <button class="seg-tab" onclick="selectIntegration('opnsense', this)">OPNsense</button>
        </div>
        <div class="int-fields" id="int-unifi">
          <div class="field">
            <label class="field-label">Controller URL</label>
            <input type="url" id="s6-unifi-host" placeholder="https://192.168.1.1">
          </div>
          <div class="field">
            <label class="field-label">Auth method</label>
            <div class="seg-tabs" style="margin-bottom:14px">
              <button class="seg-tab active" onclick="selectAuthMode('apikey', this)">API key <span style="font-weight:400;opacity:.55">(recommended)</span></button>
              <button class="seg-tab" onclick="selectAuthMode('credentials', this)">Username / password</button>
            </div>
          </div>
          <div id="unifi-apikey-fields">
            <div class="field">
              <label class="field-label">API key</label>
              <input type="password" id="s6-unifi-apikey" placeholder="Your UniFi API key">
            </div>
          </div>
          <div id="unifi-cred-fields" style="display:none">
            <div class="field-row">
              <div class="field">
                <label class="field-label">Username</label>
                <input type="text" id="s6-unifi-user" placeholder="admin">
              </div>
              <div class="field">
                <label class="field-label">Password</label>
                <input type="password" id="s6-unifi-pass">
              </div>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label">Site</label>
              <input type="text" id="s6-unifi-site" placeholder="default" value="default">
            </div>
            <div class="field" style="flex:0 0 auto;padding-top:22px">
              <label class="check-row" style="margin-bottom:0">
                <input type="checkbox" id="s6-unifi-ssl"> Verify SSL
              </label>
            </div>
          </div>
        </div>
        <div class="int-fields" id="int-opnsense">
          <div class="field">
            <label class="field-label">OPNsense URL</label>
            <input type="url" id="s6-opn-host" placeholder="https://192.168.1.1">
          </div>
          <div class="field-row">
            <div class="field">
              <label class="field-label">API key</label>
              <input type="text" id="s6-opn-key">
            </div>
            <div class="field">
              <label class="field-label">API secret</label>
              <input type="password" id="s6-opn-secret">
            </div>
          </div>
          <label class="check-row" style="margin-top:4px">
            <input type="checkbox" id="s6-opn-ssl"> Verify SSL certificate
          </label>
        </div>
      </div>

      <!-- Step 7: News -->
      <div class="step-panel" id="step-7">
        <div class="step-title">News feeds</div>
        <div class="step-desc">Turn on the news widget and pick which sources show up on your home page.</div>
        <div class="field" style="margin-bottom:20px">
          <div class="toggle-row" style="border:none;padding-bottom:0">
            <div>
              <div class="toggle-lbl" style="font-size:14px;font-weight:600;color:#e6edf3">Enable news widget</div>
              <div class="toggle-sub">Show headlines on the home page</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="s7-news-enabled">
              <div class="toggle-track"></div>
              <div class="toggle-knob"></div>
            </label>
          </div>
        </div>
        <div class="news-list" id="news-source-list"></div>
      </div>

    </div><!-- /card-body -->

    <div class="err on" id="err-banner" style="display:none"></div>

    <div class="card-footer">
      <div>
        <button class="btn btn-ghost" id="btn-back" style="display:none" onclick="goBack()">Back</button>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-next" onclick="goNext()">Next</button>
        <button class="btn btn-confirm" id="btn-finish" style="display:none" onclick="goToConfirm()">Review</button>
      </div>
    </div>
  </div><!-- /screen-wizard -->

  <!-- ══ CONFIRM ══════════════════════════════════════════════ -->
  <div id="screen-confirm" style="display:none">
    <div class="confirm-wrap">
      <div class="confirm-title">Review your setup</div>
      <div class="confirm-desc">Double-check everything below, then confirm to finish. Cancel starts over.</div>
      <div class="confirm-list" id="confirm-rows"></div>
    </div>
    <div class="err" id="err-banner-confirm"></div>
    <div class="card-footer">
      <button class="btn btn-danger-soft" onclick="cancelToWelcome()">Cancel</button>
      <button class="btn btn-confirm" id="btn-confirm" onclick="finishSetup()">Confirm</button>
    </div>
  </div>

</div><!-- /card -->

<script>
const TIMEZONES   = <?= $tzJson ?>;
const STEP_NAMES  = ['', 'Password', 'System', 'Calendar', 'Email', 'AI', 'Network', 'News'];
const TOTAL_STEPS = 7;
let currentStep   = 1;
let integration   = 'none';
let unifiAuthMode = 'apikey';

const DEFAULT_NEWS_SOURCES = [
  { id:'bbc',      name:'BBC News',     url:'https://feeds.bbci.co.uk/news/rss.xml',        enabled:true  },
  { id:'reuters',  name:'Reuters',      url:'https://feeds.reuters.com/reuters/topNews',     enabled:true  },
  { id:'apnews',   name:'AP News',      url:'https://rsshub.app/apnews/topics/apf-topnews', enabled:false },
  { id:'npr',      name:'NPR',          url:'https://feeds.npr.org/1001/rss.xml',           enabled:false },
  { id:'guardian', name:'The Guardian', url:'https://www.theguardian.com/world/rss',        enabled:false },
  { id:'hn',       name:'Hacker News',  url:'https://hnrss.org/frontpage',                 enabled:false },
];
let newsSources = JSON.parse(JSON.stringify(DEFAULT_NEWS_SOURCES));

// ── Screen transitions ─────────────────────────────────
function startSetup() {
  document.getElementById('screen-welcome').style.display = 'none';
  document.getElementById('screen-wizard').style.display  = 'block';
  currentStep = 1;
  updateUI();
}

function cancelToWelcome() {
  document.getElementById('screen-confirm').style.display = 'none';
  document.getElementById('screen-welcome').style.display = 'block';
}

// ── Timezone dropdown ──────────────────────────────────
let tzSelected = 'America/New_York';
let tzIsOpen   = false;

function tzBuild(filter) {
  const lower = (filter || '').toLowerCase();
  const shown = filter ? TIMEZONES.filter(z => z.toLowerCase().includes(lower)) : TIMEZONES;
  document.getElementById('tz-list').innerHTML = shown.slice(0, 200).map(z =>
    `<div class="tz-option${z === tzSelected ? ' selected' : ''}" onclick="tzSelect('${z.replace(/'/g,"\\'")}',true)">${z}</div>`
  ).join('');
}

function tzOpen() {
  const inp = document.getElementById('tz-search');
  inp.readOnly = false;
  inp.select();
  document.getElementById('tz-list').classList.add('open');
  tzBuild('');
  tzIsOpen = true;
  setTimeout(() => {
    const sel = document.querySelector('#tz-list .tz-option.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }, 40);
}

function tzClose() {
  document.getElementById('tz-list').classList.remove('open');
  const inp = document.getElementById('tz-search');
  inp.readOnly = true;
  inp.value = tzSelected;
  tzIsOpen = false;
}

function tzFilter(v) { tzBuild(v); }

function tzSelect(tz, close) {
  tzSelected = tz;
  document.getElementById('s2-timezone').value = tz;
  document.getElementById('tz-search').value   = tz;
  if (close) tzClose();
}

document.addEventListener('DOMContentLoaded', () => { tzSelect('America/New_York', false); tzBuild(''); });
document.addEventListener('click', e => {
  if (tzIsOpen && !document.getElementById('tz-select').contains(e.target)) tzClose();
});

// ── News sources ───────────────────────────────────────
function renderNewsSources() {
  document.getElementById('news-source-list').innerHTML = newsSources.map((s, i) => `
    <div class="toggle-row" style="padding:10px 14px">
      <div>
        <div class="toggle-lbl">${s.name}</div>
        <div class="toggle-sub" style="font-family:monospace;font-size:10px">${s.url}</div>
      </div>
      <label class="toggle">
        <input type="checkbox" ${s.enabled ? 'checked' : ''} onchange="newsSources[${i}].enabled=this.checked">
        <div class="toggle-track"></div>
        <div class="toggle-knob"></div>
      </label>
    </div>`).join('');
}

// ── Password strength ──────────────────────────────────
function checkPwStrength(pw) {
  const fill = document.getElementById('pw-bar-fill');
  const hint = document.getElementById('pw-hint');
  if (!pw) { fill.style.width = '0'; hint.textContent = 'Choose a strong password'; hint.style.color = '#373e47'; return; }
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const lvl = [
    { w:'20%', c:'#f85149', t:'Too short' },
    { w:'40%', c:'#d29922', t:'Weak' },
    { w:'60%', c:'#d29922', t:'Fair' },
    { w:'80%', c:'#3fb950', t:'Good' },
    { w:'100%',c:'#3fb950', t:'Strong' },
  ][Math.min(s, 4)];
  fill.style.width = lvl.w; fill.style.background = lvl.c;
  hint.textContent = lvl.t; hint.style.color = lvl.c;
}

// ── Integration / auth ─────────────────────────────────
function selectIntegration(type, btn) {
  integration = type;
  btn.closest('.seg-tabs').querySelectorAll('.seg-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.int-fields').forEach(f => f.classList.remove('visible'));
  if (type !== 'none') document.getElementById('int-' + type)?.classList.add('visible');
}

function selectAuthMode(mode, btn) {
  unifiAuthMode = mode;
  btn.closest('.seg-tabs').querySelectorAll('.seg-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('unifi-apikey-fields').style.display = mode === 'apikey'      ? 'block' : 'none';
  document.getElementById('unifi-cred-fields').style.display   = mode === 'credentials' ? 'block' : 'none';
}

// ── AI ─────────────────────────────────────────────────
function onAiToggle(checked) {
  document.getElementById('ai-config-fields').style.display = checked ? 'block' : 'none';
}
function onAiProviderChange(val) {
  document.getElementById('ai-apikey-field').style.display = (val === 'claude' || val === 'openai' || val === 'custom') ? 'block' : 'none';
  document.getElementById('ai-url-field').style.display    = (val === 'ollama' || val === 'custom')                    ? 'block' : 'none';
}

// ── Navigation ─────────────────────────────────────────
function updateUI() {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    document.getElementById('step-' + i).classList.toggle('active', i === currentStep);
    const seg = document.getElementById('wseg-' + i);
    seg.classList.remove('done', 'active');
    if (i < currentStep)  seg.classList.add('done');
    if (i === currentStep) seg.classList.add('active');
  }
  document.getElementById('wiz-num').textContent  = currentStep;
  document.getElementById('wiz-name').textContent = STEP_NAMES[currentStep] || '';
  document.getElementById('btn-back').style.display   = currentStep > 1 ? '' : 'none';
  document.getElementById('btn-next').style.display   = currentStep < TOTAL_STEPS ? '' : 'none';
  document.getElementById('btn-finish').style.display = currentStep === TOTAL_STEPS ? '' : 'none';
  const err = document.getElementById('err-banner');
  err.classList.remove('on'); err.style.display = 'none';
}

function goNext() {
  if (currentStep === 1 && !validateStep1()) return;
  if (currentStep < TOTAL_STEPS) { currentStep++; updateUI(); }
}
function goBack() {
  if (currentStep > 1) { currentStep--; updateUI(); }
  else cancelToWelcome();
}

function showErr(msg) {
  const el = document.getElementById('err-banner');
  el.textContent = msg;
  el.style.display = 'block';
  el.classList.add('on');
}

function validateStep1() {
  const pw1 = document.getElementById('pw1').value;
  const pw2 = document.getElementById('pw2').value;
  if (!pw1)          { showErr('Please enter a password.'); return false; }
  if (pw1.length < 6){ showErr('Password must be at least 6 characters.'); return false; }
  if (pw1 !== pw2)   { showErr('Passwords do not match.'); return false; }
  return true;
}

// ── Confirm screen ─────────────────────────────────────
function goToConfirm() {
  if (!validateStep1()) { currentStep = 1; updateUI(); return; }
  buildConfirm();
  document.getElementById('screen-wizard').style.display  = 'none';
  document.getElementById('screen-confirm').style.display = 'block';
}

function buildConfirm() {
  const tz     = document.getElementById('s2-timezone').value || '';
  const zip    = document.getElementById('s2-zipcode').value.trim();
  const ics    = document.getElementById('s3-cal-ics').value.trim();
  const days   = document.getElementById('s3-cal-days').value || '30';
  const smtpH  = document.getElementById('s4-smtp-host').value.trim();
  const smtpP  = document.getElementById('s4-smtp-port').value || '587';
  const aiOn   = document.getElementById('s5-ai-enabled').checked;
  const aiProv = document.getElementById('s5-ai-provider').value;
  const aiMod  = document.getElementById('s5-ai-model').value.trim();
  const newsOn = document.getElementById('s7-news-enabled').checked;
  const nCount = newsSources.filter(s => s.enabled).length;

  const provName = { claude:'Anthropic Claude', openai:'OpenAI', ollama:'Ollama', custom:'Custom' };
  const netVal = integration === 'none'
    ? '<span class="skip">Not configured</span>'
    : integration === 'unifi'
      ? `<span class="ok">UniFi</span> &middot; ${document.getElementById('s6-unifi-host').value.trim() || '?'}`
      : `<span class="ok">OPNsense</span> &middot; ${document.getElementById('s6-opn-host').value.trim() || '?'}`;

  const rows = [
    ['Password', '<span class="ok">Set</span>'],
    ['System',   `${tz}${zip ? ' &middot; ' + zip : ''}`],
    ['Calendar', ics ? `<span class="ok">Configured</span> &middot; ${days}d ahead` : '<span class="skip">Not configured</span>'],
    ['Email',    smtpH ? `<span class="ok">${smtpH}:${smtpP}</span>` : '<span class="skip">Not configured</span>'],
    ['AI chat',  aiOn ? `<span class="ok">Enabled</span> &middot; ${provName[aiProv] || aiProv}${aiMod ? ' &middot; ' + aiMod : ''}` : '<span class="skip">Disabled</span>'],
    ['Network',  netVal],
    ['News',     newsOn ? `<span class="ok">Enabled</span> &middot; ${nCount} source${nCount !== 1 ? 's' : ''}` : '<span class="skip">Disabled</span>'],
  ];

  document.getElementById('confirm-rows').innerHTML = rows.map(([k, v]) =>
    `<div class="confirm-item"><span class="confirm-key">${k}</span><span class="confirm-val">${v}</span></div>`
  ).join('');
}

// ── Collect & submit ───────────────────────────────────
function collectPayload() {
  const s = {};

  s.sys_timezone = document.getElementById('s2-timezone').value;
  const zip = document.getElementById('s2-zipcode').value.trim();
  if (zip) s.sys_zipcode = zip;

  const ics  = document.getElementById('s3-cal-ics').value.trim();
  const days = document.getElementById('s3-cal-days').value.trim();
  if (ics)  s.calendar_ics_url = ics;
  if (days) s.calendar_days    = days;

  let smtp_pass = '';
  const smtpHost = document.getElementById('s4-smtp-host').value.trim();
  if (smtpHost) {
    s.smtp_host = smtpHost;
    s.smtp_port = document.getElementById('s4-smtp-port').value || '587';
    s.smtp_user = document.getElementById('s4-smtp-user').value.trim();
    s.smtp_from = document.getElementById('s4-smtp-from').value.trim();
    s.smtp_tls  = document.getElementById('s4-smtp-tls').value;
    smtp_pass   = document.getElementById('s4-smtp-pass').value;
  }

  s.chat_enabled = document.getElementById('s5-ai-enabled').checked ? '1' : '0';
  let chat_api_key = '';
  if (document.getElementById('s5-ai-enabled').checked) {
    s.chat_llm_provider = document.getElementById('s5-ai-provider').value;
    s.chat_llm_url      = document.getElementById('s5-ai-url').value.trim();
    s.chat_llm_model    = document.getElementById('s5-ai-model').value.trim();
    chat_api_key        = document.getElementById('s5-ai-apikey').value.trim();
  }

  let net_pass = '';
  if (integration !== 'none') {
    s.net_integration = integration;
    s.net_verify_ssl  = '0';
    if (integration === 'unifi') {
      s.net_host      = document.getElementById('s6-unifi-host').value.trim();
      s.net_site      = document.getElementById('s6-unifi-site').value.trim() || 'default';
      s.net_auth_mode = unifiAuthMode;
      s.net_unifi_os  = '0';
      s.net_verify_ssl = document.getElementById('s6-unifi-ssl').checked ? '1' : '0';
      if (unifiAuthMode === 'apikey') {
        net_pass = document.getElementById('s6-unifi-apikey').value.trim();
        s.net_user = '';
      } else {
        s.net_user = document.getElementById('s6-unifi-user').value.trim();
        net_pass   = document.getElementById('s6-unifi-pass').value;
      }
    } else {
      s.net_host       = document.getElementById('s6-opn-host').value.trim();
      s.net_auth_mode  = 'apikey';
      s.net_user       = document.getElementById('s6-opn-key').value.trim();
      s.net_verify_ssl = document.getElementById('s6-opn-ssl').checked ? '1' : '0';
      net_pass = document.getElementById('s6-opn-secret').value.trim();
    }
  }

  s.news_enabled = document.getElementById('s7-news-enabled').checked ? '1' : '0';
  s.news_sources = JSON.stringify(newsSources);

  return { password: document.getElementById('pw1').value, confirm: document.getElementById('pw1').value, net_pass, smtp_pass, chat_api_key, settings: s };
}

async function finishSetup() {
  const btn = document.getElementById('btn-confirm');
  btn.disabled = true; btn.textContent = 'Saving...';
  document.getElementById('err-banner-confirm').style.display = 'none';

  try {
    const res  = await fetch('/dashboard3/api/setup.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectPayload()),
    });
    const data = await res.json();
    if (data.ok) {
      document.getElementById('card').innerHTML = `
        <div style="padding:60px 40px;text-align:center">
          <div style="font-size:48px;margin-bottom:20px;filter:drop-shadow(0 0 18px rgba(63,185,80,0.4))">✓</div>
          <div style="font-size:22px;font-weight:700;color:#f0f6fc;letter-spacing:-0.3px;margin-bottom:10px">All done</div>
          <div style="font-size:13px;color:#6e7681;line-height:1.7;max-width:320px;margin:0 auto 32px">
            Your Homelab dashboard is ready. Sign in with the password you just created.
          </div>
          <a href="/dashboard3/login.php" style="
            display:inline-block;padding:11px 32px;
            background:rgba(63,185,80,0.13);border:1px solid rgba(63,185,80,0.32);
            border-radius:9px;color:#3fb950;font-weight:600;font-size:14px;
            text-decoration:none;letter-spacing:-0.1px;
          ">Sign in</a>
        </div>`;
    } else {
      const e = document.getElementById('err-banner-confirm');
      e.textContent = data.error || 'Setup failed. Try again.';
      e.style.display = 'block';
      btn.disabled = false; btn.textContent = 'Confirm';
    }
  } catch {
    const e = document.getElementById('err-banner-confirm');
    e.textContent = 'Network error. Try again.';
    e.style.display = 'block';
    btn.disabled = false; btn.textContent = 'Confirm';
  }
}

// ── Init ───────────────────────────────────────────────
renderNewsSources();
</script>
</body>
</html>
