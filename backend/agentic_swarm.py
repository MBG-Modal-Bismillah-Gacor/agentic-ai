"""
AGENTIC SWARM v2.0 — COUNCIL OF AGENTS
MSI Cubi NUC AI+ B206 — Agentic Sales Hub

Upgrade v2.0:
- Tiap agen punya persona LLM unik (bukan lagi hardcoded string)
- Dual-model routing: Commander pakai deepseek-r1 (deep reasoning),
  Worker agents pakai qwen2.5:7b (cepat & responsif)
- Mekanisme rapat Round Table: agen bicara berurutan,
  tiap agen baca konteks agen sebelumnya
- Commander memberikan keputusan & ringkasan final
"""

import os
import csv
import json
import time
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    from backend.llm_client import call_unified_llm
except ImportError:
    from llm_client import call_unified_llm

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
WORKSPACE  = os.path.join(BASE_DIR, "workspace")
CONFIG_DIR = os.path.join(BASE_DIR, "config")

KATALOG_FILE  = os.path.join(WORKSPACE, "katalog_produk.csv")
STOK_FILE     = os.path.join(WORKSPACE, "stok_cabang.csv")
BUNDLING_FILE = os.path.join(WORKSPACE, "aturan_bundling.json")
LEADS_FILE    = os.path.join(WORKSPACE, "leads_mentah.csv")

# ==============================================================================
# AGENT PERSONAS — Karakter LLM Unik Tiap Agen
# ==============================================================================

