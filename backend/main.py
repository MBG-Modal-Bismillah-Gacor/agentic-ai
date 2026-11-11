import csv
import json
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

try:
    from backend.engine_pdf import generate_spk_pdf, hitung_simulasi_kredit, hitung_angsuran_bulanan, OUTPUT_DIR
except ImportError:
    from engine_pdf import generate_spk_pdf, hitung_simulasi_kredit, hitung_angsuran_bulanan, OUTPUT_DIR

app = FastAPI(title="Agentic Sales Hub Core API - MSI Cubi NUC", version="1.1.0")

# Izinkan CORS agar Virtual Office dapat mengakses API secara mulus
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE = os.path.join(BASE_DIR, "workspace")
CONFIG_DIR = os.path.join(BASE_DIR, "config")

KATALOG_FILE = os.path.join(WORKSPACE, "katalog_produk.csv")
STOK_FILE = os.path.join(WORKSPACE, "stok_cabang.csv")
BUNDLING_FILE = os.path.join(WORKSPACE, "aturan_bundling.json")
LEADS_FILE = os.path.join(WORKSPACE, "leads_mentah.csv")
TEAM_FILE = os.path.join(CONFIG_DIR, "team_config.json")
AGENCY_AGENTS_FILE = os.path.join(CONFIG_DIR, "agency_agents.json")

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

