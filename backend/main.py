import asyncio
import csv
import json
import os
import tempfile
import threading
import time
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any, List, Optional, Set
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

if __package__:
    from .dispatcher import SafeOutreachDispatcher
else:
    from dispatcher import SafeOutreachDispatcher

try:
    from backend.engine_pdf import (
        generate_spk_pdf,
        hitung_simulasi_kredit,
        hitung_angsuran_bulanan,
        OUTPUT_DIR
    )
    from backend import agentic_swarm
except ImportError:
    from engine_pdf import (
        generate_spk_pdf,
        hitung_simulasi_kredit,
        hitung_angsuran_bulanan,
        OUTPUT_DIR
    )
    import agentic_swarm

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.join(BASE_DIR, "workspace")
CONFIG_DIR = os.path.join(BASE_DIR, "config")

KATALOG_FILE = os.path.join(WORKSPACE, "katalog_produk.csv")
STOK_FILE = os.path.join(WORKSPACE, "stok_cabang.csv")
BUNDLING_FILE = os.path.join(WORKSPACE, "aturan_bundling.json")
LEADS_FILE = os.path.join(WORKSPACE, "leads_mentah.csv")
TEAM_FILE = os.path.join(CONFIG_DIR, "team_config.json")
AGENCY_AGENTS_FILE = os.path.join(CONFIG_DIR, "agency_agents.json")
outreach_dispatcher = SafeOutreachDispatcher()
lead_approval_lock = threading.Lock()

# ==============================================================================
# STATE & BACKGROUND HEARTBEAT ENGINE (30 DETIK)
# ==============================================================================

main_loop: Optional[asyncio.AbstractEventLoop] = None
heartbeat_task: Optional[asyncio.Task] = None
sse_subscribers: List[asyncio.Queue] = []
deliberation_logs: List[Dict[str, Any]] = []
seen_zero_stock_keys: Set[str] = set()

heartbeat_state: Dict[str, Any] = {
    "is_active": True,
    "interval_seconds": 30,
    "last_beat": None,
    "scans_completed": 0
}

# In-memory activity logs
activity_logs: List[Dict[str, Any]] = [
    {
        "id": "act-init",
        "time": datetime.now().strftime("%H:%M:%S"),
        "agent": "System",
        "action": "MSI Cubi NUC AI+ B206 Core Hub Online",
        "detail": "Katalog, stok cabang, dan model lokal qwen2.5:3b siap melayani pipeline."
    }
]

def push_log(agent: str, action: str, detail: str = "") -> Dict[str, Any]:
    """
    Mencatat log ke activity_logs dan memancarkan event ke saluran SSE /api/v1/office/live-stream.
    Thread-safe untuk pemanggilan dari worker thread maupun async coroutine.
    """
    entry = {
        "id": f"act-{int(time.time()*1000)}",
        "time": datetime.now().strftime("%H:%M:%S"),
        "agent": agent,
        "action": action,
        "detail": detail
    }
    activity_logs.insert(0, entry)
    if len(activity_logs) > 50:
        activity_logs.pop()

    # Pancarkan ke saluran SSE
    for q in list(sse_subscribers):
        try:
            if main_loop and main_loop.is_running():
                main_loop.call_soon_threadsafe(q.put_nowait, entry)
            else:
                q.put_nowait(entry)
        except Exception:
            pass
    return entry

def add_log(agent: str, action: str, detail: str = "") -> Dict[str, Any]:
    """Alias kompatibilitas add_log yang langsung terhubung ke push_log."""
    return push_log(agent, action, detail)