AGENT_PERSONAS = {
    "Scout": {
        "emoji": "🔭",
        "role": "Field Intelligence Officer",
        "system_prompt": (
            "Kamu adalah Cubi Scout, agen intelijen lapangan tim sales Astra Motor Purwokerto. "
            "Tugasmu: menganalisis data prospek, domisili, minat, dan ketersediaan stok untuk "
            "mendeteksi peluang dan risiko bisnis. "
            "Gaya bicara: ringkas, data-driven, pakai angka dan fakta konkret. "
            "Tidak suka basa-basi. Laporkan temuanmu seperti briefing intel kepada tim. "
            "Maksimal 3 kalimat. Mulai langsung dengan temuan utama."
        ),
        "model_env": "LOCAL_LLM_MODEL",    # qwen2.5:7b — cepat
        "temperature": 0.2,
    },
    "Supply": {
        "emoji": "💰",
        "role": "Procurement & Supplier Negotiator",
        "system_prompt": (
            "Kamu adalah Cubi Supply, negosiator pengadaan stok Astra Motor Purwokerto. "
            "Tugasmu: menghubungi distributor utama Astra Motor untuk mendapatkan unit "
            "dengan lead time tercepat dan harga terbaik. "
            "Gaya bicara: profesional, berorientasi solusi, selalu sebut opsi konkret "
            "(jumlah unit, estimasi pengiriman, kode surat jalan). "
            "Maksimal 3 kalimat. Langsung ke poin pengadaan."
        ),
        "model_env": "LOCAL_LLM_MODEL",    # qwen2.5:7b — cepat
        "temperature": 0.3,
    },
    "SupplierHub": {
        "emoji": "🏭",
        "role": "Astra Motor Central Distribution Hub",
        "system_prompt": (
            "Kamu adalah Sistem Distribusi Utama Astra Motor (Main Supplier Hub). "
            "Kamu mewakili pusat distribusi resmi yang melayani permintaan alokasi unit dari cabang. "
            "Selalu berikan konfirmasi formal: nomor Surat Jalan (DO-ASTRA-XXX), "
            "jumlah unit yang disetujui, estimasi pengiriman, dan promo bundling aktif. "
            "Gaya bicara: formal, otoritatif, efisien. Maksimal 2 kalimat."
        ),
        "model_env": "LOCAL_LLM_MODEL",    # qwen2.5:7b
        "temperature": 0.2,
    },
    "Gate": {
        "emoji": "🔐",
        "role": "Risk & Compliance Officer",
        "system_prompt": (
            "Kamu adalah Cubi Gate, penjaga validasi dan kepatuhan operasional tim sales Astra Motor. "
            "Tugasmu: memastikan setiap keputusan tim memenuhi standar etika bisnis, "
            "tidak ada klaim palsu atau misleading ke konsumen, dan risiko dikelola dengan tepat. "
            "Kamu kritis dan skeptis — selalu tanya 'apa risikonya jika ini salah?'. "
            "TIDAK PERNAH setujui pelabelan 'Ready' sebelum unit tiba fisik di showroom. "
            "Maksimal 3 kalimat. Sebut risiko spesifik dan syarat persetujuan."
        ),
        "model_env": "LOCAL_LLM_MODEL",    # qwen2.5:7b — cepat
        "temperature": 0.2,
    },
    "Scribe": {
        "emoji": "✍️",
        "role": "Outreach & Communication Specialist",
        "system_prompt": (
            "Kamu adalah Cubi Scribe, spesialis komunikasi dan penawaran tim sales Astra Motor Purwokerto. "
            "Tugasmu: menyusun draft pesan WhatsApp atau penawaran yang menarik, hangat, dan persuasif "
            "untuk prospek, berdasarkan konteks kebutuhan dan situasi stok saat ini. "
            "JANGAN pernah klaim unit 'Ready' kalau stok masih kosong — gunakan frasa jujur "
            "seperti 'dalam proses alokasi' atau 'konfirmasi ketersediaan'. "
            "Gaya bicara: ramah, personal, profesional. Maksimal 3 kalimat draft pesan."
        ),
        "model_env": "LOCAL_LLM_MODEL",    # qwen2.5:7b — cepat
        "temperature": 0.5,
    },
    "Commander": {
        "emoji": "👑",
        "role": "Strategic Sales Commander",
        "system_prompt": (
            "Kamu adalah Cubi Commander, pemimpin strategis tim agentic sales Astra Motor Purwokerto. "
            "Tugasmu: memimpin rapat tim, mendengarkan laporan tiap agen, mengevaluasi berbagai "
            "perspektif, lalu memberikan KEPUTUSAN FINAL yang tegas dan bisa langsung dieksekusi. "
            "Keputusanmu mencakup: apa yang harus dilakukan, siapa yang bertanggung jawab, "
            "dan apa target terukurnya. "
            "Gaya bicara: bijak, tegas, berorientasi hasil. "
            "Format output: awali dengan 'KEPUTUSAN:' lalu bullet point aksi konkret. Maksimal 4 kalimat."
        ),
        "model_env": "COMMANDER_LLM_MODEL",  # deepseek-r1:14b — deep reasoning
        "temperature": 0.3,
    },
}

# ==============================================================================
# SWARM STATE & LOGS
# ==============================================================================

swarm_state = {
    "is_autonomous_active": False,
    "interval_seconds": 25,
    "last_run": None,
    "cycles_completed": 0,
    "active_deliberations": [],
    "recent_restocks": []
}

deliberation_history: List[Dict[str, Any]] = []
_swarm_thread: Optional[threading.Thread] = None
_stop_event  = threading.Event()
_state_lock  = threading.Lock()

_external_logger = None

def set_external_logger(logger_fn):
    global _external_logger
    _external_logger = logger_fn

def log_swarm_event(agent: str, action: str, detail: str = ""):
    if _external_logger:
        try:
            _external_logger(agent, action, detail)
        except Exception:
            pass

# ==============================================================================
# HELPER: Panggil LLM dengan model yang sesuai persona agen
# ==============================================================================

