#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import secrets
import sqlite3
import threading
import time
from base64 import urlsafe_b64encode
from dataclasses import dataclass, field
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Any

import paramiko
from cryptography.fernet import Fernet, InvalidToken
from flask import Flask, jsonify, request


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "homelab_backend.db"
MACHINES_PATH = BASE_DIR / "machines.json"
SERVICE_CATALOG_PATH = BASE_DIR / "service_catalog.json"
SECRET_PATH = DATA_DIR / "secret.key"
POLL_INTERVAL = int(os.getenv("HOMELAB_POLL_INTERVAL", "30"))
HOST = os.getenv("HOMELAB_HOST", "0.0.0.0")
PORT = int(os.getenv("HOMELAB_PORT", "4000"))
SSH_TIMEOUT = int(os.getenv("HOMELAB_SSH_TIMEOUT", "10"))
ENV_SECRET_KEY = os.getenv("HOMELAB_SECRET_KEY", "").strip()


# ── Standard Linux commands ────────────────────────────────────────────────────
COMMANDS = {
    "uptime":     "uptime -p",
    "memory":     "free -m",
    "disk":       "df -h /",
    "cpu":        "top -bn1",
    "containers": "docker ps --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}'",
    "ports":      "ss -tlnp",
    "services":   "systemctl list-units --type=service --state=running --no-pager",
    "processes":  "ps -eo comm,args --no-headers",
}

# ── ESXi commands (BusyBox shell + esxcli/vim-cmd) ───────────────────────────
# vim-cmd hostsvc/hostsummary gives both total memory (bytes) and used (MB).
# esxcli system stats cpuload get gives a 1-min CPU average (ESXi 6.7+).
COMMANDS_ESXI = {
    "uptime": "uptime",
    "memory": "vim-cmd hostsvc/hostsummary 2>/dev/null | grep -E 'overallMemoryUsage|memorySize'",
    "cpu":    "esxtop -b -n 2 -d 1 2>/dev/null | awk -F, 'NR==1{n=0;for(i=1;i<=NF;i++){if($i~/Processor Time/){idx[n++]=i}}} NR==3&&n>0{s=0;for(i=0;i<n;i++){v=$idx[i];gsub(/\"/,\"\",v);s+=v+0};printf \"%.1f\\n\",s/n}'",
    "vms":    "esxcli vm process list 2>/dev/null || true",
    "ports":  "esxcli network ip connection list 2>/dev/null || true",
}

# ── Proxmox commands (Debian base + pve tools) ────────────────────────────────
COMMANDS_PROXMOX = {
    "uptime":     "uptime -p",
    "memory":     "free -m",
    "disk":       "df -h /",
    "cpu":        "top -bn1",
    "vms":        "qm list 2>/dev/null || true",
    "lxc":        "pct list 2>/dev/null || true",
    "containers": "docker ps --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}' 2>/dev/null || true",
    "ports":      "ss -tlnp",
    "services":   "systemctl list-units --type=service --state=running --no-pager",
    "processes":  "ps -eo comm,args --no-headers",
}


def load_service_catalog() -> list[dict[str, Any]]:
    if not SERVICE_CATALOG_PATH.exists():
        return []

    raw_catalog = json.loads(SERVICE_CATALOG_PATH.read_text(encoding="utf-8"))
    normalized_catalog = []
    for item in raw_catalog:
        normalized_catalog.append(
            {
                "name": item["name"],
                "type": item.get("type", "Other"),
                "ports": {int(port) for port in item.get("ports", [])},
                "processes": {str(token).lower() for token in item.get("processes", [])},
                "containers": {str(token).lower() for token in item.get("containers", [])},
                "images": {str(token).lower() for token in item.get("images", [])},
                "port_only": bool(item.get("port_only", False)),
            }
        )
    return normalized_catalog


SERVICE_FINGERPRINTS = load_service_catalog()


app = Flask(__name__)
poller: "MachinePoller | None" = None


@dataclass
class Machine:
    name: str
    ip: str
    ssh_user: str
    ssh_password: str
    os: str = ""
    ssh_port: int = 22

    def os_type(self) -> str:
        """Return normalised OS family: 'esxi', 'proxmox', or 'linux'."""
        lower = self.os.lower()
        if "esxi" in lower:
            return "esxi"
        if "proxmox" in lower or "pve" in lower:
            return "proxmox"
        return "linux"

    def to_config_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "ip": self.ip,
            "os": self.os,
            "ssh_user": self.ssh_user,
            "ssh_port": self.ssh_port,
            "ssh_password": encrypt_secret(self.ssh_password),
        }

    def to_public_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "ip": self.ip,
            "os": self.os,
            "ssh_user": self.ssh_user,
            "ssh_port": self.ssh_port,
        }


def utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_secret_key() -> str:
    if ENV_SECRET_KEY:
        ensure_dirs()
        if not SECRET_PATH.exists():
            SECRET_PATH.write_text(ENV_SECRET_KEY, encoding="utf-8")
            os.chmod(SECRET_PATH, 0o600)
        return ENV_SECRET_KEY

    ensure_dirs()
    if SECRET_PATH.exists():
        return SECRET_PATH.read_text(encoding="utf-8").strip()

    secret = secrets.token_urlsafe(48)
    SECRET_PATH.write_text(secret, encoding="utf-8")
    os.chmod(SECRET_PATH, 0o600)
    return secret


def build_cipher() -> Fernet:
    derived_key = urlsafe_b64encode(sha256(get_secret_key().encode("utf-8")).digest())
    return Fernet(derived_key)


def encrypt_secret(value: str) -> str:
    if not value:
        return ""
    if value.startswith("enc:"):
        return value
    token = build_cipher().encrypt(value.encode("utf-8")).decode("utf-8")
    return f"enc:{token}"


def decrypt_secret(value: str) -> str:
    if not value:
        return ""
    if not value.startswith("enc:"):
        return value
    token = value[4:]
    try:
        return build_cipher().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Unable to decrypt ssh_password; check HOMELAB_SECRET_KEY") from exc


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def init_db() -> None:
    ensure_dirs()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS snapshots (
                machine_name TEXT PRIMARY KEY,
                machine_ip TEXT NOT NULL,
                snapshot_json TEXT NOT NULL,
                collected_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def load_machines() -> list[Machine]:
    if not MACHINES_PATH.exists():
        return []
    data = json.loads(MACHINES_PATH.read_text(encoding="utf-8"))
    machines = []
    for item in data.get("machines", []):
        machines.append(
            Machine(
                name=item["name"],
                ip=item["ip"],
                os=item.get("os", ""),
                ssh_user=item["ssh_user"],
                ssh_port=int(item.get("ssh_port", 22)),
                ssh_password=decrypt_secret(item["ssh_password"]),
            )
        )
    return machines


def save_machines(machines: list[Machine]) -> None:
    payload = {"machines": [machine.to_config_dict() for machine in machines]}
    MACHINES_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def migrate_plaintext_passwords() -> None:
    if not MACHINES_PATH.exists():
        return
    data = json.loads(MACHINES_PATH.read_text(encoding="utf-8"))
    machine_items = data.get("machines", [])
    if not any(item.get("ssh_password", "") and not item.get("ssh_password", "").startswith("enc:") for item in machine_items):
        return
    save_machines(load_machines())


def migrate_missing_fields() -> None:
    """Re-save machines.json if any machine is missing new fields (e.g. ssh_port)."""
    if not MACHINES_PATH.exists():
        return
    data = json.loads(MACHINES_PATH.read_text(encoding="utf-8"))
    if any("ssh_port" not in item for item in data.get("machines", [])):
        save_machines(load_machines())


def get_machine(name: str) -> Machine | None:
    lowered = name.lower()
    for machine in load_machines():
        if machine.name.lower() == lowered:
            return machine
    return None


def store_snapshot(machine: Machine, snapshot: dict[str, Any]) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO snapshots (machine_name, machine_ip, snapshot_json, collected_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(machine_name) DO UPDATE SET
                machine_ip=excluded.machine_ip,
                snapshot_json=excluded.snapshot_json,
                collected_at=excluded.collected_at
            """,
            (
                machine.name,
                machine.ip,
                json.dumps(snapshot),
                snapshot["collected_at"],
            ),
        )
        conn.commit()


def delete_snapshot(name: str) -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("DELETE FROM snapshots WHERE machine_name = ?", (name,))
        conn.commit()


def latest_snapshots() -> dict[str, dict[str, Any]]:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT machine_name, snapshot_json FROM snapshots").fetchall()
    out: dict[str, dict[str, Any]] = {}
    for row in rows:
        out[row["machine_name"].lower()] = json.loads(row["snapshot_json"])
    return out


def snapshot_for_machine(name: str) -> dict[str, Any] | None:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            "SELECT snapshot_json FROM snapshots WHERE lower(machine_name) = lower(?)",
            (name,),
        ).fetchone()
    if not row:
        return None
    return json.loads(row[0])


def json_response(payload: Any, status: int = 200):
    return jsonify(payload), status


def sanitize_snapshot(snapshot: dict[str, Any] | None) -> dict[str, Any] | None:
    if not snapshot:
        return None

    public_snapshot = {
        key: value
        for key, value in snapshot.items()
        if key not in {"commands", "machine"}
    }
    machine = snapshot.get("machine", {})
    public_snapshot["machine"] = {
        "name": machine.get("name"),
        "ip": machine.get("ip"),
        "ssh_user": machine.get("ssh_user"),
    }

    commands = snapshot.get("commands", {}) or {}
    public_snapshot["commands"] = {}
    for name, command_data in commands.items():
        public_snapshot["commands"][name] = {
            key: value
            for key, value in command_data.items()
            if key != "raw"
        }

    return public_snapshot


# ── Standard Linux parsers ────────────────────────────────────────────────────

def parse_uptime(raw: str) -> str:
    return raw.strip()


def parse_uptime_esxi(raw: str) -> str:
    """
    Convert the full `uptime` line (BusyBox / ESXi) into the same clean format
    that `uptime -p` produces on Linux, e.g. "up 5 hours, 6 minutes".

    ESXi uptime formats:
      18:31:28 up 05:06:13, load average: ...        → up 5 hours, 6 minutes
      18:31:28 up  1 day,  5:06, load average: ...   → up 1 day, 5 hours, 6 minutes
      18:31:28 up 2 days,  5:06, load average: ...   → up 2 days, 5 hours, 6 minutes
    """
    raw = raw.strip()
    # Extract the portion between 'up' and 'load average'
    m = re.search(r"up\s+(.+?),?\s+load average", raw, re.IGNORECASE)
    if not m:
        return raw

    up_str = m.group(1).strip()

    days = 0
    hours = 0
    minutes = 0

    # "N day(s), H:MM" or "N day(s), HH:MM:SS"
    day_m = re.match(r"(\d+)\s+days?,\s*(\d+):(\d+)", up_str)
    if day_m:
        days    = int(day_m.group(1))
        hours   = int(day_m.group(2))
        minutes = int(day_m.group(3))
    else:
        # "HH:MM:SS" (less than 1 day)
        hms_m = re.match(r"(\d+):(\d+):(\d+)", up_str)
        if hms_m:
            hours   = int(hms_m.group(1))
            minutes = int(hms_m.group(2))
        else:
            # "H:MM" (less than 1 day, no seconds)
            hm_m = re.match(r"(\d+):(\d+)", up_str)
            if hm_m:
                hours   = int(hm_m.group(1))
                minutes = int(hm_m.group(2))
            else:
                return raw

    parts = []
    if days:
        parts.append(f"{days} day{'s' if days != 1 else ''}")
    if hours:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes or not parts:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")

    return "up " + ", ".join(parts)


def parse_memory(raw: str) -> dict[str, Any]:
    lines = [line for line in raw.splitlines() if line.strip()]
    mem_line = next((line for line in lines if line.lower().startswith("mem:")), "")
    if not mem_line:
        return {"raw": raw.strip()}
    parts = re.split(r"\s+", mem_line.strip())
    if len(parts) < 7:
        return {"raw": raw.strip()}
    total, used, free, shared, buff_cache, available = map(int, parts[1:7])
    return {
        "total_mb": total,
        "used_mb": used,
        "free_mb": free,
        "shared_mb": shared,
        "buff_cache_mb": buff_cache,
        "available_mb": available,
        "used_percent": round((used / total) * 100, 2) if total else 0.0,
    }


def parse_disk(raw: str) -> dict[str, Any]:
    lines = [line for line in raw.splitlines() if line.strip()]
    if len(lines) < 2:
        return {"raw": raw.strip()}
    parts = re.split(r"\s+", lines[1].strip())
    if len(parts) < 6:
        return {"raw": raw.strip()}
    return {
        "filesystem": parts[0],
        "size": parts[1],
        "used": parts[2],
        "available": parts[3],
        "used_percent": parts[4],
        "mount": parts[5],
    }


def parse_cpu(raw: str) -> dict[str, Any]:
    line = next((line for line in raw.splitlines() if "%Cpu" in line), "")
    if not line:
        return {"raw": raw.strip()}
    match = re.search(r"(\d+(?:\.\d+)?)\s+id", line)
    idle = float(match.group(1)) if match else 0.0
    return {
        "used_percent": round(max(0.0, 100.0 - idle), 2),
        "raw": line.strip(),
    }


def parse_containers(raw: str) -> list[dict[str, Any]]:
    items = []
    for line in raw.splitlines():
        if not line.strip():
            continue
        name, image, status, ports = (line.split("|", 3) + ["", "", "", ""])[:4]
        items.append(
            {
                "name": name.strip(),
                "image": image.strip(),
                "status": status.strip(),
                "ports": [part.strip() for part in ports.split(",") if part.strip()],
            }
        )
    return items


def parse_ports(raw: str) -> list[dict[str, Any]]:
    items = []
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("State") or line.startswith("Netid"):
            continue
        parts = re.split(r"\s+", line, maxsplit=5)
        if len(parts) < 4:
            continue
        local = parts[3]
        process = parts[5] if len(parts) > 5 else ""
        port_match = re.search(r":(\d+)(?:\s|$)", local)
        proc_match = re.search(r'"([^"]+)"', process)
        items.append(
            {
                "listen": local,
                "port": int(port_match.group(1)) if port_match else None,
                "process": proc_match.group(1) if proc_match else process.strip(),
                "raw_process": process,
            }
        )
    return items


def parse_services(raw: str) -> list[dict[str, Any]]:
    items = []
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("UNIT ") or line.startswith("LOAD "):
            continue
        if re.match(r"^\d+\s+loaded units listed\.?$", line):
            continue
        if line.startswith("ACTIVE =") or line.startswith("SUB    ="):
            continue
        parts = re.split(r"\s+", line, maxsplit=4)
        if len(parts) < 4:
            continue
        unit, load, active, sub = parts[:4]
        description = parts[4] if len(parts) > 4 else ""
        items.append(
            {
                "unit": unit,
                "load": load,
                "active": active,
                "sub": sub,
                "description": description,
            }
        )
    return items


def parse_processes(raw: str) -> list[dict[str, str]]:
    items = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        parts = re.split(r"\s+", line, maxsplit=1)
        command = parts[0].strip()
        args = parts[1].strip() if len(parts) > 1 else ""
        items.append({"command": command, "args": args})
    return items


# ── ESXi-specific parsers ─────────────────────────────────────────────────────

def parse_memory_esxi(raw: str) -> dict[str, Any]:
    """
    Parse grep output from vim-cmd hostsvc/hostsummary:
      overallMemoryUsage = <MB used>
      memorySize = <bytes total>
    """
    used_mb: float | None = None
    total_bytes: int | None = None
    for line in raw.splitlines():
        m = re.search(r"overallMemoryUsage\s*=\s*(\d+)", line)
        if m:
            used_mb = int(m.group(1))
        m = re.search(r"memorySize\s*=\s*(\d+)", line)
        if m:
            total_bytes = int(m.group(1))
    if total_bytes is None or used_mb is None:
        return {"raw": raw.strip()}
    total_mb = round(total_bytes / 1024 / 1024, 1)
    free_mb  = round(total_mb - used_mb, 1)
    return {
        "total_mb":     total_mb,
        "used_mb":      used_mb,
        "free_mb":      free_mb,
        "used_percent": round((used_mb / total_mb) * 100, 2) if total_mb else 0.0,
    }


def parse_cpu_esxi(raw: str) -> dict[str, Any]:
    """
    Parse the single float produced by the awk filter over esxtop CSV output,
    which is the average % Processor Time across all physical CPUs.
    e.g. raw = "5.3"
    """
    raw = raw.strip()
    try:
        pct = float(raw)
        if 0.0 <= pct <= 100.0:
            return {"used_percent": round(pct, 2)}
    except ValueError:
        pass
    return {"used_percent": None}


def parse_vms_esxi(raw: str) -> list[dict[str, Any]]:
    """Parse `esxcli vm process list` output (key: value blocks per VM)."""
    vms: list[dict[str, Any]] = []
    current: dict[str, Any] = {}
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            if current:
                vms.append(current)
                current = {}
            continue
        if ":" in line:
            key, _, val = line.partition(":")
            current[key.strip().lower().replace(" ", "_")] = val.strip()
        elif not current:
            # Some ESXi versions print the VM name as a bare header line
            current["display_name"] = line
    if current:
        vms.append(current)
    return vms


def parse_ports_esxi(raw: str) -> list[dict[str, Any]]:
    """Parse `esxcli network ip connection list` – keep only LISTEN entries."""
    items = []
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("Proto") or line.startswith("---") or line.startswith("CC"):
            continue
        parts = re.split(r"\s+", line)
        if len(parts) < 4:
            continue
        # Columns: Proto Recv-Q Send-Q LocalAddr ForeignAddr State WorldID … Name
        local = parts[3]
        state = parts[5] if len(parts) > 5 else ""
        if state.upper() != "LISTEN":
            continue
        port_match = re.search(r":(\d+)$", local)
        items.append(
            {
                "listen":  local,
                "port":    int(port_match.group(1)) if port_match else None,
                "process": parts[8] if len(parts) > 8 else "",
            }
        )
    return items


# ── Proxmox-specific parsers ──────────────────────────────────────────────────

def parse_vms_proxmox(raw: str) -> list[dict[str, Any]]:
    """Parse `qm list` output."""
    vms = []
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("VMID") or line.startswith("---"):
            continue
        parts = re.split(r"\s+", line)
        if len(parts) < 3:
            continue
        vms.append({"vmid": parts[0], "name": parts[1], "status": parts[2]})
    return vms


def parse_lxc_proxmox(raw: str) -> list[dict[str, Any]]:
    """Parse `pct list` output."""
    containers = []
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("CTID") or line.startswith("---"):
            continue
        parts = re.split(r"\s+", line)
        if len(parts) < 2:
            continue
        containers.append(
            {
                "ctid":   parts[0],
                "status": parts[1],
                "name":   parts[3] if len(parts) > 3 else "",
            }
        )
    return containers


# ── Parser dispatch ───────────────────────────────────────────────────────────

_LINUX_PARSERS: dict[str, Any] = {
    "uptime":     parse_uptime,
    "memory":     parse_memory,
    "disk":       parse_disk,
    "cpu":        parse_cpu,
    "containers": parse_containers,
    "ports":      parse_ports,
    "services":   parse_services,
    "processes":  parse_processes,
}

_ESXI_PARSERS: dict[str, Any] = {
    "uptime": parse_uptime_esxi,
    "memory": parse_memory_esxi,
    "cpu":    parse_cpu_esxi,
    "vms":    parse_vms_esxi,
    "ports":  parse_ports_esxi,
}

_PROXMOX_PARSERS: dict[str, Any] = {
    **_LINUX_PARSERS,
    "vms": parse_vms_proxmox,
    "lxc": parse_lxc_proxmox,
}


def _parsers_for(os_type: str) -> dict[str, Any]:
    if os_type == "esxi":
        return _ESXI_PARSERS
    if os_type == "proxmox":
        return _PROXMOX_PARSERS
    return _LINUX_PARSERS


def _commands_for(os_type: str) -> dict[str, str]:
    if os_type == "esxi":
        return COMMANDS_ESXI
    if os_type == "proxmox":
        return COMMANDS_PROXMOX
    return COMMANDS


def parse_command_output(key: str, raw: str, os_type: str = "linux") -> Any:
    parser = _parsers_for(os_type).get(key)
    return parser(raw) if parser else raw.strip()


# ── Polling ───────────────────────────────────────────────────────────────────

def run_machine_poll(machine: Machine) -> dict[str, Any]:
    os_type = machine.os_type()
    commands = _commands_for(os_type)

    # ESXi CPU command uses `sleep 1` – give a bit of extra headroom
    timeout = SSH_TIMEOUT + 3 if os_type == "esxi" else SSH_TIMEOUT

    snapshot: dict[str, Any] = {
        "machine":      machine.to_public_dict(),
        "collected_at": utcnow_iso(),
        "ok":           False,
        "os_type":      os_type,
        "commands":     {},
        "errors":       [],
    }

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            hostname=machine.ip,
            port=machine.ssh_port,
            username=machine.ssh_user,
            password=machine.ssh_password,
            look_for_keys=False,
            allow_agent=False,
            timeout=SSH_TIMEOUT,
            banner_timeout=SSH_TIMEOUT,
            auth_timeout=SSH_TIMEOUT,
        )
        for key, command in commands.items():
            stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
            exit_code = stdout.channel.recv_exit_status()
            output = stdout.read().decode("utf-8", errors="replace")
            error  = stderr.read().decode("utf-8", errors="replace").strip()
            snapshot["commands"][key] = {
                "command":  command,
                "exit_code": exit_code,
                "raw":      output.strip(),
                "error":    error,
                "parsed":   parse_command_output(key, output, os_type),
            }
            if exit_code != 0:
                snapshot["errors"].append(
                    {
                        "command": key,
                        "message": error or f"Command exited with status {exit_code}",
                    }
                )
        snapshot["ok"] = True
    except Exception as exc:  # noqa: BLE001
        snapshot["errors"].append({"command": "ssh", "message": str(exc)})
    finally:
        client.close()

    snapshot["summary"] = build_machine_summary(snapshot, os_type)
    return snapshot


def build_machine_summary(snapshot: dict[str, Any], os_type: str = "linux") -> dict[str, Any]:
    commands = snapshot.get("commands", {})

    if os_type == "esxi":
        memory = commands.get("memory", {}).get("parsed", {}) or {}
        cpu    = commands.get("cpu",    {}).get("parsed", {}) or {}
        ports  = commands.get("ports",  {}).get("parsed", []) or []
        vms    = commands.get("vms",    {}).get("parsed", []) or []
        unique_ports = {item.get("port") for item in ports if item.get("port") is not None}
        return {
            "uptime":              commands.get("uptime", {}).get("parsed", ""),
            "cpu_used_percent":    cpu.get("used_percent"),
            "memory_used_percent": memory.get("used_percent"),
            "disk_used_percent":   None,
            "containers_running":  0,
            "vms_running":         len(vms),
            "open_ports":          len(unique_ports),
            "services_running":    0,
        }

    if os_type == "proxmox":
        memory   = commands.get("memory",   {}).get("parsed", {}) or {}
        disk     = commands.get("disk",     {}).get("parsed", {}) or {}
        cpu      = commands.get("cpu",      {}).get("parsed", {}) or {}
        ports    = commands.get("ports",    {}).get("parsed", []) or []
        services = commands.get("services", {}).get("parsed", []) or []
        vms      = commands.get("vms",      {}).get("parsed", []) or []
        lxc      = commands.get("lxc",      {}).get("parsed", []) or []
        containers = commands.get("containers", {}).get("parsed", []) or []
        unique_ports   = {item.get("port") for item in ports if item.get("port") is not None}
        running_vms    = [v for v in vms if v.get("status", "").lower() == "running"]
        running_lxc    = [c for c in lxc if c.get("status", "").lower() == "running"]
        return {
            "uptime":              commands.get("uptime", {}).get("parsed", ""),
            "cpu_used_percent":    cpu.get("used_percent"),
            "memory_used_percent": memory.get("used_percent"),
            "disk_used_percent":   disk.get("used_percent"),
            "containers_running":  len(running_lxc) + len(containers),
            "vms_running":         len(running_vms),
            "open_ports":          len(unique_ports),
            "services_running":    len(services),
        }

    # Standard Linux
    memory     = commands.get("memory",     {}).get("parsed", {})
    disk       = commands.get("disk",       {}).get("parsed", {})
    cpu        = commands.get("cpu",        {}).get("parsed", {})
    containers = commands.get("containers", {}).get("parsed", []) or []
    ports      = commands.get("ports",      {}).get("parsed", []) or []
    services   = commands.get("services",   {}).get("parsed", []) or []
    unique_ports = {item.get("port") for item in ports if item.get("port") is not None}
    return {
        "uptime":              commands.get("uptime", {}).get("parsed", ""),
        "cpu_used_percent":    cpu.get("used_percent"),
        "memory_used_percent": memory.get("used_percent"),
        "disk_used_percent":   disk.get("used_percent"),
        "containers_running":  len(containers),
        "open_ports":          len(unique_ports),
        "services_running":    len(services),
    }


# ── Service detection (Linux / Proxmox only – unchanged) ─────────────────────

def extract_match_tokens(values: list[str] | set[str]) -> set[str]:
    tokens: set[str] = set()
    for value in values:
        if not value:
            continue
        raw = str(value).strip().lower()
        if not raw:
            continue

        variants = {raw}
        if raw.endswith(".service"):
            variants.add(raw.removesuffix(".service"))

        for part in re.split(r"\s+", raw):
            part = part.strip("\"'")
            if not part:
                continue
            variants.add(part)

            cleaned = part.split("@", 1)[0]
            if ":" in cleaned and "/" in cleaned and cleaned.rfind(":") > cleaned.rfind("/"):
                cleaned = cleaned.rsplit(":", 1)[0]
            variants.add(cleaned)

            base = os.path.basename(cleaned)
            if base:
                variants.add(base)
                variants.add(re.sub(r"[-_]\d+$", "", base))

        tokens.update(token for token in variants if token)
    return tokens


def make_detected_service(
    name: str,
    type_: str,
    machine: dict[str, Any],
    matched_ports: set[int] | None = None,
    confidence: str = "confirmed",
    evidence: list[str] | None = None,
) -> dict[str, Any]:
    service_key = f"{machine['name'].strip().lower()}::{name.strip().lower()}"
    return {
        "key": service_key,
        "name": name,
        "type": type_,
        "machine": machine["name"],
        "ip": machine["ip"],
        "matched_ports": sorted(matched_ports or set()),
        "confidence": confidence,
        "evidence": evidence or [],
    }


def detect_services(snapshot: dict[str, Any]) -> list[dict[str, Any]]:
    # Skip service detection for ESXi (different stack entirely)
    if snapshot.get("os_type") == "esxi":
        return []

    machine = snapshot["machine"]
    commands = snapshot.get("commands", {})
    ports      = commands.get("ports",      {}).get("parsed", []) or []
    containers = commands.get("containers", {}).get("parsed", []) or []
    services   = commands.get("services",   {}).get("parsed", []) or []
    processes  = commands.get("processes",  {}).get("parsed", []) or []

    socket_process_names = {(item.get("process") or "").lower() for item in ports}
    process_names = {(item.get("command") or "").lower() for item in processes}
    process_args  = {(item.get("args") or "").lower() for item in processes}
    container_names  = {(item.get("name") or "").lower() for item in containers}
    container_images = {(item.get("image") or "").lower() for item in containers}
    port_numbers = {item.get("port") for item in ports if item.get("port") is not None}
    systemd_names = {(item.get("unit") or "").lower() for item in services}
    process_tokens   = extract_match_tokens(socket_process_names.union(systemd_names).union(process_names).union(process_args))
    container_tokens = extract_match_tokens(container_names)
    image_tokens     = extract_match_tokens(container_images)
    matched_container_names: set[str] = set()
    matched_port_numbers: set[int] = set()

    found = []
    for fingerprint in SERVICE_FINGERPRINTS:
        matched_ports   = port_numbers.intersection(fingerprint["ports"])
        matched_process = bool(fingerprint["processes"].intersection(process_tokens))
        matched_container = bool(fingerprint["containers"].intersection(container_tokens))
        matched_image   = bool(fingerprint.get("images", set()).intersection(image_tokens))
        allow_port_only = fingerprint.get("port_only", False)
        has_strong_evidence = matched_process or matched_container or matched_image
        if has_strong_evidence or (allow_port_only and matched_ports):
            confidence = "confirmed" if has_strong_evidence else "probable"
            evidence = []
            if matched_process:
                evidence.append("process")
            if matched_container:
                evidence.append("container")
                matched_container_names.update(
                    item.get("name", "")
                    for item in containers
                    if item.get("name") and fingerprint["containers"].intersection(extract_match_tokens({item.get("name", "")}))
                )
            if matched_image:
                evidence.append("image")
                matched_container_names.update(
                    item.get("name", "")
                    for item in containers
                    if item.get("image") and fingerprint.get("images", set()).intersection(extract_match_tokens({item.get("image", "")}))
                )
            if matched_ports:
                evidence.extend(f"port:{port}" for port in sorted(matched_ports))
                matched_port_numbers.update(matched_ports)
            found.append(make_detected_service(fingerprint["name"], fingerprint["type"], machine, matched_ports, confidence, evidence))

    for container in containers:
        container_name = (container.get("name") or "").strip()
        if not container_name or container_name in matched_container_names:
            continue
        evidence = [f"container:{container_name}"]
        image = (container.get("image") or "").strip()
        if image:
            evidence.append(f"image:{image}")
        container_ports = set()
        for binding in container.get("ports", []) or []:
            for match in re.findall(r":(\d+)(?:->|/|$)", binding):
                container_ports.add(int(match))
        matched_port_numbers.update(container_ports)
        found.append(
            make_detected_service(
                f"Container: {container_name}",
                "Unknown",
                machine,
                container_ports,
                "observed",
                evidence,
            )
        )

    return found


# ── Background poller ─────────────────────────────────────────────────────────

class MachinePoller:
    def __init__(self, interval: int):
        self.interval = max(5, interval)
        self._stop = threading.Event()
        self._thread = threading.Thread(target=self._loop, daemon=True, name="machine-poller")

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread.is_alive():
            self._thread.join(timeout=2)

    def _loop(self) -> None:
        while not self._stop.is_set():
            for machine in load_machines():
                if self._stop.is_set():
                    break
                snapshot = run_machine_poll(machine)
                store_snapshot(machine, snapshot)
            self._stop.wait(self.interval)

    def refresh_machine(self, name: str) -> dict[str, Any] | None:
        machine = get_machine(name)
        if not machine:
            return None
        snapshot = run_machine_poll(machine)
        store_snapshot(machine, snapshot)
        return snapshot


# ── Flask routes ──────────────────────────────────────────────────────────────

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,DELETE,OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


@app.route("/api/machines", methods=["GET", "POST", "OPTIONS"])
def api_machines():
    if request.method == "OPTIONS":
        return ("", 204)

    if request.method == "GET":
        snapshots = latest_snapshots()
        payload = []
        for machine in load_machines():
            payload.append(
                {
                    **machine.to_public_dict(),
                    "snapshot": sanitize_snapshot(snapshots.get(machine.name.lower())),
                }
            )
        return json_response(payload)

    body = request.get_json(silent=True) or {}
    required = ["name", "ip", "user", "password"]
    missing = [key for key in required if not str(body.get(key, "")).strip()]
    if missing:
        return json_response({"error": f"Missing fields: {', '.join(missing)}"}, 400)

    machines = load_machines()
    if any(machine.name.lower() == body["name"].lower() for machine in machines):
        return json_response({"error": "Machine already exists"}, 409)

    machine = Machine(
        name=body["name"].strip(),
        ip=body["ip"].strip(),
        os=body.get("os", "").strip(),
        ssh_user=body["user"].strip(),
        ssh_port=int(body.get("port", 22) or 22),
        ssh_password=body["password"].strip(),
    )
    machines.append(machine)
    save_machines(machines)
    snapshot = poller.refresh_machine(machine.name) if poller else None
    return json_response(
        {
            **machine.to_public_dict(),
            "snapshot": sanitize_snapshot(snapshot),
        },
        201,
    )


@app.route("/api/machines/<string:name>", methods=["GET", "DELETE", "OPTIONS"])
def api_machine_detail(name: str):
    if request.method == "OPTIONS":
        return ("", 204)

    machine = get_machine(name)
    if not machine:
        return json_response({"error": "Machine not found"}, 404)

    if request.method == "GET":
        return json_response(
            {
                **machine.to_public_dict(),
                "snapshot": sanitize_snapshot(snapshot_for_machine(machine.name)),
            }
        )

    machines = [item for item in load_machines() if item.name.lower() != machine.name.lower()]
    save_machines(machines)
    delete_snapshot(machine.name)
    return json_response({"ok": True})


@app.route("/api/machines/<string:name>/refresh", methods=["GET", "OPTIONS"])
def api_machine_refresh(name: str):
    if request.method == "OPTIONS":
        return ("", 204)

    if not poller:
        return json_response({"error": "Poller unavailable"}, 503)
    snapshot = poller.refresh_machine(name)
    if not snapshot:
        return json_response({"error": "Machine not found"}, 404)
    return json_response(sanitize_snapshot(snapshot))


@app.route("/api/services", methods=["GET", "OPTIONS"])
def api_services():
    if request.method == "OPTIONS":
        return ("", 204)

    services = []
    for snapshot in latest_snapshots().values():
        services.extend(detect_services(snapshot))
    services.sort(key=lambda item: (item["machine"].lower(), item["name"].lower()))
    return json_response(services)


def bootstrap() -> None:
    global poller
    init_db()
    migrate_plaintext_passwords()
    migrate_missing_fields()
    if poller is None:
        poller = MachinePoller(POLL_INTERVAL)
        poller.start()


bootstrap()


if __name__ == "__main__":
    app.run(host=HOST, port=PORT, debug=False, threaded=True)