def scan_zero_stock_and_deliberate(trigger_source: str = "heartbeat", force: bool = False) -> List[Dict[str, Any]]:
    """
    Memindai berkas stok_cabang.csv secara 100% READ-ONLY.
    Mendeteksi unit dengan stok_ready == 0.
    Menghasilkan transkrip musyawarah multi-agen (Scout -> Cubi Supply -> Gate -> Scribe).
    100% aman saat mode offline / Airplane Mode (tanpa koneksi internet).
    TIDAK PERNAH mengubah atau merusak berkas fisik stok_cabang.csv di disk!
    """
    timestamp_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    time_str = datetime.now().strftime("%H:%M:%S")
    heartbeat_state["last_beat"] = timestamp_now
    heartbeat_state["scans_completed"] += 1

    if not os.path.exists(STOK_FILE):
        return []

    # 1. Baca master katalog (read-only)
    katalog = {}
    if os.path.exists(KATALOG_FILE):
        try:
            with open(KATALOG_FILE, mode="r", encoding="utf-8-sig") as f:
                for r in csv.DictReader(f):
                    katalog[r["id_produk"]] = r
        except Exception as e:
            print(f"[KATALOG READ WARNING]: {e}")

    # 2. Baca stok fisik cabang (READ-ONLY)
    zero_stock_items = []
    try:
        with open(STOK_FILE, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for r in reader:
                pid = r.get("id_produk", "").strip()
                cabang = r.get("cabang", "").strip()
                try:
                    stok_val = int(r.get("stok_ready", "0"))
                except ValueError:
                    stok_val = 0
                
                status_val = r.get("status", "").strip()
                if stok_val == 0 or status_val.lower() == "kosong":
                    zero_stock_items.append({
                        "id_produk": pid,
                        "cabang": cabang,
                        "stok_ready": stok_val,
                        "nama_barang": katalog.get(pid, {}).get("nama_barang", pid)
                    })
    except Exception as e:
        print(f"[STOK READ ERROR]: {e}")
        return []

    # 3. Baca leads jika ada untuk mengaitkan prospek
    leads_map = {}
    if os.path.exists(LEADS_FILE):
        try:
            with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
                for ld in csv.DictReader(f):
                    dom = ld.get("domisili", "").strip()
                    lid = ld.get("id_lead") or ld.get("\ufeffid_lead", "")
                    nama = ld.get("nama_prospek", "Konsumen")
                    leads_map[dom.lower()] = (lid, nama)
        except Exception:
            pass

    generated_delibs = []
    for item in zero_stock_items:
        pid = item["id_produk"]
        cabang = item["cabang"]
        nama_barang = item["nama_barang"]
        item_key = f"{pid}_{cabang.lower()}"

        # Cegah duplikasi berulang untuk produk-cabang yang sama kecuali forced
        if item_key in seen_zero_stock_keys and not force:
            continue

        seen_zero_stock_keys.add(item_key)

        lead_info = leads_map.get(cabang.lower(), ("SWARM-RESTOCK", f"Konsumen {cabang}"))
        lead_id, lead_nama = lead_info

        # Transkrip koordinasi 4 agen sesuai spesifikasi
        pesan_scout = (
            f"Melaporkan deteksi stok 0 (Kosong) pada unit {nama_barang} ({pid}) di cabang {cabang} "
            f"untuk kebutuhan prospek {lead_nama} ({lead_id}). Mengeskalasi pengadaan darurat ke Cubi Supply Agent."
        )
        pesan_supply = (
            f"Mengajukan alokasi auto-restock darurat 2 unit {nama_barang} untuk cabang {cabang} ke pusat distribusi Astra Hub "
            f"(Surat Jalan: DO-ASTRA-{cabang[:3].upper()}-901). Promo komplementer: Apparel Jaket Touring & Proteksi Garansi Resmi."
        )
        pesan_gate = (
            f"Menahan promosi status 'Ready' pada unit {nama_barang} di cabang {cabang} hingga alokasi fisik dikonfirmasi dan terverifikasi di showroom. "
            f"Unit berstatus stok 0 TIDAK AKAN pernah dilabeli Ready (Zero Fake Inventory)."
        )
        pesan_scribe = (
            f"Mencatat tiket auto-restock unit {nama_barang} ({cabang}) ke log audit operasional lokal. "
            f"Menyesuaikan draf penawaran agar transparan dan menyiapkan konfirmasi ketersediaan akurat tanpa over-promise."
        )

        turns = [
            {
                "speaker": "Scout Agent",
                "role": "Stock & Demand Scout",
                "message": pesan_scout
            },
            {
                "speaker": "Cubi Supply Agent",
                "role": "Procurement & Supplier Negotiator",
                "message": pesan_supply
            },
            {
                "speaker": "Gate Agent",
                "role": "Verification & Safety Gate",
                "message": pesan_gate
            },
            {
                "speaker": "Scribe Agent",
                "role": "Outreach & Operational Audit",
                "message": pesan_scribe
            }
        ]

        delib_session = {
            "id": f"delib-{pid}-{cabang.replace(' ', '_').lower()}",
            "timestamp": time_str,
            "lead_target": lead_id,
            "konsumen": lead_nama,
            "unit": nama_barang,
            "id_produk": pid,
            "cabang": cabang,
            "defisit": "CRITICAL_EMPTY",
            "stok_ready": 0,
            "status": "Auto-Restock Requested (Astra Hub)",
            "turns": turns,
            "restock_approved": True,
            "restock_qty": 2
        }

        # Simpan ke memori deliberation_logs (perbarui jika sudah ada)
        deliberation_logs[:] = [d for d in deliberation_logs if not (d.get("id_produk") == pid and d.get("cabang") == cabang)]
        deliberation_logs.insert(0, delib_session)
        if len(deliberation_logs) > 30:
            deliberation_logs.pop()

        generated_delibs.append(delib_session)

        # Pancarkan notifikasi ringkas ke fungsi push_log(...) agar langsung tampil di SSE live-stream
        push_log(
            "Scout Agent",
            f"Deteksi Stok 0: {nama_barang} ({cabang})",
            f"Unit kosong terdeteksi; protokol auto-restock Swarm diaktifkan untuk cabang {cabang}."
        )
        push_log(
            "Cubi Supply Agent",
            f"Pengajuan Restock Astra Hub: {nama_barang}",
            f"Alokasi +2 unit diajukan ke Astra Hub cabang {cabang}."
        )
        push_log(
            "Gate Agent",
            f"Penahanan Status Ready: {nama_barang} ({cabang})",
            f"Status unit ditahan; dilarang klaim Ready sebelum verifikasi fisik showroom."
        )
        push_log(
            "Scribe Agent",
            f"Tiket Restock Dicatat: {nama_barang}",
            f"Tiket restock dicatat ke log audit operasional lokal."
        )

    return generated_delibs

async def background_heartbeat_loop(interval: int = 30):
    """
    Background Heartbeat (30 Detik)
    Memindai stok_cabang.csv setiap 30 detik secara non-blocking dan 100% aman saat mode offline / Airplane Mode.
    Hanya bersifat baca (read-only) dan tidak pernah mengubah isi berkas asli stok_cabang.csv.
    """
    print(f"[HEARTBEAT] Background Swarm Heartbeat aktif (interval: {interval}s). Local-first & 100% Offline/Airplane Mode safe.")
    while True:
        try:
            scan_zero_stock_and_deliberate(trigger_source="heartbeat")
        except Exception as e:
            print(f"[HEARTBEAT ERROR]: {e}")
        try:
            await asyncio.sleep(interval)
        except asyncio.CancelledError:
            print("[HEARTBEAT] Background Heartbeat dihentikan secara graceful.")
            break

@asynccontextmanager
async def lifespan(app: FastAPI):
    global main_loop, heartbeat_task
    main_loop = asyncio.get_running_loop()
    
    # Hubungkan logger eksternal swarm ke push_log
    agentic_swarm.set_external_logger(push_log)
    
    # Jalankan pemindaian awal stok agar data deliberasi langsung tersedia
    try:
        scan_zero_stock_and_deliberate(trigger_source="startup")
    except Exception as e:
        print(f"[STARTUP SCAN WARNING]: {e}")
        
    # Jalankan background heartbeat task (30s) secara non-blocking
    heartbeat_task = asyncio.create_task(background_heartbeat_loop(interval=30))
    
    yield
    
    # Graceful shutdown
    if heartbeat_task and not heartbeat_task.done():
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass
    agentic_swarm.stop_swarm_background()

app = FastAPI(
    title="Agentic Sales Hub Core API - MSI Cubi NUC",
    version="1.1.0",
    lifespan=lifespan
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "APP_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_katalog_and_stock():
    katalog = {}
    if os.path.exists(KATALOG_FILE):
        with open(KATALOG_FILE, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                katalog[r["id_produk"]] = r

    stok = {}
    if os.path.exists(STOK_FILE):
        with open(STOK_FILE, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                pid = r.get("id_produk")
                if pid:
                    stok.setdefault(pid, []).append(r)
    return katalog, stok

def get_stock_status(product_id, domisili, stok):
    normalized_location = domisili.strip().casefold()
    if not normalized_location:
        return "Stok belum terverifikasi karena cabang belum diisi"

    product_rows = stok.get(product_id, [])
    matches = [
        row
        for row in product_rows
        if row.get("cabang", "").strip().casefold() == normalized_location
    ]
    if not matches:
        matches = [
            row
            for row in product_rows
            if normalized_location in row.get("cabang", "").strip().casefold()
            or row.get("cabang", "").strip().casefold() in normalized_location
        ]
    if not matches:
        matches = [
            row
            for row in product_rows
            if row.get("cabang", "").strip().casefold() in ("semua cabang", "semua")
        ]
    if not matches:
        return f"Stok belum terverifikasi di cabang {domisili}"

    available_rows = []
    for row in matches:
        try:
            quantity = int(row.get("stok_ready", "0"))
        except (TypeError, ValueError):
            quantity = 0
        if row.get("status", "").strip().casefold() == "ready" and quantity > 0:
            available_rows.append((row, quantity))

    branches = ", ".join(sorted({row.get("cabang", "cabang") for row in matches}))
    available_count = sum(quantity for _, quantity in available_rows)
    if available_count:
        return f"Ready ({available_count} unit) di {branches}"
    return f"Kosong di {branches}"

def read_lead_rows():
    if not os.path.exists(LEADS_FILE):
        return [], []
    with open(LEADS_FILE, mode="r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader), reader.fieldnames or []

def write_lead_rows(rows, fieldnames):
    if not fieldnames:
        raise ValueError("Header CSV prospek tidak tersedia.")
    os.makedirs(os.path.dirname(LEADS_FILE), exist_ok=True)
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            newline="",
            dir=os.path.dirname(LEADS_FILE),
            delete=False,
        ) as temp_file:
            temp_path = temp_file.name
            writer = csv.DictWriter(temp_file, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temp_path, LEADS_FILE)
    except OSError:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
        raise

def get_bundling_rules():
    if os.path.exists(BUNDLING_FILE):
        with open(BUNDLING_FILE, mode="r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def load_team_config():
    default_config = {
        "boss": {
            "name": "Pak Alfa",
            "role": "Chief Executive / Sales Director",
            "color": "#f59e0b",
            "badge": "DIRECTOR",
            "station": "boss_desk"
        },
        "agents": {
            "blue-agent": {
                "id": "blue-agent",
                "name": "Cubi Scout",
                "role": "Compute & Stock Analyzer",
                "color": "#0284c7",
                "status": "Active Compute",
                "station": "desk"
            },
            "purple-agent": {
                "id": "purple-agent",
                "name": "Cubi Scribe",
                "role": "AI Pitch Drafter",
                "color": "#9333ea",
                "status": "Task Ready",
                "station": "kanban"
            },
            "green-agent": {
                "id": "green-agent",
                "name": "Cubi Gate",
                "role": "Approval & Dispatch",
                "color": "#16a34a",
                "status": "Access Control",
                "station": "gate"
            },
            "orange-agent": {
                "id": "orange-agent",
                "name": "Cubi Vault",
                "role": "Data & Deal Archivist",
                "color": "#ea580c",
                "status": "Vault Storage",
                "station": "vault"
            }
        }
    }
    if os.path.exists(TEAM_FILE):
        try:
            with open(TEAM_FILE, mode="r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default_config
    return default_config

def save_team_config(config: dict):
    os.makedirs(CONFIG_DIR, exist_ok=True)
    with open(TEAM_FILE, mode="w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

@app.get("/api/v1/system/health")
def health_check():
    katalog, _ = get_katalog_and_stock()
    total_leads = 0
    dispatched_leads = 0
    if os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                total_leads += 1
                if row.get("status_kontak") in ["dispatched", "approved"]:
                    dispatched_leads += 1

    return {
        "status": "online",
        "appliance": "MSI Cubi NUC AI+ B206 Ready",
        "local_llm": "qwen2.5:3b",
        "mode": "Local-First Hybrid",
        "katalog_count": len(katalog),
        "total_leads": total_leads,
        "dispatched_leads": dispatched_leads,
        "outreach_mode": "live" if outreach_dispatcher.live_enabled else "simulation",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/v1/team/config")
def get_team_config_endpoint():
    return load_team_config()

class TeamConfigUpdate(BaseModel):
    boss: Optional[Dict[str, Any]] = None
    agents: Optional[Dict[str, Any]] = None

@app.post("/api/v1/team/config")
def update_team_config_endpoint(payload: TeamConfigUpdate):
    current = load_team_config()
    if payload.boss:
        current["boss"].update(payload.boss)
    if payload.agents:
        for k, v in payload.agents.items():
            if k in current["agents"]:
                current["agents"][k].update(v)
            else:
                current["agents"][k] = v
    save_team_config(current)
    boss_name = current.get("boss", {}).get("name", "Bos")
    add_log(boss_name, "Memperbarui Konfigurasi Tim & Kantor", "Nama dan peran tim berhasil disinkronkan.")
    return {"status": "success", "config": current}

@app.get("/api/v1/leads/queue")
def get_leads_queue():
    if not os.path.exists(LEADS_FILE):
        return {"total": 0, "leads": []}
    
    leads = []
    with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            dp_raw = row.get("budget_dp", "0")
            try:
                dp = int(dp_raw)
            except ValueError:
                dp = 0
            score = "Hot" if dp >= 3500000 else ("Warm" if dp >= 2000000 else "Cold")
            
            lead_id = row.get("id_lead") or row.get("\ufeffid_lead", "")
            nama_val = row.get("nama_prospek") or row.get("nama", "Konsumen")
            minat_val = row.get("minat_kebutuhan") or row.get("minat", "")

            # Normalisasi field nama & minat agar kompatibel
            lead_norm = {
                "id_lead": lead_id,
                "nama": nama_val,
                "nama_prospek": nama_val,
                "nomor_wa": row.get("nomor_wa", "6281234567890"),
                "minat": minat_val,
                "minat_kebutuhan": minat_val,
                "budget_dp": str(dp),
                "domisili": row.get("domisili", "Banyumas"),
                "status_kontak": row.get("status_kontak", "pending"),
                "score_priority": score
            }
            leads.append(lead_norm)
            
    return {"total": len(leads), "leads": leads}

class NewLeadRequest(BaseModel):
    nama: str
    nomor_wa: str
    minat: str
    budget_dp: int
    domisili: str

@app.post("/api/v1/leads/create")
def create_lead(req: NewLeadRequest):
    next_id = "LD-001"
    existing_rows = []
    if os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
            existing_rows = list(csv.DictReader(f))
            if existing_rows:
                nums = []
                for r in existing_rows:
                    lid = r.get("id_lead") or r.get("\ufeffid_lead", "")
                    if lid.startswith("LD-"):
                        try:
                            nums.append(int(lid.replace("LD-", "")))
                        except ValueError:
                            pass
                if nums:
                    next_id = f"LD-{max(nums) + 1:03d}"

    new_row = {
        "id_lead": next_id,
        "nama_prospek": req.nama,
        "nomor_wa": req.nomor_wa,
        "minat_kebutuhan": req.minat,
        "budget_dp": str(req.budget_dp),
        "domisili": req.domisili,
        "status_kontak": "pending"
    }

    fieldnames = ["id_lead", "nama_prospek", "nomor_wa", "minat_kebutuhan", "budget_dp", "domisili", "status_kontak"]
    
    file_exists = os.path.exists(LEADS_FILE)
    with open(LEADS_FILE, mode="a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists or os.path.getsize(LEADS_FILE) == 0:
            writer.writeheader()
        writer.writerow(new_row)

    add_log("System", f"Lead Baru Terdaftar: {req.nama} ({next_id})", f"Minat: {req.minat}, Domisili: {req.domisili}")
    return {"status": "created", "lead": new_row}

class PitchRequest(BaseModel):
    id_lead: str
    nama: str
    minat: str
    domisili: str
    persona_id: Optional[str] = "sales-outbound-strategist"
    persona_name: Optional[str] = "Outbound Strategist"
    persona_vibe: Optional[str] = ""

@app.get("/api/v1/system/personas")
def get_personas():
    if os.path.exists(AGENCY_AGENTS_FILE):
        try:
            with open(AGENCY_AGENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"personas": []}

@app.post("/api/v1/leads/generate-pitch")
def generate_pitch(req: PitchRequest):
    lead_rows, _ = read_lead_rows()
    if not any((row.get("id_lead") or row.get("\ufeffid_lead", "")) == req.id_lead for row in lead_rows):
        raise HTTPException(status_code=404, detail="Prospek tidak ditemukan.")

    katalog, stok = get_katalog_and_stock()
    bundling_rules = get_bundling_rules()
    
    # 1. Matching unit motor
    target_unit = "Beat Street"
    target_pid = "MTR-01"
    minat_words = set(req.minat.casefold().split())
    best_match_score = 0
    
    for pid, item in katalog.items():
        if item.get("kategori", "").lower().startswith("motor"):
            segmen_words = set(item.get("segmen_kebutuhan", "").casefold().split())
            score = len(minat_words & segmen_words)
            if score > best_match_score:
                best_match_score = score
                target_unit = item["nama_barang"]
                target_pid = pid

    # 2. Periksa Bundling Cross-Sell
    bundling_info = bundling_rules.get(target_pid, {})
    bonus_items = []
    for bonus_id in bundling_info.get("cross_sell", []):
        if bonus_id in katalog:
            bonus_items.append(katalog[bonus_id]["nama_barang"])
    
    bundling_text = ", ".join(bonus_items) if bonus_items else "Helm Eksklusif & Garansi Resmi"

    # 3. Periksa ketersediaan stok di cabang domisili
    stok_status = get_stock_status(target_pid, req.domisili, stok)

    persona_title = req.persona_name or "Outbound Strategist"
    persona_vibe = req.persona_vibe or "Signal-based outreach: conversational, punchy, respectful of buyer time, zero fluff"

    prompt = f"""
Anda adalah {persona_title} di dealer resmi Astra Motor.
Filosofi & Vibe Anda: "{persona_vibe}".
Buatkan 1 pesan draf WhatsApp pendek (maksimal 3 kalimat) untuk calon pembeli.
Nama Calon Konsumen: {req.nama}
Kebutuhan/Minat: {req.minat}
Unit yang Pas: {target_unit}
Stok Cabang: {stok_status}
Bonus Bundling: {bundling_text}

Aturan Penulisan:
Sapa secara ramah dan personal. Gunakan hanya fakta stok di atas; jangan menyebut unit ready bila stok kosong atau belum terverifikasi. Jika stok kosong/belum terverifikasi, jelaskan statusnya dan tawarkan pengecekan cabang lain atau alternatif tanpa mengarang diskon. Jika ready, sebutkan bundling yang tercatat. Akhiri dengan CTA santai untuk konsultasi atau test drive.
Berikan hanya isi pesan, tanpa pengantar atau tanda petik.
"""
    payload = {
        "model": "qwen2.5:3b",
        "prompt": prompt,
        "stream": False,
        "temperature": 0.3
    }
    
    pitch_text = ""
    try:
        res = requests.post("http://localhost:11434/api/generate", json=payload, timeout=2.0)
        if res.status_code == 200:
            pitch_text = res.json().get("response", "").strip()
    except Exception:
        pass

    if not pitch_text:
        if stok_status.startswith("Ready"):
            pitch_text = (
                f"Halo Kak {req.nama}, untuk kebutuhan {req.minat}, {target_unit} tersedia: {stok_status}. "
                f"Ada bundling {bundling_text}; apakah Kakak ingin menjadwalkan test drive atau konsultasi angsuran?"
            )
        else:
            pitch_text = (
                f"Halo Kak {req.nama}, untuk kebutuhan {req.minat}, stok {target_unit} saat ini {stok_status}. "
                "Apakah Kakak ingin saya cek cabang lain atau carikan alternatif yang sesuai?"
            )

    add_log("Cubi Scribe", f"Draf Pitch Dibuat untuk {req.nama}", f"Unit: {target_unit} • {stok_status}")

    return {
        "id_lead": req.id_lead,
        "unit_rekomendasi": target_unit,
        "bundling_promo": bundling_text,
        "stok_info": stok_status,
        "draft_pitch": pitch_text,
        "approval_required": True
    }

class ApprovalRequest(BaseModel):
    id_lead: str
    pesan_final: str
    approved_by: str = ""
    consent_confirmed: bool = False
    nomor_wa: Optional[str] = None

@app.post("/api/v1/leads/approve-and-send")
def approve_outreach(req: ApprovalRequest):
    if not req.consent_confirmed:
        raise HTTPException(status_code=400, detail="Konfirmasi consent prospek diperlukan.")
    if not req.approved_by.strip():
        raise HTTPException(status_code=400, detail="Nama staf yang menyetujui wajib diisi.")
    if not req.pesan_final.strip():
        raise HTTPException(status_code=400, detail="Pesan final tidak boleh kosong.")

    with lead_approval_lock:
        rows, fieldnames = read_lead_rows()
        lead = next(
            (
                row
                for row in rows
                if (row.get("id_lead") or row.get("\ufeffid_lead", "")) == req.id_lead
            ),
            None,
        )
        if lead is None:
            raise HTTPException(status_code=404, detail="Prospek tidak ditemukan.")
        if lead.get("status_kontak") == "dispatched":
            raise HTTPException(status_code=409, detail="Pesan untuk prospek ini sudah terkirim.")
        if not lead.get("nomor_wa", "").strip():
            raise HTTPException(status_code=400, detail="Nomor WhatsApp prospek belum tersedia.")

        dispatch_result = outreach_dispatcher.kirim_whatsapp_aman(
            nomor_tujuan=lead["nomor_wa"],
            pesan=req.pesan_final,
            audit_context={
                "lead_id": req.id_lead,
                "approved_by": req.approved_by.strip(),
                "consent_confirmed": req.consent_confirmed,
            },
        )
        dispatch_status = dispatch_result["status"]
        if dispatch_status == "ditahan_approval_gate":
            raise HTTPException(status_code=403, detail=dispatch_result["error"])
        if dispatch_status == "ditahan_rate_limit":
            raise HTTPException(
                status_code=429,
                detail={
                    "message": dispatch_result["pesan"],
                    "retry_after_seconds": dispatch_result["retry_after_seconds"],
                },
            )
        if dispatch_status == "gagal_gateway":
            raise HTTPException(status_code=502, detail=dispatch_result["error"])
        if dispatch_status != "terkirim_simulasi" and dispatch_status != "terkirim_live_wa":
            raise HTTPException(status_code=422, detail=dispatch_result.get("error", "Dispatch ditolak."))

        status_kontak = "dispatched" if dispatch_status == "terkirim_live_wa" else "simulated"
        lead["status_kontak"] = status_kontak
        write_lead_rows(rows, fieldnames)

        # Hitung deterministik rincian harga, opsi DP, dan skema cicilan (Zero-Hallucination)
        katalog, _ = get_katalog_and_stock()
        bundling_rules = get_bundling_rules()
        minat_str = (lead.get("minat_kebutuhan") or "").lower()
        matched_pid = "MTR-01"
        if "sporty" in minat_str or "kencang" in minat_str or "tenaga" in minat_str:
            matched_pid = "MTR-02"
        elif "touring" in minat_str or "maxi" in minat_str or "jarak jauh" in minat_str:
            matched_pid = "MTR-03"
        elif "lincah" in minat_str or "hemat" in minat_str or "irit" in minat_str or "murah" in minat_str:
            matched_pid = "MTR-01"
        else:
            best_sc = 0
            for pid, itm in katalog.items():
                if itm.get("kategori", "").lower().startswith("motor"):
                    seg_w = itm.get("segmen_kebutuhan", "").lower()
                    sc = sum(1 for w in minat_str.split() if w in seg_w)
                    if sc > best_sc:
                        best_sc = sc
                        matched_pid = pid

        matched_item = katalog.get(matched_pid, {
            "id_produk": "MTR-01",
            "nama_barang": "Beat Street",
            "harga": "19300000"
        })
        harga_otr = int(matched_item.get("harga", 19300000))
        try:
            nominal_dp = int(lead.get("budget_dp", 0))
        except (ValueError, TypeError):
            nominal_dp = 2500000
        
        tenor_bulan = 24
        angsuran = hitung_angsuran_bulanan(harga_otr, nominal_dp, tenor_bulan)

        bundling_info = bundling_rules.get(matched_pid, {})
        items_bundling = []
        for bonus_id in bundling_info.get("cross_sell", []):
            if bonus_id in katalog:
                items_bundling.append({
                    "nama": katalog[bonus_id].get("nama_barang", bonus_id),
                    "kategori": katalog[bonus_id].get("kategori", "Aksesoris"),
                    "biaya": "Termasuk Promo"
                })
        if not items_bundling:
            items_bundling = [
                {"nama": "Helm Eksklusif & Toolkit Resmi", "kategori": "Safety Apparel", "biaya": "Termasuk Promo"},
                {"nama": "Garansi Extended Mesin 2 Tahun", "kategori": "Proteksi Servis", "biaya": "Termasuk Promo"}
            ]

        konsumen_nama = lead.get("nama_prospek") or lead.get("nama") or "Konsumen"
        konsumen_clean = konsumen_nama.replace(" ", "_").replace("/", "_")
        pdf_filename = f"SPK_{req.id_lead}_{konsumen_clean}.pdf"

        try:
            pdf_path = generate_spk_pdf(
                nama_konsumen=konsumen_nama,
                domisili=lead.get("domisili", "Banyumas"),
                unit_barang=matched_item["nama_barang"],
                harga_otr=harga_otr,
                nominal_dp=nominal_dp,
                tenor_bulan=tenor_bulan,
                angsuran_per_bulan=angsuran,
                items_bundling=items_bundling,
                id_lead=req.id_lead,
                file_name=pdf_filename,
                output_dir=OUTPUT_DIR
            )
        except Exception as pdf_err:
            print(f"[PDF GENERATION WARNING]: {pdf_err}")
            pdf_filename = f"SPK_{req.id_lead}_{konsumen_clean}.pdf"

    add_log(
        "Cubi Gate",
        f"Outreach {status_kontak} untuk prospek {req.id_lead}",
        f"Disetujui oleh {req.approved_by.strip()}; consent dikonfirmasi; SPK diterbitkan ({pdf_filename}).",
    )
    return {
        "status": status_kontak,
        "lead_id": req.id_lead,
        "pdf_filename": pdf_filename,
        "pdf_url": f"/api/v1/documents/{pdf_filename}",
        "download_url": f"/api/v1/documents/{pdf_filename}",
        "rincian": {
            "nama_konsumen": konsumen_nama,
            "domisili": lead.get("domisili", "Banyumas"),
            "unit_barang": matched_item["nama_barang"],
            "harga_otr": harga_otr,
            "nominal_dp": nominal_dp,
            "tenor_bulan": tenor_bulan,
            "angsuran_per_bulan": angsuran,
        },
        "dispatch": dispatch_result,
        "dispatched_to_gateway": dispatch_status == "terkirim_live_wa",
    }

# ==============================================================================
# DOCUMENT DOWNLOAD ENDPOINTS
# ==============================================================================

@app.get("/api/v1/documents/{filename}")
def download_document(filename: str):
    candidate_dirs = [
        OUTPUT_DIR,
        os.path.join(BASE_DIR, "output"),
        os.path.join(BASE_DIR, "output_dokumen")
    ]
    for c_dir in candidate_dirs:
        file_path = os.path.join(c_dir, filename)
        if os.path.isfile(file_path):
            return FileResponse(file_path, media_type="application/pdf", filename=filename)
    raise HTTPException(status_code=404, detail="Berkas SPK / dokumen tidak ditemukan.")

@app.get("/api/v1/sales/download-spk/{filename}")
def download_spk(filename: str):
    return download_document(filename)

# ==============================================================================
# SALES SIMULASI & SPK API ENDPOINTS
# ==============================================================================

class SimulasiKreditRequest(BaseModel):
    harga_otr: int
    nominal_dp: int
    bunga_tahunan: Optional[float] = 0.08

@app.post("/api/v1/sales/simulasi-kredit")
def api_simulasi_kredit(req: SimulasiKreditRequest):
    return hitung_simulasi_kredit(
        harga_otr=req.harga_otr,
        nominal_dp=req.nominal_dp,
        bunga_tahunan=req.bunga_tahunan or 0.08
    )

class GenerateSPKRequest(BaseModel):
    nama_konsumen: str
    domisili: str
    unit_barang: str
    harga_otr: int
    nominal_dp: int
    tenor_bulan: int
    bunga_tahunan: Optional[float] = 0.08
    items_bundling: Optional[List[Dict[str, Any]]] = None

@app.post("/api/v1/sales/generate-spk")
def api_generate_spk(req: GenerateSPKRequest):
    angsuran = hitung_angsuran_bulanan(
        req.harga_otr,
        req.nominal_dp,
        req.tenor_bulan,
        req.bunga_tahunan or 0.08
    )
    pdf_path = generate_spk_pdf(
        nama_konsumen=req.nama_konsumen,
        domisili=req.domisili,
        unit_barang=req.unit_barang,
        harga_otr=req.harga_otr,
        nominal_dp=req.nominal_dp,
        tenor_bulan=req.tenor_bulan,
        angsuran_per_bulan=angsuran,
        items_bundling=req.items_bundling or [],
        output_dir=OUTPUT_DIR
    )
    fname = os.path.basename(pdf_path)
    return {
        "status": "success",
        "file_name": fname,
        "pdf_filename": fname,
        "pdf_path": pdf_path,
        "pdf_url": f"/api/v1/documents/{fname}",
        "download_url": f"/api/v1/sales/download-spk/{fname}",
        "rincian": {
            "nama_konsumen": req.nama_konsumen,
            "domisili": req.domisili,
            "unit_barang": req.unit_barang,
            "harga_otr": req.harga_otr,
            "nominal_dp": req.nominal_dp,
            "tenor_bulan": req.tenor_bulan,
            "angsuran_per_bulan": angsuran
        }
    }

# ==============================================================================
# AUTONOMOUS SWARM DELIBERATIONS, SSE LIVE-STREAM & TELEMETRY ENDPOINTS
# ==============================================================================

@app.get("/api/v1/deliberations")
@app.get("/deliberations")
@app.get("/api/v1/swarm/deliberations")
def get_deliberations():
    if not deliberation_logs:
        scan_zero_stock_and_deliberate(trigger_source="api_request")
        
    combined = list(deliberation_logs)
    swarm_history = agentic_swarm.get_swarm_telemetry().get("recent_deliberations", [])
    for sh in swarm_history:
        if not any(d.get("id") == sh.get("id") for d in combined):
            combined.append(sh)

    return {
        "status": "ok",
        "heartbeat_status": "active" if heartbeat_state["is_active"] else "inactive",
        "interval_seconds": heartbeat_state["interval_seconds"],
        "heartbeat": {
            "status": "active" if heartbeat_state["is_active"] else "inactive",
            "interval_seconds": heartbeat_state["interval_seconds"],
            "last_beat": heartbeat_state["last_beat"],
            "scans_completed": heartbeat_state["scans_completed"]
        },
        "jumlah_temuan": len(deliberation_logs),
        "total": len(combined),
        "deliberations": combined
    }

@app.post("/api/v1/swarm/trigger-restock")
def trigger_restock_endpoint(payload: Optional[Dict[str, Any]] = None):
    """
    Pemicu instan untuk Skenario 2 (Autonomous Swarm Restock) saat demo lapangan.
    Memindai stok kosong di stok_cabang.csv secara read-only, menjalankan deliberasi multi-agen,
    dan memancarkan notifikasi ke SSE live-stream push_log tanpa menunggu jeda 30 detik.
    """
    newly_found = scan_zero_stock_and_deliberate(trigger_source="instant_manual_trigger", force=True)
    return {
        "status": "ok",
        "message": "Skenario 2 (Autonomous Swarm Restock) berhasil dipicu secara instan.",
        "trigger": "instant_manual_trigger",
        "heartbeat_interval_seconds": heartbeat_state["interval_seconds"],
        "jumlah_temuan": len(newly_found),
        "newly_generated": newly_found,
        "deliberations": list(deliberation_logs),
        "total": len(deliberation_logs)
    }

@app.get("/api/v1/office/live-stream")
async def office_live_stream():
    """
    Saluran Server-Sent Events (SSE) real-time untuk pemantauan aktivitas kantor dan musyawarah agen.
    """
    queue = asyncio.Queue()
    sse_subscribers.append(queue)
    async def sse_event_stream():
        try:
            yield f"data: {json.dumps({'event': 'connected', 'message': 'SSE live-stream terhubung', 'time': datetime.now().strftime('%H:%M:%S')})}\n\n"
            while True:
                event_data = await queue.get()
                yield f"data: {json.dumps(event_data)}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if queue in sse_subscribers:
                sse_subscribers.remove(queue)

    return StreamingResponse(
        sse_event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/v1/swarm/telemetry")
def get_swarm_telemetry_endpoint():
    telemetry = agentic_swarm.get_swarm_telemetry()
    telemetry["heartbeat"] = heartbeat_state
    telemetry["deliberations_count"] = len(deliberation_logs)
    return telemetry

class SwarmToggleRequest(BaseModel):
    enabled: bool
    interval_seconds: Optional[int] = 30

@app.post("/api/v1/swarm/toggle")
def toggle_swarm_endpoint(req: SwarmToggleRequest):
    heartbeat_state["is_active"] = req.enabled
    if req.interval_seconds:
        heartbeat_state["interval_seconds"] = req.interval_seconds
    if req.enabled:
        agentic_swarm.start_swarm_background(interval=req.interval_seconds or 30)
    else:
        agentic_swarm.stop_swarm_background()
    return {"status": "ok", "telemetry": agentic_swarm.get_swarm_telemetry(), "heartbeat": heartbeat_state}

@app.post("/api/v1/swarm/run-cycle")
def run_swarm_cycle_endpoint():
    result = agentic_swarm.run_swarm_cycle(trigger_source="manual_api")
    return {"status": "ok", "result": result, "telemetry": agentic_swarm.get_swarm_telemetry()}

# ==============================================================================
# SYSTEM ACTIVITIES & ACTIVITY LOG
# ==============================================================================

@app.get("/api/v1/system/activities")
def get_activities():
    return {"total": len(activity_logs), "activities": activity_logs}

class ActivityCreateRequest(BaseModel):
    agent: str
    action: str
    detail: Optional[str] = ""

@app.post("/api/v1/system/activities")
def post_activity(req: ActivityCreateRequest):
    add_log(req.agent, req.action, req.detail or "")
    return {"status": "ok"}
