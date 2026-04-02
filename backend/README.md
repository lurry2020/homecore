# Homelab Backend

Python Flask backend for the homelab dashboard. It polls registered machines over SSH, stores the latest snapshot in SQLite, and exposes JSON APIs on port `4000`.

SSH passwords are encrypted at rest before being written to `machines.json`. By default, the backend auto-generates and stores its own local encryption key in `backend/data/secret.key`, so users can submit a password in the frontend without any extra setup.

## Files

- `app.py` - Flask app, background poller, SSH collection, parsing, and API routes
- `machines.json` - registered SSH targets
- `requirements.txt` - Python dependencies
- `homelab-backend.service` - systemd unit file

## API

- `GET /api/machines` - list all configured machines with latest snapshot
- `GET /api/machines/<name>` - single machine detail
- `POST /api/machines` - register a machine with `name`, `ip`, `user`, `password`
- `DELETE /api/machines/<name>` - remove a machine
- `GET /api/machines/<name>/refresh` - trigger immediate poll
- `GET /api/services` - detected services across all machines

## Install Dependencies

```bash
cd /var/www/html/dashboard/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Configure machines.json

Edit `machines.json` and make sure each machine has:

- `name`
- `ip`
- `ssh_user`
- `ssh_password`

If `ssh_password` starts with `enc:`, it is encrypted. Plain-text entries are still readable for migration, and the backend will rewrite them as encrypted automatically.
If no env secret is provided, the backend manages its own key automatically in `backend/data/secret.key`.

## Run Manually

```bash
cd /var/www/html/dashboard/backend
source .venv/bin/activate
export HOMELAB_PORT=4000
export HOMELAB_POLL_INTERVAL=30
python3 app.py
```

You can optionally set `HOMELAB_SECRET_KEY` if you want to control the encryption key yourself, but it is not required. If you do set it on first run, the backend will also persist it to `backend/data/secret.key` for future hands-off use.

## Apache Reverse Proxy

Enable the needed modules:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl reload apache2
```

Add a proxy rule to your Apache vhost:

```apache
ProxyPass /api http://localhost:4000/api
ProxyPassReverse /api http://localhost:4000/api
```

The requested snippet:

```apache
apacheProxyPass /api http://localhost:4000/api
ProxyPassReverse /api http://localhost:4000/api
```

Use the real Apache directive as:

```apache
ProxyPass /api http://localhost:4000/api
ProxyPassReverse /api http://localhost:4000/api
```

Then reload Apache:

```bash
sudo systemctl reload apache2
```

## Install systemd Service

Copy the service file into systemd:

```bash
sudo cp /var/www/html/dashboard/backend/homelab-backend.service /etc/systemd/system/homelab-backend.service
sudo systemctl daemon-reload
sudo systemctl enable homelab-backend.service
sudo systemctl start homelab-backend.service
```

Then restart the service:

```bash
sudo systemctl restart homelab-backend.service
```

Check status:

```bash
sudo systemctl status homelab-backend.service
journalctl -u homelab-backend.service -f
```

## Notes

- Poll interval defaults to `30` seconds and is configurable via `HOMELAB_POLL_INTERVAL`
- SQLite data is stored in `backend/data/homelab_backend.db`
- The backend auto-generates `backend/data/secret.key` for password encryption if `HOMELAB_SECRET_KEY` is not set
- The backend adds permissive CORS headers so frontend JS can call it directly
- The provided systemd unit expects the virtualenv at `/var/www/html/dashboard/backend/.venv`
- If `backend/data/secret.key` is lost, stored SSH passwords can no longer be decrypted
- Service detection uses port, process, container, and systemd-unit fingerprints for:
  `Ollama`, `Open WebUI`, `Qdrant`, `SearXNG`, `n8n`, `Apache2`, `Pi-hole`, `Zabbix`, and `Nextcloud`