def _call_agent_llm(persona_key: str, prompt: str, context: str = "") -> str:
    """
    Memanggil LLM dengan persona dan model yang sesuai untuk tiap agen.
    - Worker agents (Scout, Supply, Gate, Scribe): pakai LOCAL_LLM_MODEL (qwen2.5:7b)
    - Commander: pakai COMMANDER_LLM_MODEL (deepseek-r1:14b) untuk deep reasoning
    """
    persona = AGENT_PERSONAS.get(persona_key, AGENT_PERSONAS["Scout"])
    system_prompt = persona["system_prompt"]
    temperature   = persona["temperature"]
    model_env_key = persona["model_env"]

    # Inject konteks sebelumnya ke dalam prompt jika ada
    full_prompt = prompt
    if context:
        full_prompt = f"[Konteks rapat sebelumnya]:\n{context}\n\n[Tugasmu sekarang]:\n{prompt}"

    # Routing model: jika Commander diset beda model
    original_model = os.environ.get("LOCAL_LLM_MODEL", "qwen2.5:7b")
    target_model = original_model
    if model_env_key == "COMMANDER_LLM_MODEL":
        target_model = os.environ.get("COMMANDER_LLM_MODEL", original_model)
        os.environ["LOCAL_LLM_MODEL"] = target_model
    
    # Batasi max_tokens ringkas (80-120 token) agar respon super cepat (10-15 detik total)
    max_tok = 120 if persona_key == "Commander" else 80

    try:
        result = call_unified_llm(
            prompt=full_prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tok
        )
    finally:
        if model_env_key == "COMMANDER_LLM_MODEL":
            os.environ["LOCAL_LLM_MODEL"] = original_model

    # Bersihkan tag <think> jika model DeepSeek-R1 digunakan
    if result and "<think>" in result:
        import re
        result = re.sub(r"<think>.*?</think>", "", result, flags=re.DOTALL).strip()

    return result.strip() if result else ""

# ==============================================================================
# SENSORY: AUDIT KEBUTUHAN STOK & PERMINTAAN PROSPEK (CUBI SCOUT)
# ==============================================================================