def add_log(agent: str, action: str, detail: str = ""):
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
    katalog, stok = get_katalog_and_stock()
    bundling_rules = get_bundling_rules()
    
    # 1. Matching unit motor
    target_unit = "Beat Street"
    target_pid = "MTR-01"
    minat_words = req.minat.lower().split()
    
    for pid, item in katalog.items():
        if item.get("kategori", "").lower().startswith("motor"):
            segmen = item.get("segmen_kebutuhan", "").lower()
            if any(w in segmen for w in minat_words):
                target_unit = item["nama_barang"]
                target_pid = pid
                break

    # 2. Periksa Bundling Cross-Sell
    bundling_info = bundling_rules.get(target_pid, {})
    bonus_items = []
    for bonus_id in bundling_info.get("cross_sell", []):
        if bonus_id in katalog:
            bonus_items.append(katalog[bonus_id]["nama_barang"])
    
    bundling_text = ", ".join(bonus_items) if bonus_items else "Helm Eksklusif & Garansi Resmi"

    # 3. Periksa ketersediaan stok di cabang domisili
    stok_list = stok.get(target_pid, [])
    stok_status = "Ready di cabang utama"
    for s in stok_list:
        if s.get("cabang", "").lower() in req.domisili.lower() or req.domisili.lower() in s.get("cabang", "").lower():
            stok_status = f"Ready ({s.get('stok_ready', 1)} unit) di {s.get('cabang')}"
            break

    persona_title = req.persona_name or "Outbound Strategist"
    persona_vibe = req.persona_vibe or "Signal-based outreach: conversational, punchy, respectful of buyer time, zero fluff"

    prompt = f"""Anda adalah {persona_title} di dealer resmi Astra Motor.
Filosofi & Vibe Anda: "{persona_vibe}".
Buatkan 1 pesan draf WhatsApp pendek (maksimal 3 kalimat) untuk calon pembeli.
Nama Calon Konsumen: {req.nama}
Kebutuhan/Minat: {req.minat}
Unit yang Pas & Ready: {target_unit} ({stok_status})
Bonus Bundling Spesial: {bundling_text}
Domisili: {req.domisili}

Aturan Penulisan:
1. Sapa ramah secara personal menyebut nama Kak {req.nama}.
2. Hubungkan langsung minat konsumen dengan keunggulan unit {target_unit} yang ready di {stok_status} dan bonus {bundling_text} serta diskon DP menarik.
3. Berikan Call-To-Action (CTA) santai untuk jadwalkan test drive atau konfirmasi konsultasi simulasi SPK.

Format Output: HANYA berikan isi draf pesan WhatsApp tanpa basa-basi pengantar atau tanda petik."""
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
        pitch_text = (
            f"Halo Kak {req.nama}, salam hangat dari Astra Motor! Kami perhatikan Kakak sedang mencari kendaraan untuk {req.minat}. "
            f"Kabar baiknya, unit {target_unit} sedang ready di cabang {req.domisili} lengkap dengan promo bundling {bundling_text} serta diskon DP spesial hari ini. "
            f"Apakah berkenan kami kirimkan rincian simulasi angsuran dan jadwal test drive gratisnya?"
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
    nomor_wa: str
    pesan_final: str

@app.post("/api/v1/leads/approve-and-send")
def approve_outreach(req: ApprovalRequest):
    # Update status lead di CSV menjadi dispatched
    if os.path.exists(LEADS_FILE):
        rows = []
        fieldnames = ["id_lead", "nama_prospek", "nomor_wa", "minat_kebutuhan", "budget_dp", "domisili", "status_kontak"]
        with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for r in reader:
                lid = r.get("id_lead") or r.get("\ufeffid_lead", "")
                row_dict = {
                    "id_lead": lid,
                    "nama_prospek": r.get("nama_prospek", ""),
                    "nomor_wa": r.get("nomor_wa", ""),
                    "minat_kebutuhan": r.get("minat_kebutuhan", ""),
                    "budget_dp": r.get("budget_dp", "0"),
                    "domisili": r.get("domisili", ""),
                    "status_kontak": "dispatched" if lid == req.id_lead else r.get("status_kontak", "pending")
                }
                rows.append(row_dict)
        
        with open(LEADS_FILE, mode="w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    add_log("Cubi Gate", f"Dispatched WA ke {req.nomor_wa} (Lead #{req.id_lead})", "Pesan sales disetujui Bos & dikirim via gateway.")
    
    return {
        "status": "approved",
        "lead_id": req.id_lead,
        "target_wa": req.nomor_wa,
        "dispatched_to_gateway": True,
        "notes": "Pesan berhasil masuk antrean pengiriman dengan delay anti-spam."
    }

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

# ==============================================================================
# DETERMINISTIC DOCUMENT & SPK ENGINE ENDPOINTS
# ==============================================================================

class GenerateSPKRequest(BaseModel):
    nama_konsumen: str
    domisili: str
    unit_barang: str
    harga_otr: int
    nominal_dp: int
    tenor_bulan: int
    angsuran_per_bulan: Optional[int] = None
    items_bundling: Optional[List[Dict[str, Any]]] = None
    nomor_spk: Optional[str] = None

@app.post("/api/v1/sales/generate-spk")
def api_generate_spk(req: GenerateSPKRequest):
    angsuran = req.angsuran_per_bulan
    if not angsuran or angsuran <= 0:
        angsuran = hitung_angsuran_bulanan(req.harga_otr, req.nominal_dp, req.tenor_bulan)
    
    pdf_path = generate_spk_pdf(
        nama_konsumen=req.nama_konsumen,
        domisili=req.domisili,
        unit_barang=req.unit_barang,
        harga_otr=req.harga_otr,
        nominal_dp=req.nominal_dp,
        tenor_bulan=req.tenor_bulan,
        angsuran_per_bulan=angsuran,
        items_bundling=req.items_bundling or [],
        nomor_spk=req.nomor_spk
    )
    
    filename = os.path.basename(pdf_path)
    add_log("Cubi Vault", f"SPK Diterbitkan: {req.unit_barang} untuk {req.nama_konsumen}", f"File: {filename}")

    return {
        "status": "success",
        "file_name": filename,
        "pdf_path": pdf_path,
        "download_url": f"/api/v1/sales/download-spk/{filename}",
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

@app.get("/api/v1/sales/download-spk/{filename}")
def download_spk(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Berkas SPK tidak ditemukan.")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)

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
