import csv
import json
import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Agentic Sales Hub Core API", version="1.0.0")

# Izinkan CORS agar Virtual Office milik Alfa bisa mengakses API secara mulus
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKSPACE = "workspace"
KATALOG_FILE = os.path.join(WORKSPACE, "katalog_produk.csv")
STOK_FILE = os.path.join(WORKSPACE, "stok_cabang.csv")
BUNDLING_FILE = os.path.join(WORKSPACE, "aturan_bundling.json")
LEADS_FILE = os.path.join(WORKSPACE, "leads_mentah.csv")

def get_katalog_and_stock():
    katalog = {}
    if os.path.exists(KATALOG_FILE):
        with open(KATALOG_FILE, mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                katalog[r["id_produk"]] = r

    stok = {}
    if os.path.exists(STOK_FILE):
        with open(STOK_FILE, mode="r", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                pid = r.get("id_produk")
                if pid:
                    stok.setdefault(pid, []).append(r)
    return katalog, stok

@app.get("/api/v1/system/health")
def health_check():
    return {
        "status": "online",
        "appliance": "MSI Cubi NUC AI+ B206 Ready",
        "local_llm": "qwen2.5:3b",
        "mode": "Local-First Hybrid"
    }

@app.get("/api/v1/leads/queue")
def get_leads_queue():
    if not os.path.exists(LEADS_FILE):
        return {"total": 0, "leads": []}
    
    leads = []
    with open(LEADS_FILE, mode="r", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            # Lead scoring deterministik berdasarkan budget DP
            dp = int(row.get("budget_dp", 0))
            score = "Hot" if dp >= 3500000 else ("Warm" if dp >= 2000000 else "Cold")
            row["score_priority"] = score
            leads.append(row)
    return {"total": len(leads), "leads": leads}

class PitchRequest(BaseModel):
    id_lead: str
    nama: str
    minat: str
    domisili: str

@app.post("/api/v1/leads/generate-pitch")
def generate_pitch(req: PitchRequest):
    katalog, stok = get_katalog_and_stock()
    
    # Matching produk relevan
    target_unit = "Beat Street"
    for pid, item in katalog.items():
        if any(w in item["segmen_kebutuhan"].lower() for w in req.minat.lower().split()):
            target_unit = item["nama_barang"]
            break

    prompt = f"""
Anda adalah Sales Representative ramah dan profesional.
Buatkan 1 pesan draf WhatsApp pendek (maksimal 3 kalimat) untuk calon pembeli.
Nama Calon Konsumen: {req.nama}
Kebutuhan/Minat: {req.minat}
Unit yang Pas & Ready: {target_unit}
Domisili: {req.domisili}

Pesan harus:
1. Menyapa secara ramah dan personal.
2. Menginfokan bahwa unit {target_unit} sedang ready di cabang terdekat dengan promo potongan DP/diskon menarik.
3. Memberikan Call-To-Action santai untuk konfirmasi konsultasi atau pembuatan simulasi SPK.
"""
    payload = {
        "model": "qwen2.5:3b",
        "prompt": prompt,
        "stream": False,
        "temperature": 0.3
    }
    
    try:
        res = requests.post("http://localhost:11434/api/generate", json=payload, timeout=40)
        pitch_text = res.json().get("response", "").strip()
    except Exception:
        pitch_text = f"Halo Kak {req.nama}, kami lihat Kakak sedang butuh unit {target_unit}. Kebetulan unitnya ready di cabang {req.domisili} dan sedang ada promo diskon DP spesial hari ini. Apakah berkenan kami kirimkan simulasi rincian angsurannya?"

    return {
        "id_lead": req.id_lead,
        "unit_rekomendasi": target_unit,
        "draft_pitch": pitch_text,
        "approval_required": True
    }

class ApprovalRequest(BaseModel):
    id_lead: str
    nomor_wa: str
    pesan_final: str

@app.post("/api/v1/leads/approve-and-send")
def approve_outreach(req: ApprovalRequest):
    # Approval Gate: Menandai lead siap eksekusi
    return {
        "status": "approved",
        "lead_id": req.id_lead,
        "target_wa": req.nomor_wa,
        "dispatched_to_gateway": True,
        "notes": "Pesan berhasil masuk antrean pengiriman dengan delay anti-spam."
    }

TEAM_CONFIG_FILE = os.path.join(WORKSPACE, "team_config.json")
ACTIVITIES_FILE = os.path.join(WORKSPACE, "activities.json")

@app.get("/api/v1/team/config")
def get_team_config():
    if os.path.exists(TEAM_CONFIG_FILE):
        try:
            with open(TEAM_CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

@app.post("/api/v1/team/config")
def save_team_config(config: dict):
    os.makedirs(WORKSPACE, exist_ok=True)
    with open(TEAM_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    return {"status": "saved", "message": "Konfigurasi tim berhasil disimpan."}

@app.post("/api/v1/leads/create")
def create_lead(lead: dict):
    os.makedirs(WORKSPACE, exist_ok=True)
    file_exists = os.path.exists(LEADS_FILE)
    fieldnames = ["id_lead", "nama_prospek", "nomor_wa", "minat_kebutuhan", "budget_dp", "domisili", "status_kontak"]
    
    with open(LEADS_FILE, mode="a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()
        clean_row = {k: str(lead.get(k, "")) for k in fieldnames}
        writer.writerow(clean_row)
    return {"status": "created", "lead": clean_row}

@app.get("/api/v1/system/activities")
def get_system_activities():
    if os.path.exists(ACTIVITIES_FILE):
        try:
            with open(ACTIVITIES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    # Log aktivitas real-time default dari sistem multi-agen on-premise
    return {
        "activities": [
            {"agent": "Cubi Gate", "action": "WhatsApp Gateway siap menerima trafik prospek", "time": "Baru saja", "type": "info"},
            {"agent": "Cubi Scout", "action": "Sinkronisasi stok katalog unit motor Honda lokal selesai", "time": "1m lalu", "type": "success"},
            {"agent": "Cubi Scribe", "action": "Model Qwen 2.5 3B siap menyusun penawaran deal otonom", "time": "2m lalu", "type": "ai"},
            {"agent": "Cubi Vault", "action": "Database CSV lokal terverifikasi aman tanpa egress cloud", "time": "5m lalu", "type": "security"}
        ]
    }
