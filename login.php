<?php
// If already logged in, go straight to the dashboard
session_start();
if (!empty($_SESSION['dashboard_auth'])) {
    header('Location: /dashboard3/');
    exit;
}
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in</title>
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
        radial-gradient(ellipse at 18% 10%, rgba(30,55,140,0.40) 0%, transparent 50%),
        radial-gradient(ellipse at 82% 88%, rgba(18,10,70,0.50) 0%, transparent 48%),
        radial-gradient(ellipse at 60% 30%, rgba(8,42,88,0.30) 0%, transparent 44%),
        #060b16;
    }

    .card {
      width: 100%;
      max-width: 360px;
      padding: 36px 32px;
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 14px;
      backdrop-filter: blur(24px) saturate(1.3);
      box-shadow: 0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.10);
    }

    .logo {
      text-align: center;
      margin-bottom: 28px;
    }
    .logo-icon {
      font-size: 32px;
      line-height: 1;
      margin-bottom: 10px;
    }
    .logo-title {
      font-size: 18px;
      font-weight: 600;
      color: #e6edf3;
      letter-spacing: 0.3px;
    }
    .logo-sub {
      font-size: 12px;
      color: #505869;
      margin-top: 4px;
    }

    label {
      display: block;
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 6px;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    input[type="password"] {
      width: 100%;
      padding: 10px 12px;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 7px;
      color: #e6edf3;
      font-size: 14px;
      outline: none;
      transition: border-color .15s, box-shadow .15s;
      letter-spacing: 2px;
    }
    input[type="password"]:focus {
      border-color: rgba(63,185,80,0.55);
      box-shadow: 0 0 0 3px rgba(63,185,80,0.10);
    }

    button {
      width: 100%;
      margin-top: 18px;
      padding: 11px;
      background: rgba(63,185,80,0.18);
      border: 1px solid rgba(63,185,80,0.45);
      border-radius: 7px;
      color: #3fb950;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s, border-color .15s;
      letter-spacing: 0.3px;
    }
    button:hover { background: rgba(63,185,80,0.26); border-color: rgba(63,185,80,0.65); }
    button:active { background: rgba(63,185,80,0.32); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .error {
      margin-top: 14px;
      padding: 9px 12px;
      background: rgba(248,81,73,0.12);
      border: 1px solid rgba(248,81,73,0.35);
      border-radius: 6px;
      color: #f85149;
      font-size: 12px;
      text-align: center;
      display: none;
    }
    .error.visible { display: block; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">⬡</div>
      <div class="logo-title">Homelab</div>
      <div class="logo-sub">Sign in to continue</div>
    </div>

    <form id="login-form">
      <label for="pw">Password</label>
      <input type="password" id="pw" name="password" autofocus autocomplete="current-password" placeholder="••••••••">
      <button type="submit" id="submit-btn">Sign in</button>
      <div class="error" id="err-msg">Incorrect password. Try again.</div>
    </form>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const pw  = document.getElementById('pw').value;
      const btn = document.getElementById('submit-btn');
      const err = document.getElementById('err-msg');

      err.classList.remove('visible');
      btn.disabled = true;
      btn.textContent = 'Signing in…';

      try {
        const res = await fetch('/dashboard3/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json();
        if (data.ok) {
          window.location.href = '/dashboard3/';
        } else {
          err.classList.add('visible');
          btn.disabled = false;
          btn.textContent = 'Sign in';
          document.getElementById('pw').select();
        }
      } catch {
        err.textContent = 'Network error. Please try again.';
        err.classList.add('visible');
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    });
  </script>
</body>
</html>