def audit_stock_and_demand() -> List[Dict[str, Any]]:
    """
    Cubi Scout mengaudit korelasi antara antrean prospek dengan ketersediaan fisik stok.
    Mendeteksi 'Supply Gap': ada calon pembeli butuh motor, tapi stok di cabangnya 0 atau menipis.
    """
    if not os.path.exists(KATALOG_FILE) or not os.path.exists(STOK_FILE) or not os.path.exists(LEADS_FILE):
        return []

    katalog = {}
    with open(KATALOG_FILE, mode="r", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            katalog[r["id_produk"]] = r

    stok_map = {}
    with open(STOK_FILE, mode="r", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            pid    = r.get("id_produk")
            cabang = r.get("cabang", "").strip()
            qty    = int(r.get("stok_ready", "0"))
            stok_map[(pid, cabang)] = qty

    gaps = []
    with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
        for lead in csv.DictReader(f):
            status = lead.get("status_kontak", "pending").lower()
            if status not in ["pending", "warm", "hot"]:
                continue

            domisili   = lead.get("domisili", "Purwokerto Timur").strip()
            minat      = lead.get("minat_kebutuhan", "").lower()
            lead_id    = lead.get("id_lead") or lead.get("\ufeffid_lead", "")
            nama       = lead.get("nama_prospek", "Konsumen")

            matched_pid = "MTR-01"
            if "sporty" in minat or "kencang" in minat or "tenaga" in minat:
                matched_pid = "MTR-02"
            elif "touring" in minat or "maxi" in minat or "jarak jauh" in minat:
                matched_pid = "MTR-03"
            elif "lincah" in minat or "hemat" in minat or "irit" in minat or "murah" in minat:
                matched_pid = "MTR-01"
            else:
                best_score = 0
                for pid, item in katalog.items():
                    if item.get("kategori", "").lower().startswith("motor"):
                        segmen = item.get("segmen_kebutuhan", "").lower()
                        score  = sum(1 for w in minat.split() if w in segmen)
                        if score > best_score:
                            best_score  = score
                            matched_pid = pid

            matched_item  = katalog.get(matched_pid, {})
            current_stok  = stok_map.get((matched_pid, domisili), 0)

            if current_stok <= 1:
                gaps.append({
                    "lead_id":      lead_id,
                    "nama_prospek": nama,
                    "domisili":     domisili,
                    "minat":        minat,
                    "id_produk":    matched_pid,
                    "nama_barang":  matched_item.get("nama_barang", matched_pid),
                    "harga_otr":    int(matched_item.get("harga", 0)),
                    "current_stok": current_stok,
                    "urgency":      "CRITICAL_EMPTY" if current_stok == 0 else "LOW_STOCK"
                })

    return gaps

# ==============================================================================
# COUNCIL MEETING — Rapat Round Table 5 Agen (v2.0)
# ==============================================================================

def run_council_meeting(gap: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rapat Round Table otonom 5 agen dengan LLM persona masing-masing.

    Alur:
    [1] Scout   → briefing intel (LLM)
    [2] Supply  → laporan opsi pengadaan + negosiasi supplier (LLM)
    [3] Gate    → evaluasi risiko & syarat validasi (LLM)
    [4] Scribe  → draft komunikasi ke prospek (LLM)
    [5] Commander → keputusan final & ringkasan (LLM - model lebih besar)

    Tiap agen menerima konteks dari agen-agen sebelumnya.
    """
    product_name  = gap["nama_barang"]
    branch        = gap["domisili"]
    lead_name     = gap["nama_prospek"]
    lead_id       = gap["lead_id"]
    urgency       = gap["urgency"]
    harga_otr     = gap["harga_otr"]
    request_qty   = 2 if urgency == "CRITICAL_EMPTY" else 1
    timestamp     = datetime.now().strftime("%H:%M:%S")
    sj_code       = f"DO-ASTRA-{branch[:3].upper()}-{abs(hash(timestamp)) % 1000:03d}"
    harga_fmt     = f"Rp {harga_otr:,.0f}".replace(",", ".")

    turns = []
    running_context = ""  # Konteks akumulatif yang dibaca tiap agen berikutnya

    # ── TURN 1: SCOUT — Briefing Intel ────────────────────────────────────────
    scout_prompt = (
        f"Laporkan temuan Supply Gap berikut kepada tim: "
        f"Prospek '{lead_name}' ({lead_id}) di area {branch} membutuhkan unit {product_name} "
        f"(harga OTR {harga_fmt}). Stok saat ini: {gap['current_stok']} unit. "
        f"Status urgency: {urgency}. Minat prospek: {gap['minat']}. "
        f"Berikan briefing intel singkat untuk tim."
    )
    scout_msg = _call_agent_llm("Scout", scout_prompt)
    if not scout_msg:
        scout_msg = (
            f"Supply Gap terdeteksi: {lead_name} ({lead_id}) butuh {product_name} di {branch}. "
            f"Stok: {gap['current_stok']} unit — status {urgency}. "
            f"Potensi kehilangan SPK {harga_fmt} jika tidak diaksi segera."
        )
    turns.append({
        "speaker": "Scout",
        "emoji":   "🔭",
        "role":    "Field Intelligence Officer",
        "message": scout_msg
    })
    running_context += f"[Scout]: {scout_msg}\n"

    # ── TURN 2: SUPPLY — Negosiasi Pengadaan ──────────────────────────────────
    supply_prompt = (
        f"Berdasarkan laporan Scout, hubungi Pusat Distribusi Astra Motor untuk "
        f"mengajukan alokasi {request_qty} unit {product_name} ke cabang {branch}. "
        f"Sebutkan Surat Jalan yang akan diterbitkan ({sj_code}) dan estimasi pengiriman."
    )
    supply_msg = _call_agent_llm("Supply", supply_prompt, context=running_context)
    if not supply_msg:
        supply_msg = (
            f"Mengajukan permintaan alokasi {request_qty} unit {product_name} ke Astra Hub "
            f"untuk cabang {branch}. Nomor referensi: {sj_code}. "
            f"Meminta konfirmasi pengiriman ekspres hari ini."
        )
    turns.append({
        "speaker": "Supply",
        "emoji":   "💰",
        "role":    "Procurement & Supplier Negotiator",
        "message": supply_msg
    })
    running_context += f"[Supply]: {supply_msg}\n"

    # ── TURN 3: SUPPLIER HUB — Respons Resmi Pemasok ──────────────────────────
    supplier_prompt = (
        f"Cabang {branch} mengajukan permintaan alokasi {request_qty} unit {product_name}. "
        f"Konfirmasi persetujuan alokasi dengan Surat Jalan {sj_code} "
        f"dan sebutkan program promo bundling yang berlaku saat ini."
    )
    supplier_msg = _call_agent_llm("SupplierHub", supplier_prompt, context=running_context)
    if not supplier_msg:
        supplier_msg = (
            f"Alokasi {request_qty} unit {product_name} untuk cabang {branch} DISETUJUI "
            f"melalui Surat Jalan {sj_code} (Prioritas Logistik, ETA: hari ini). "
            f"Promo aktif: Paket Bundling Apparel Touring + Voucher Garansi Mesin Resmi 3 Tahun."
        )
    turns.append({
        "speaker": "Astra Distribution Hub",
        "emoji":   "🏭",
        "role":    "Central Supplier Authority",
        "message": supplier_msg
    })
    running_context += f"[Astra Hub]: {supplier_msg}\n"

    # ── TURN 4: GATE — Evaluasi Risiko & Validasi ─────────────────────────────
    gate_prompt = (
        f"Evaluasi keputusan pengadaan {request_qty} unit {product_name} untuk prospek "
        f"{lead_name} di {branch}. Pemasok sudah konfirmasi alokasi. "
        f"Apa risiko yang harus dikelola? Apa syarat agar tim boleh lanjut ke komunikasi konsumen?"
    )
    gate_msg = _call_agent_llm("Gate", gate_prompt, context=running_context)
    if not gate_msg:
        gate_msg = (
            f"SETUJU lanjut pengadaan, dengan syarat: unit TIDAK BOLEH dilabeli 'Ready' "
            f"ke {lead_name} sampai fisik unit terverifikasi tiba di showroom. "
            f"Komunikasi ke konsumen wajib gunakan frasa 'dalam proses alokasi' — bukan 'siap kirim'."
        )
    turns.append({
        "speaker": "Gate",
        "emoji":   "🔐",
        "role":    "Risk & Compliance Officer",
        "message": gate_msg
    })
    running_context += f"[Gate]: {gate_msg}\n"

    # ── TURN 5: SCRIBE — Draft Komunikasi Ke Prospek ──────────────────────────
    scribe_prompt = (
        f"Susun draft pesan WhatsApp untuk {lead_name} mengenai status unit {product_name} "
        f"yang sedang dalam proses alokasi. Ikuti arahan Gate: jujur soal status stok, "
        f"tawarkan booking slot agar posisi prospek aman, nada hangat dan persuasif."
    )
    scribe_msg = _call_agent_llm("Scribe", scribe_prompt, context=running_context)
    if not scribe_msg:
        scribe_msg = (
            f"Draft WA untuk {lead_name}: 'Halo Kak {lead_name}, kabar baik! "
            f"Unit {product_name} yang Kakak minati sedang dalam proses alokasi khusus dari pusat — "
            f"estimasi tiba 1–2 hari. Mau kami amankan slot unit untuk Kakak lebih dulu? "
            f"Cukup konfirmasi sekarang, kami langsung proses prioritas. 🙏'"
        )
    turns.append({
        "speaker": "Scribe",
        "emoji":   "✍️",
        "role":    "Outreach & Communication Specialist",
        "message": scribe_msg
    })
    running_context += f"[Scribe]: {scribe_msg}\n"

    # ── TURN 6: COMMANDER — Keputusan Final ───────────────────────────────────
    commander_prompt = (
        f"Pimpin rapat ini dan berikan keputusan strategis final. "
        f"Tim sudah lapor: stok kosong di {branch} untuk {product_name} milik prospek {lead_name}. "
        f"Pemasok sudah konfirmasi alokasi {request_qty} unit via {sj_code}. "
        f"Gate sudah beri arahan transparansi. Scribe sudah siapkan draft pesan. "
        f"Apa keputusan final dan langkah eksekusi konkret tim hari ini?"
    )
    commander_msg = _call_agent_llm("Commander", commander_prompt, context=running_context)
    if not commander_msg:
        commander_msg = (
            f"KEPUTUSAN: Lanjutkan pengadaan {request_qty} unit {product_name} via {sj_code}. "
            f"• Supply: follow-up konfirmasi DO sore ini ke Astra Hub. "
            f"• Scribe: kirim draft WA ke {lead_name} dalam 1 jam. "
            f"• Gate: monitor fisik unit tiba sebelum update status ke 'Ready'. "
            f"Target: 1 SPK closing minggu ini dari prospek {lead_name}."
        )
    turns.append({
        "speaker": "Commander",
        "emoji":   "👑",
        "role":    "Strategic Sales Commander",
        "message": commander_msg
    })

    # ── Susun hasil rapat lengkap ──────────────────────────────────────────────
    meeting_session = {
        "id":               f"meeting-{int(time.time() * 1000)}",
        "timestamp":        timestamp,
        "agenda":           f"Supply Gap: {product_name} — {branch}",
        "lead_target":      lead_id,
        "konsumen":         lead_name,
        "unit":             product_name,
        "cabang":           branch,
        "defisit":          urgency,
        "sj_code":          sj_code,
        "turns":            turns,
        "restock_approved": True,
        "restock_qty":      request_qty
    }

    return meeting_session

# ==============================================================================
# BACKWARD COMPAT: execute_supplier_negotiation → delegasi ke run_council_meeting
# ==============================================================================

def execute_supplier_negotiation(gap: Dict[str, Any]) -> Dict[str, Any]:
    """Alias backward-compatible ke run_council_meeting (dipanggil dari run_swarm_cycle)."""
    return run_council_meeting(gap)

# ==============================================================================
# ACTION: UPDATE DETERMINISTIK STOK CABANG CSV
# ==============================================================================

def apply_restock_update(product_id: str, branch: str, added_qty: int, persist_to_disk: bool = False) -> bool:
    if not os.path.exists(STOK_FILE):
        return False

    rows       = []
    fieldnames = ["id_produk", "cabang", "warna", "stok_ready", "status"]
    updated    = False

    with open(STOK_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            fieldnames = list(reader.fieldnames)
        for r in reader:
            pid    = r.get("id_produk")
            cab    = r.get("cabang", "").strip()
            if pid == product_id and cab.lower() == branch.lower():
                current   = int(r.get("stok_ready", 0))
                new_qty   = current + added_qty
                r["stok_ready"] = str(new_qty)
                r["status"]     = "Ready" if new_qty > 0 else "Kosong"
                updated = True
            rows.append(r)

    if not updated:
        new_row = {
            "id_produk":  product_id,
            "cabang":     branch,
            "stok_ready": str(added_qty),
            "status":     "Ready"
        }
        if "warna" in fieldnames:
            new_row["warna"] = "Standar"
        rows.append(new_row)

    if persist_to_disk:
        with open(STOK_FILE, mode="w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)

    return True

# ==============================================================================
# CYCLE RUNNER: SATU PUTARAN OTONOM PENUH (TICK)
# ==============================================================================

def run_swarm_cycle(trigger_source: str = "auto") -> Dict[str, Any]:
    """
    Menjalankan 1 putaran otonom tim agen:
    Audit Defisit → Council Meeting → Update Stok → Catat Log.
    """
    with _state_lock:
        timestamp_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        gaps          = audit_stock_and_demand()

        cycle_results = {
            "timestamp":              timestamp_now,
            "trigger":                trigger_source,
            "gaps_detected":          len(gaps),
            "deliberations_executed": [],
            "restocks_performed":     []
        }

        if not gaps:
            swarm_state["last_run"]        = timestamp_now
            swarm_state["cycles_completed"] += 1
            return cycle_results

        # Jalankan rapat untuk 2 gap paling mendesak per siklus
        for gap in gaps[:2]:
            meeting = run_council_meeting(gap)
            deliberation_history.insert(0, meeting)
            if len(deliberation_history) > 30:
                deliberation_history.pop()

            should_persist = (trigger_source == "integration_test")
            success = apply_restock_update(
                gap["id_produk"], gap["domisili"],
                meeting["restock_qty"], persist_to_disk=should_persist
            )
            if success:
                restock_info = {
                    "produk":    gap["nama_barang"],
                    "cabang":    gap["domisili"],
                    "added_qty": meeting["restock_qty"],
                    "for_lead":  gap["nama_prospek"]
                }
                cycle_results["restocks_performed"].append(restock_info)
                swarm_state["recent_restocks"].insert(0, restock_info)
                if len(swarm_state["recent_restocks"]) > 20:
                    swarm_state["recent_restocks"].pop()

                log_swarm_event(
                    "Council Meeting",
                    f"Rapat Selesai: {gap['nama_barang']} ({gap['domisili']})",
                    f"Commander memimpin rapat 5 agen. Alokasi +{meeting['restock_qty']} unit "
                    f"disetujui untuk prospek {gap['nama_prospek']}."
                )
                log_swarm_event(
                    "Gate",
                    f"Validasi Alokasi: {gap['nama_barang']} di {gap['domisili']}",
                    "Unit dalam jalur pengiriman. Status TIDAK dilabeli Ready sebelum verifikasi fisik showroom."
                )

            cycle_results["deliberations_executed"].append(meeting)

        swarm_state["last_run"]            = timestamp_now
        swarm_state["cycles_completed"]    += 1
        swarm_state["active_deliberations"] = deliberation_history[:5]

        return cycle_results

# ==============================================================================
# BACKGROUND DAEMON THREAD MANAGEMENT
# ==============================================================================

def _background_worker():
    """Thread background yang berdetak (heartbeat) secara berkala."""
    while not _stop_event.is_set():
        try:
            if swarm_state["is_autonomous_active"]:
                run_swarm_cycle(trigger_source="heartbeat")
        except Exception as e:
            print(f"[SWARM WORKER ERROR]: {e}")
        interval = swarm_state["interval_seconds"]
        _stop_event.wait(interval)

def start_swarm_background(interval: int = 25):
    """Mengaktifkan mode otonom tim agen."""
    global _swarm_thread
    with _state_lock:
        swarm_state["is_autonomous_active"] = True
        swarm_state["interval_seconds"]     = interval
        _stop_event.clear()

        if _swarm_thread is None or not _swarm_thread.is_alive():
            _swarm_thread = threading.Thread(
                target=_background_worker, daemon=True, name="AgenticSwarmWorker"
            )
            _swarm_thread.start()
            log_swarm_event(
                "System", "Swarm Council v2.0 Diaktifkan",
                f"5 agen dengan persona LLM aktif. Detak otonom setiap {interval} detik."
            )

def stop_swarm_background():
    """Menonaktifkan mode otonom ke mode manual."""
    with _state_lock:
        swarm_state["is_autonomous_active"] = False
        log_swarm_event("System", "Swarm Council Dinonaktifkan", "Sistem kembali ke mode reaktif manual.")

def get_swarm_telemetry() -> Dict[str, Any]:
    """Mengambil status telemetri lengkap tim agen."""
    with _state_lock:
        current_gaps = audit_stock_and_demand()
        return {
            "is_autonomous_active":    swarm_state["is_autonomous_active"],
            "interval_seconds":        swarm_state["interval_seconds"],
            "last_run":                swarm_state["last_run"],
            "cycles_completed":        swarm_state["cycles_completed"],
            "current_supply_gaps_count": len(current_gaps),
            "current_supply_gaps":     current_gaps,
            "recent_deliberations":    deliberation_history[:10],
            "recent_restocks":         swarm_state["recent_restocks"][:10],
            "agents": [
                {
                    "name":  key,
                    "emoji": val["emoji"],
                    "role":  val["role"],
                    "model": os.environ.get(val["model_env"], "qwen2.5:7b")
                }
                for key, val in AGENT_PERSONAS.items()
            ]
        }
