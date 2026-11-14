import time
import json
import os
import requests

try:
    import psutil
except ImportError:
    psutil = None

def get_system_snapshot():
    snapshot = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "cpu_percent": 0.0,
        "ram_used_gb": 0.0,
        "ram_total_gb": 0.0,
        "ram_percent": 0.0,
        "ollama_active": False,
        "running_models": []
    }
    
    if psutil:
        mem = psutil.virtual_memory()
        snapshot["cpu_percent"] = psutil.cpu_percent(interval=0.5)
        snapshot["ram_used_gb"] = round(mem.used / (1024 ** 3), 2)
        snapshot["ram_total_gb"] = round(mem.total / (1024 ** 3), 2)
        snapshot["ram_percent"] = mem.percent
    
    try:
        res = requests.get("http://localhost:11434/api/ps", timeout=2)
        if res.status_code == 200:
            snapshot["ollama_active"] = True
            snapshot["running_models"] = res.json().get("models", [])
    except Exception:
        snapshot["ollama_active"] = False
        
    return snapshot

def monitor_loop(interval_sec=2, count=10):
    print(f"📡 Memulai System Telemetry Monitor (MSI Cubi NUC AI+ B206)...")
    print(f"{'Waktu':<10} | {'CPU %':<7} | {'RAM (GB)':<12} | {'RAM %':<7} | {'Model Ollama Aktif':<25}")
    print("-" * 75)
    
    for _ in range(count):
        s = get_system_snapshot()
        models_str = ", ".join([m.get("name", "") for m in s["running_models"]]) or "Idle (No Model Loaded)"
        print(f"{s['timestamp'][-8:]:<10} | {s['cpu_percent']:<7.1f} | {s['ram_used_gb']}/{s['ram_total_gb']} GB   | {s['ram_percent']:<7.1f} | {models_str:<25}")
        time.sleep(interval_sec)

if __name__ == "__main__":
    monitor_loop(interval_sec=2, count=15)
