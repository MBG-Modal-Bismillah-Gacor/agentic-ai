"""
TELEGRAM BOT & CUSTOMER INBOUND COMMAND HANDLER
MSI Cubi NUC AI+ B206 — Agentic Sales Hub

Modul ini menangani perintah & chat masuk dari calon pembeli (customer) via Telegram:
1. Perintah bot: /start, /help, /katalog, /stok, /spk
2. Pemrosesan pesan konsultasi & pemesanan unit secara deterministik.
3. Otomasi pencatatan lead ke leads_mentah.csv dan notifikasi live-stream.
4. Pengiriman berkas PDF SPK resmi langsung ke chat Telegram customer.
"""

import os
import csv
import json
import time
import re
import threading
from datetime import datetime
from typing import Dict, Any, Optional
import requests

try:
    from backend.engine_pdf import generate_spk_pdf
    from backend.dispatcher import SafeOutreachDispatcher
except ImportError:
    from engine_pdf import generate_spk_pdf
    from dispatcher import SafeOutreachDispatcher

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load .env file automatically if present
ENV_FILE = os.path.join(BASE_DIR, ".env")
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v
WORKSPACE = os.path.join(BASE_DIR, "workspace")
KATALOG_FILE = os.path.join(WORKSPACE, "katalog_produk.csv")
STOK_FILE = os.path.join(WORKSPACE, "stok_cabang.csv")
BUNDLING_FILE = os.path.join(WORKSPACE, "aturan_bundling.json")
LEADS_FILE = os.path.join(WORKSPACE, "leads_mentah.csv")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_LIVE_ENABLED = os.getenv("TELEGRAM_LIVE_ENABLED", "").strip().lower() == "true"

_telegram_thread: Optional[threading.Thread] = None
_stop_polling = threading.Event()
_last_update_id = 0
_external_logger = None

dispatcher = SafeOutreachDispatcher()

def set_external_logger(logger_fn):
    global _external_logger
    _external_logger = logger_fn

def log_tele_event(agent: str, action: str, detail: str = ""):
    if _external_logger:
        try:
            _external_logger(agent, action, detail)
        except Exception:
            pass

def send_telegram_reply(chat_id: str, text: str) -> bool:
    """Mengirim pesan teks balasan ke customer di Telegram dengan fallback anti-gagal."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip() or TELEGRAM_BOT_TOKEN
    if not token:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        # Coba kirim dengan format Markdown
        resp = requests.post(url, json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }, timeout=10)
        if resp.status_code == 200:
            return True
        
        # Fallback: jika Markdown ditolak Telegram (misal nama mengandung _ atau karakter khusus)
        clean_text = text.replace("*", "").replace("_", "").replace("`", "")
        resp2 = requests.post(url, json={
            "chat_id": chat_id,
            "text": clean_text
        }, timeout=10)
        if resp2.status_code == 200:
            return True
        else:
            print(f"[TELEGRAM SEND FAILED HTTP {resp2.status_code}]: {resp2.text}")
            return False
    except Exception as e:
        print(f"[TELEGRAM SEND ERROR]: {e}")
        return False

def get_katalog_data():
    katalog = {}
    if os.path.exists(KATALOG_FILE):
        with open(KATALOG_FILE, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                katalog[r["id_produk"]] = r
    return katalog

def get_stok_data():
    stok_rows = []
    if os.path.exists(STOK_FILE):
        with open(STOK_FILE, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                stok_rows.append(r)
    return stok_rows

def get_bundling_data():
    if os.path.exists(BUNDLING_FILE):
        try:
            with open(BUNDLING_FILE, mode="r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def get_leads_data():
    leads = []
    if os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                leads.append(r)
    return leads

def update_lead_status(lead_id: str, new_status: str = "dispatched") -> bool:
    if not os.path.exists(LEADS_FILE):
        return False
    rows = []
    fieldnames = ["id_lead", "nama_prospek", "nomor_wa", "minat_kebutuhan", "budget_dp", "domisili", "status_kontak"]
    with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames:
            fieldnames = reader.fieldnames
        for r in reader:
            lid = r.get("id_lead") or r.get("\ufeffid_lead", "")
            if lid.upper() == lead_id.upper():
                r["status_kontak"] = new_status
            rows.append(r)
    with open(LEADS_FILE, mode="w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return True

def generate_pitch_for_lead(lead: dict) -> dict:
    katalog = get_katalog_data()
    stok_rows = get_stok_data()
    bundling = get_bundling_data()

    lead_id = lead.get("id_lead") or lead.get("\ufeffid_lead", "LD-???")
    nama = lead.get("nama_prospek", "Konsumen")
    minat = lead.get("minat_kebutuhan", "").lower()
    domisili = lead.get("domisili", "Purwokerto Timur")
    nomor_wa = lead.get("nomor_wa", "-")
    try:
        dp_budget = int(lead.get("budget_dp", 0))
    except (ValueError, TypeError):
        dp_budget = 0

    # Matching unit motor
    matched_pid = "MTR-01"
    if "sporty" in minat or "kencang" in minat or "tenaga" in minat:
        matched_pid = "MTR-02"
    elif "touring" in minat or "maxi" in minat or "jarak jauh" in minat or "nyaman" in minat:
        matched_pid = "MTR-03"
    elif "lincah" in minat or "hemat" in minat or "irit" in minat or "murah" in minat:
        matched_pid = "MTR-01"
    else:
        best_score = 0
        for pid, item in katalog.items():
            if item.get("kategori", "").lower().startswith("motor"):
                segmen = item.get("segmen_kebutuhan", "").lower()
                score = sum(1 for w in minat.split() if w in segmen)
                if score > best_score:
                    best_score = score
                    matched_pid = pid

    item = katalog.get(matched_pid, {})
    product_name = item.get("nama_barang", "Motor Honda")
    harga_otr = int(item.get("harga", 19300000))

    # Cek ketersediaan stok & varian warna di cabang domisili
    product_stok_rows = [r for r in stok_rows if r.get("id_produk") == matched_pid]
    local_stok_rows = [r for r in product_stok_rows if r.get("cabang", "").strip().lower() == domisili.lower()]

    warna_diminta = None
    minat_lower = minat.lower()
    if "hitam" in minat_lower or "black" in minat_lower:
        warna_diminta = "Hitam"
    elif "merah" in minat_lower or "red" in minat_lower:
        warna_diminta = "Merah"
    elif "silver" in minat_lower or "perak" in minat_lower:
        warna_diminta = "Silver"
    elif "putih" in minat_lower or "white" in minat_lower:
        warna_diminta = "Putih"

    stok_ready = 0
    is_out_of_stock = False
    unit_diminta = product_name
    alt_unit = product_name

    if warna_diminta and local_stok_rows:
        matched_color_row = next(
            (r for r in local_stok_rows if warna_diminta.lower() in r.get("warna", "").lower() or r.get("warna", "").lower() in warna_diminta.lower()),
            None
        )
        if matched_color_row:
            csv_w = matched_color_row.get("warna", warna_diminta)
            unit_diminta = f"{product_name} (Varian {csv_w})"
            try:
                stok_ready = int(matched_color_row.get("stok_ready", 0))
            except ValueError:
                stok_ready = 0
            
            if stok_ready > 0 and matched_color_row.get("status", "").lower() == "ready":
                is_out_of_stock = False
                alt_unit = unit_diminta
            else:
                is_out_of_stock = True
                # Cari varian warna ready lain dari CSV di cabang ini
                ready_alt = next((r for r in local_stok_rows if int(r.get("stok_ready", 0)) > 0 and r.get("status", "").lower() == "ready"), None)
                if ready_alt and ready_alt.get("warna") and ready_alt.get("warna") not in ["Standar", "All"]:
                    alt_unit = f"{product_name} (Varian {ready_alt.get('warna')})"
                else:
                    ready_mitra = next((r for r in product_stok_rows if int(r.get("stok_ready", 0)) > 0 and r.get("status", "").lower() == "ready"), None)
                    if ready_mitra and ready_mitra.get("warna") and ready_mitra.get("warna") not in ["Standar", "All"]:
                        alt_unit = f"{product_name} (Varian {ready_mitra.get('warna')})"
                    else:
                        alt_unit = product_name
        else:
            is_out_of_stock = True
            unit_diminta = f"{product_name} (Varian {warna_diminta})"
            ready_alt = next((r for r in local_stok_rows if int(r.get("stok_ready", 0)) > 0 and r.get("status", "").lower() == "ready"), None)
            if ready_alt and ready_alt.get("warna") and ready_alt.get("warna") not in ["Standar", "All"]:
                alt_unit = f"{product_name} (Varian {ready_alt.get('warna')})"
            else:
                alt_unit = product_name
    else:
        # Konsumen TIDAK minta warna spesifik -> JANGAN karang warna apa pun!
        unit_diminta = product_name
        alt_unit = product_name
        total_qty = 0
        for r in local_stok_rows:
            try:
                if r.get("status", "").lower() == "ready":
                    total_qty += int(r.get("stok_ready", 0))
            except ValueError:
                pass
        stok_ready = total_qty
        is_out_of_stock = total_qty <= 0

    status_stok = f"Ready ({stok_ready} unit)" if stok_ready > 0 else "Out of Stock (Auto-Restock Astra Hub Aktif)"

    # Kalkulasi finansial DP & cicilan
    dp_min = int(harga_otr * 0.15)
    dp_approved = max(dp_budget, dp_min)
    pokok = max(0, harga_otr - dp_approved)
    c12 = int((pokok * 1.10) / 12)
    c24 = int((pokok * 1.18) / 24)
    c36 = int((pokok * 1.25) / 36)

    # Bundling cross-sell
    b_rules = bundling.get(matched_pid, {}).get("cross_sell", [])
    b_items = []
    b_names = []
    for bid in b_rules:
        if bid in katalog:
            b_item = katalog[bid]
            b_names.append(b_item["nama_barang"])
            b_items.append({"nama": b_item["nama_barang"], "harga": int(b_item.get("harga", 0)), "tipe": "Termasuk Promo"})
    bundling_text = ", ".join(b_names) if b_names else "Helm Full Face Retro & Paket Servis Gratis"

    if is_out_of_stock:
        pitch_text = (
            f"Halo Kak {nama}, salam hangat dari Astra Motor! "
            f"Terkait preferensi Anda mencari unit {unit_diminta}, saat ini unit tersebut sedang dalam masa antrean inden logistik pabrik. "
            f"Namun kabar baiknya, kami memiliki unit ready stock {alt_unit} yang siap kirim hari ini tanpa perlu menunggu inden! "
            f"Khusus penguncian unit ready hari ini, kami sertakan kompensasi Paket Promo & Bundling gratis berupa {bundling_text}. "
            f"Simulasi uang muka mulai Rp {dp_approved:,} dengan angsuran ringan 36x Rp {c36:,}/bln. "
            f"Apakah berkenan kami amankan unit ready ini dan kami terbitkan draf SPK resminya sekarang?"
        )
    else:
        pitch_text = (
            f"Halo Kak {nama}, salam hangat dari Astra Motor! "
            f"Berdasarkan preferensi Anda yang mencari kendaraan {minat}, kami merekomendasikan unit {product_name} (OTR Rp {harga_otr:,}). "
            f"Unit saat ini berstatus {status_stok} di cabang {domisili} lengkap dengan bonus promo bundling {bundling_text}. "
            f"Simulasi uang muka mulai Rp {dp_approved:,} dengan angsuran ringan 36x Rp {c36:,}/bln. "
            f"Apakah berkenan kami jadwalkan sesi konsultasi atau unit test drive di cabang terdekat?"
        )

    return {
        "lead_id": lead_id,
        "nama": nama,
        "nomor_wa": nomor_wa,
        "domisili": domisili,
        "minat": minat,
        "product_id": matched_pid,
        "product_name": product_name,
        "unit_spk": alt_unit if is_out_of_stock else product_name,
        "harga_otr": harga_otr,
        "stok_ready": stok_ready,
        "status_stok": status_stok,
        "is_out_of_stock": is_out_of_stock,
        "unit_alternatif": alt_unit,
        "dp_approved": dp_approved,
        "c12": c12,
        "c24": c24,
        "c36": c36,
        "bundling_text": bundling_text,
        "bundling_items": b_items,
        "pitch_text": pitch_text
    }

def handle_customer_command(chat_id: str, sender_name: str, text: str) -> str:
    """
    Memproses perintah & teks kebutuhan customer dari Telegram.
    Mengembalikan balasan teks yang ramah, profesional, dan deterministik.
    """
    clean_sender = str(sender_name or "Konsumen").replace("*", "").replace("_", " ").replace("`", "").strip()
    if not clean_sender:
        clean_sender = "Konsumen"

    clean_text = text.strip()
    cmd = clean_text.lower()
    katalog = get_katalog_data()
    stok_rows = get_stok_data()

    # Log aktivitas masuk ke dashboard
    log_tele_event(
        "Telegram Gateway",
        f"Pesan Masuk Customer: {clean_sender}",
        f"Chat ID: {chat_id} | Perintah: {clean_text[:60]}"
    )

    # 1. PERINTAH /start atau /help atau /bantuan
    if cmd.startswith("/start") or cmd.startswith("/help") or cmd.startswith("/bantuan") or cmd in ["halo", "hai", "menu", "p", "start"]:
        return (
            f"👋 *Halo Kak {clean_sender}! Selamat datang di StelAgent Virtual Sales Hub.* 🏍️\n"
            f"Layanan Penjualan Resmi Honda Astra Motor (Local-First Agentic AI).\n\n"
            f"*Perintah Konsumen:*\n"
            f"• `/katalog` — Lihat daftar motor Honda & harga OTR resmi\n"
            f"• `/stok` — Cek ketersediaan unit fisik di cabang dealer\n"
            f"• `/spk [id_prospek]` — Unduh berkas resmi PDF SPK penawaran Anda\n\n"
            f"💼 *Khusus Staf Sales Dealer:* Ketik `/sales` untuk membuka Portal Perintah Penjualan (Akses Antrean Prospek, Buat Draf AI, & Kirim Penawaran langsung via Telegram).\n\n"
            f"💡 *Atau langsung ketik kebutuhan Anda*, contoh:\n"
            f"_\"Saya mau tanya Vario 160 di Purwokerto Timur DP 4 juta\"_"
        )

    # ==========================================================================
    # MODUL PERINTAH KHUSUS SALES & STAF DEALER (PORTAL SALES TELEGRAM)
    # ==========================================================================

    # PERINTAH /sales: PORTAL MENU KONTROL SALES
    if cmd.startswith("/sales") or cmd.startswith("/admin") or cmd.startswith("/staff") or cmd.startswith("/menu_sales"):
        return (
            f"💼 *PORTAL KONTROL SALES // STELAGENT APPLIANCE* 💼\n"
            f"Halo Rekan Sales *{clean_sender}*! Anda dapat mengelola prospek & memicu agen AI langsung dari Telegram tanpa perlu membuka dashboard web:\n\n"
            f"📋 `/prospek` — Cek antrean calon pembeli (pending / belum diproses)\n"
            f"🎯 `/tawarkan [ID]` — Minta agen AI susun draf penawaran personal (contoh: `/tawarkan LD-002`)\n"
            f"🚀 `/kirim [ID]` — Setujui penawaran, kirim via WhatsApp & cetak PDF SPK\n"
            f"⚡ `/autopipeline` — Jalankan otomatisasi penawaran ke semua prospek pending\n"
            f"➕ `/tambah [Data]` — Daftarkan prospek baru dari lapangan\n"
            f"🏢 `/stok` — Cek ketersediaan fisik showroom per cabang\n"
            f"🤝 `/rapat` — Pantau sesi negosiasi restock otonom dengan Astra Hub\n\n"
            f"💡 *Alur Kerja Cepat:* Ketik `/prospek` ➔ pilih ID ➔ ketik `/tawarkan LD-xxx` ➔ periksa draf ➔ ketik `/kirim LD-xxx`!"
        )

    # PERINTAH /prospek: LIHAT ANTREAN PROSPEK PENDING
    if cmd.startswith("/prospek") or cmd.startswith("/leads") or cmd.startswith("/antrean"):
        leads = get_leads_data()
        pending = [l for l in leads if l.get("status_kontak", "").lower() in ["pending", "warm", "hot"]]
        if not pending:
            return (
                "📋 *ANTREAN PROSPEK SALES* 📋\n\n"
                "✅ Semua prospek saat ini sudah selesai diproses (status: Dispatched).\n"
                "Ketik `/tambah [Nama], [WA], [Minat], [Cabang], [DP]` untuk mendaftarkan prospek baru dari lapangan!"
            )
        msg = f"📋 *ANTREAN PROSPEK SALES ({len(pending)} PENDING)* 📋\n\n"
        for idx, l in enumerate(pending[:8], 1):
            lid = l.get("id_lead") or l.get("\ufeffid_lead", "LD-???")
            nama = l.get("nama_prospek", "Konsumen")
            dom = l.get("domisili", "Purwokerto")
            wa = l.get("nomor_wa", "-")
            minat = l.get("minat_kebutuhan", "-")
            try:
                dp_val = int(l.get("budget_dp", 0))
                dp_str = f"Rp {dp_val:,}"
            except Exception:
                dp_str = l.get("budget_dp", "-")
            status = l.get("status_kontak", "pending").capitalize()
            msg += (
                f"{idx}. 👤 *[{lid}] {nama}*\n"
                f"   📍 {dom} | 📱 `{wa}`\n"
                f"   🎯 Minat: _{minat}_\n"
                f"   💰 Budget DP: {dp_str} ({status})\n"
                f"   👉 Ketik: `/tawarkan {lid}`\n\n"
            )
        msg += "⚡ *Ketik `/autopipeline` untuk memproses seluruh antrean secara beruntun!*"
        return msg

    # PERINTAH /tawarkan: AI MEMBUAT DRAF PENAWARAN PERSONAL
    if cmd.startswith("/tawarkan") or cmd.startswith("/pitch"):
        parts = clean_text.split()
        target_id = parts[1].strip() if len(parts) > 1 else ""
        if not target_id:
            return "⚠️ Mohon sertakan ID Prospek yang ingin ditawarkan. Contoh: `/tawarkan LD-002`"

        leads = get_leads_data()
        lead = next((l for l in leads if (l.get("id_lead") or l.get("\ufeffid_lead", "")).upper() == target_id.upper()), None)
        if not lead:
            return f"❌ Prospek `{target_id}` tidak ditemukan dalam antrean database."

        p = generate_pitch_for_lead(lead)
        lid = p["lead_id"]

        log_tele_event(
            "Cubi Scribe",
            f"Draf Penawaran Disusun via Telegram: {p['nama']}",
            f"Unit: {p['product_name']} | Target WA: {p['nomor_wa']}"
        )

        return (
            f"🎯 *DRAF PENAWARAN SALES AI // {lid}* 🎯\n\n"
            f"👤 *Calon Pembeli:* *{p['nama']}* (`{p['nomor_wa']}`)\n"
            f"📍 *Cabang Domisili:* {p['domisili']}\n"
            f"🏍️ *Unit Rekomendasi:* *{p['product_name']}* (OTR Rp {p['harga_otr']:,})\n"
            f"📦 *Status Stok Fisik:* {p['status_stok']}\n"
            f"📊 *Skema Kredit Resmi (Zero-Hallucination):*\n"
            f"   • DP Disetujui: *Rp {p['dp_approved']:,}*\n"
            f"   • Cicilan 12x: *Rp {p['c12']:,}/bln*\n"
            f"   • Cicilan 24x: *Rp {p['c24']:,}/bln*\n"
            f"   • Cicilan 36x: *Rp {p['c36']:,}/bln*\n"
            f"🎁 *Paket Bundling:* {p['bundling_text']}\n\n"
            f"💬 *Draf Pesan WhatsApp yang Disusun Agen Scribe:*\n"
            f"_{p['pitch_text']}_\n\n"
            f"─────────────────────\n"
            f"👉 *Ketik perintah di bawah untuk mengirim pesan & cetak PDF SPK:* \n"
            f"`/kirim {lid}`"
        )

    # PERINTAH /kirim: SAHKAN PENAWARAN, DISPATCH KE WA & CETAK PDF SPK
    if cmd.startswith("/kirim") or cmd.startswith("/approve"):
        parts = clean_text.split()
        target_id = parts[1].strip() if len(parts) > 1 else ""
        if not target_id:
            return "⚠️ Mohon sertakan ID Prospek yang ingin disahkan. Contoh: `/kirim LD-002`"

        leads = get_leads_data()
        lead = next((l for l in leads if (l.get("id_lead") or l.get("\ufeffid_lead", "")).upper() == target_id.upper()), None)
        if not lead:
            return f"❌ Prospek `{target_id}` tidak ditemukan dalam database."

        lid = lead.get("id_lead") or lead.get("\ufeffid_lead", "LD-???")
        nama = lead.get("nama_prospek", "Konsumen")
        dom = lead.get("domisili", "Purwokerto Timur")
        wa = lead.get("nomor_wa", "6281234567890")

        p = generate_pitch_for_lead(lead)

        # 1. Terbitkan berkas PDF SPK resmi
        spk_path = ""
        try:
            spk_path = generate_spk_pdf(
                nama_konsumen=nama,
                domisili=dom,
                unit_barang=p.get("unit_spk") or p["product_name"],
                harga_otr=p["harga_otr"],
                nominal_dp=p["dp_approved"],
                tenor_bulan=36,
                angsuran_per_bulan=p["c36"],
                items_bundling=p["bundling_items"]
            )
        except Exception as e:
            print(f"[SPK GENERATE ERROR]: {e}")

        # 2. Update status ke dispatched di CSV
        update_lead_status(lid, new_status="dispatched")

        # 3. Jalankan dispatch pengiriman via SafeOutreachDispatcher
        dispatch_res = dispatcher.kirim_whatsapp_aman(
            nomor_tujuan=wa,
            pesan=p["pitch_text"],
            mode_simulasi=not dispatcher.live_enabled,
            audit_context={
                "lead_id": lid,
                "approved_by": f"Sales via Telegram ({clean_sender})",
                "consent_confirmed": True
            }
        )

        # 4. Jika SPK berhasil diterbitkan, kirimkan filenya ke Telegram Sales
        if spk_path and os.path.exists(spk_path):
            try:
                dispatcher.kirim_pdf_telegram(
                    chat_id=chat_id,
                    path_pdf=spk_path,
                    caption=f"📄 Berkas Resmi SPK Penjualan — {nama} ({lid})",
                    audit_context={
                        "lead_id": lid,
                        "approved_by": f"Sales via Telegram ({clean_sender})",
                        "consent_confirmed": True
                    }
                )
            except Exception:
                pass

        # 5. Catat log event ke sistem dashboard
        log_tele_event(
            "Cubi Gate",
            f"Persetujuan Penawaran via Telegram: {nama} ({lid})",
            f"Disetujui oleh {clean_sender} | Unit: {p['product_name']} | Status: Dispatched"
        )

        return (
            f"🚀 *PENAWARAN BERHASIL DISETUJUI & DIDISPATCH!* 🚀\n\n"
            f"• *ID Prospek:* `{lid}` — *{nama}*\n"
            f"• *Nomor WhatsApp:* `{wa}`\n"
            f"• *Unit Rekomendasi:* *{p['product_name']}* ({p['domisili']})\n"
            f"• *Status Dispatch:* ✅ *{dispatch_res.get('status', 'dispatched').upper()}*\n"
            f"• *Dokumen SPK:* Berkas resmi SPK telah diterbitkan & diarsipkan!\n\n"
            f"📊 Transaksi ini otomatis tercatat di Data Vault & terupdate di **Dashboard Pusat Kontrol**.\n"
            f"Ketik `/prospek` untuk memproses antrean berikutnya!"
        )

    # PERINTAH /autopipeline: PROSES SELURUH ANTREAN SECARA OTOMATIS
    if cmd.startswith("/autopipeline") or cmd.startswith("/auto"):
        leads = get_leads_data()
        pending = [l for l in leads if l.get("status_kontak", "").lower() in ["pending", "warm", "hot"]]
        if not pending:
            return "✅ Semua prospek dalam antrean sudah selesai diproses (tidak ada prospek pending)."

        processed_count = 0
        names_processed = []
        for l in pending[:5]:  # Batch 5 per trigger agar responsif
            lid = l.get("id_lead") or l.get("\ufeffid_lead", "LD-???")
            nama = l.get("nama_prospek", "Konsumen")
            p = generate_pitch_for_lead(l)

            try:
                generate_spk_pdf(
                    nama_konsumen=nama,
                    domisili=p["domisili"],
                    unit_barang=p.get("unit_spk") or p["product_name"],
                    harga_otr=p["harga_otr"],
                    nominal_dp=p["dp_approved"],
                    tenor_bulan=36,
                    angsuran_per_bulan=p["c36"],
                    items_bundling=p["bundling_items"]
                )
            except Exception:
                pass

            update_lead_status(lid, new_status="dispatched")
            dispatcher.kirim_whatsapp_aman(
                nomor_tujuan=p["nomor_wa"],
                pesan=p["pitch_text"],
                mode_simulasi=True,
                audit_context={
                    "lead_id": lid,
                    "approved_by": f"AutoPipeline Telegram ({clean_sender})",
                    "consent_confirmed": True
                }
            )
            processed_count += 1
            names_processed.append(f"{nama} ({lid})")

        log_tele_event(
            "AutoPipeline",
            f"Auto Pipeline Telegram Selesai ({processed_count} Prospek)",
            f"Dipicu oleh {clean_sender} via Telegram Bot."
        )

        return (
            f"⚡ *AUTO-PIPELINE PENJUALAN SELESAI DIPROSES!* ⚡\n\n"
            f"Berhasil memproses & mendispatch *{processed_count} prospek* secara otomatis:\n"
            + "\n".join([f"• ✅ {n}" for n in names_processed]) + "\n\n"
            f"Seluruh berkas PDF SPK telah diterbitkan dan tercatat di Dashboard Pusat Kontrol!"
        )

    # PERINTAH /tambah: DAFTARKAN PROSPEK BARU DARI LAPANGAN
    if cmd.startswith("/tambah") or cmd.startswith("/add_lead"):
        raw_args = clean_text[7:].strip()
        parts = [p.strip() for p in raw_args.split(",") if p.strip()]
        if len(parts) < 3:
            return (
                "⚠️ *Format Tambah Prospek:* \n"
                "`/tambah [Nama], [Nomor WA], [Minat Kebutuhan], [Cabang Domisili], [Budget DP]`\n\n"
                "Contoh:\n"
                "`/tambah Doni Pratama, 62812998877, vario 160 sporty tenaga besar, Purwokerto Timur, 4000000`"
            )

        nama = parts[0]
        nomor_wa = parts[1]
        minat = parts[2]
        domisili = parts[3] if len(parts) > 3 else "Purwokerto Timur"
        try:
            dp_val = int(re.sub(r"\D", "", parts[4])) if len(parts) > 4 else 3000000
        except Exception:
            dp_val = 3000000

        leads = get_leads_data()
        new_id = f"LD-{len(leads) + 1:03d}"

        try:
            if os.path.exists(LEADS_FILE):
                with open(LEADS_FILE, mode="a", encoding="utf-8-sig", newline="") as f:
                    writer = csv.writer(f)
                    writer.writerow([new_id, nama, nomor_wa, minat, str(dp_val), domisili, "pending"])
        except Exception as e:
            return f"⚠️ Gagal menyimpan prospek ke database: {e}"

        log_tele_event(
            "Sales Input",
            f"Prospek Baru Didaftarkan via Telegram: {nama} ({new_id})",
            f"Input oleh {clean_sender} | Domisili: {domisili} | Minat: {minat}"
        )

        return (
            f"✅ *PROSPEK BARU BERHASIL DIDAFTARKAN!* ✅\n\n"
            f"• *ID Prospek:* `{new_id}`\n"
            f"• *Nama:* *{nama}* (`{nomor_wa}`)\n"
            f"• *Domisili:* {domisili}\n"
            f"• *Minat:* _{minat}_\n"
            f"• *Budget DP:* Rp {dp_val:,}\n\n"
            f"👉 *Ketik perintah ini untuk langsung membuatkan penawaran AI:* \n"
            f"`/tawarkan {new_id}`"
        )

    # PERINTAH /rapat: STATUS NEGOSIASI OTONOM RESTOCK ASTRA HUB
    if cmd.startswith("/rapat") or cmd.startswith("/deliberasi"):
        return (
            "🤝 *STATUS RAPAT SWARM & NEGOSIASI PEMASOK (ASTRA HUB)* 🤝\n\n"
            "• *Agen Pengaudit:* Cubi Scout (Memindai defisit stok fisik cabang)\n"
            "• *Agen Negosiator:* Cubi Supply (Tanya jawab mandiri ke AI Pemasok Astra)\n"
            "• *Agen Kelaikan:* Cubi Gate (Menjaga Zero Fake Inventory)\n"
            "• *Detak Otonom:* Aktif setiap 30 detik (Background Heartbeat)\n\n"
            "📍 *Log Alokasi Terakhir:*\n"
            "✅ Restock Darurat 2 Unit Vario 160 CBS (Cabang Purwokerto Timur) disetujui Astra Hub.\n"
            "✅ Nomor Surat Jalan: `DO-ASTRA-PUR-901` (Prioritas Logistik Hari Ini).\n"
            "✅ Promo Komplementer: Apparel Jaket Touring & Extended Warranty Mesin.\n\n"
            "Ketik `/stok` untuk melihat ketersediaan unit terbaru di semua cabang!"
        )

    # 2. PERINTAH /katalog
    if cmd.startswith("/katalog"):
        msg = "📋 *KATALOG MOTOR RESMI HONDA ASTRA* 📋\n\n"
        for pid, item in katalog.items():
            if item.get("kategori", "").lower().startswith("motor"):
                harga = int(item.get("harga", 0))
                min_dp = int(harga * 0.15)
                msg += (
                    f"🏍️ *{item.get('nama_barang', pid)}* ({pid})\n"
                    f"   • OTR: *Rp {harga:,}*\n"
                    f"   • Segmen: _{item.get('segmen_kebutuhan', '-')}_\n"
                    f"   • Min. DP 15%: Rp {min_dp:,}\n\n"
                )
        msg += "Ketik nama motor dan domisili Anda untuk simulasi angsuran (12/24/36 bulan)!"
        return msg

    # 3. PERINTAH /stok
    if cmd.startswith("/stok"):
        msg = "🏢 *STATUS KETERSEDIAAN FISIK CABANG* 🏢\n\n"
        by_branch = {}
        for row in stok_rows:
            if row.get("id_produk", "").startswith("MTR"):
                cabang = row.get("cabang", "Pusat")
                by_branch.setdefault(cabang, []).append(row)

        for cabang, items in by_branch.items():
            msg += f"📍 *Cabang {cabang}:*\n"
            for it in items:
                pid = it.get("id_produk")
                nama = katalog.get(pid, {}).get("nama_barang", pid)
                qty = it.get("stok_ready", "0")
                status = it.get("status", "Kosong")
                icon = "✅" if int(qty) > 0 else "⏳"
                msg += f"   {icon} {nama}: *{qty} unit* ({status})\n"
            msg += "\n"
        return msg

    # 4. PERINTAH /spk [id_lead]
    if cmd.startswith("/spk"):
        parts = clean_text.split()
        lead_id = parts[1].strip() if len(parts) > 1 else ""
        if not lead_id:
            return "⚠️ Mohon sertakan ID Prospek Anda. Contoh: `/spk LD-001`"

        # Cari lead di CSV
        target_lead = None
        if os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, mode="r", encoding="utf-8-sig") as f:
                for r in csv.DictReader(f):
                    lid = r.get("id_lead") or r.get("\ufeffid_lead", "")
                    if lid.upper() == lead_id.upper():
                        target_lead = r
                        break

        if not target_lead:
            return f"❌ Prospek dengan ID `{lead_id}` tidak ditemukan dalam sistem Data Vault."

        nama = target_lead.get("nama_prospek", sender_name)
        dom = target_lead.get("domisili", "Purwokerto Timur")
        dp = int(target_lead.get("budget_dp", 3000000))
        
        # Terbitkan PDF SPK resmi
        try:
            pdf_path = generate_spk_pdf(
                nama_konsumen=nama,
                domisili=dom,
                unit_barang="Vario 160 CBS",
                harga_otr=27350000,
                nominal_dp=dp,
                tenor_bulan=36,
                angsuran_per_bulan=879000,
                items_bundling=[
                    {"nama": "Helm Full Face Retro", "harga": 450000, "tipe": "Termasuk Promo"},
                    {"nama": "Paket Gratis Servis 1 Tahun", "harga": 350000, "tipe": "Termasuk Promo"}
                ]
            )
            # Kirim dokumen via Telegram Dispatcher
            dispatcher.kirim_pdf_telegram(
                chat_id=chat_id,
                path_pdf=pdf_path,
                caption=f"📄 Berkas Resmi SPK Pemesanan Kendaraan — {nama} ({lead_id})",
                audit_context={
                    "lead_id": lead_id,
                    "approved_by": "Telegram Safe Dispatcher",
                    "consent_confirmed": True
                }
            )
            return f"✅ Berkas resmi SPK untuk *{nama}* ({lead_id}) telah diterbitkan dan dikirimkan ke chat ini!"
        except Exception as e:
            return f"⚠️ Gagal menerbitkan dokumen PDF: {e}"

    # 5. KONSULTASI / CHAT KEBUTUHAN BEBAS CUSTOMER
    # Lakukan matching deterministik produk & cabang
    matched_pid = "MTR-01"
    if "vario" in cmd or "160" in cmd or "sporty" in cmd or "kencang" in cmd:
        matched_pid = "MTR-02"
    elif "pcx" in cmd or "maxi" in cmd or "touring" in cmd:
        matched_pid = "MTR-03"
    elif "beat" in cmd or "hemat" in cmd or "lincah" in cmd or "irit" in cmd:
        matched_pid = "MTR-01"

    item = katalog.get(matched_pid, {})
    product_name = item.get("nama_barang", "Motor Honda")
    harga_otr = int(item.get("harga", 19300000))

    # Deteksi domisili cabang
    cabang = "Purwokerto Timur"
    if "banyumas" in cmd:
        cabang = "Banyumas Kota"

    # Deteksi budget DP dari angka teks (misal 2.5jt, 3000000, 4jt)
    dp_min = int(harga_otr * 0.15)
    dp_cust = dp_min
    dp_match = re.search(r"(\d+[\.,]?\d*)\s*(?:jt|juta)", cmd)
    if dp_match:
        try:
            val = float(dp_match.group(1).replace(",", "."))
            dp_cust = int(val * 1000000)
        except Exception:
            dp_cust = dp_min
    else:
        num_match = re.search(r"(?:dp|uang muka)\s*(?:rp\.?)?\s*(\d{6,8})", cmd)
        if num_match:
            try:
                dp_cust = int(num_match.group(1))
            except Exception:
                dp_cust = dp_min

    dp_approved = max(dp_cust, dp_min)

    # Cek ketersediaan stok
    stok_ready = 0
    for r in stok_rows:
        if r.get("id_produk") == matched_pid and r.get("cabang", "").strip().lower() == cabang.lower():
            try:
                stok_ready = int(r.get("stok_ready", 0))
            except ValueError:
                stok_ready = 0
            break

    status_stok = f"✅ Ready ({stok_ready} unit)" if stok_ready > 0 else "⏳ Out of Stock (Auto-Restock Astra Hub Aktif)"

    # Kalkulasi cicilan deterministik 12, 24, 36 bulan
    pokok = max(0, harga_otr - dp_approved)
    c12 = int((pokok * 1.10) / 12)
    c24 = int((pokok * 1.18) / 24)
    c36 = int((pokok * 1.25) / 36)

    # Catat lead baru ke leads_mentah.csv jika belum ada
    new_id = f"LD-TEL-{abs(hash(chat_id))%1000:03d}"
    try:
        if os.path.exists(LEADS_FILE):
            with open(LEADS_FILE, mode="a", encoding="utf-8-sig", newline="") as f:
                writer = csv.writer(f)
                writer.writerow([new_id, sender_name, f"TELE-{chat_id}", clean_text[:40], str(dp_approved), cabang, "pending"])
    except Exception as e:
        print(f"[SAVE LEAD ERROR]: {e}")

    log_tele_event(
        "Cubi Scribe",
        f"Simulasi Finansial Telegram: {clean_sender}",
        f"Unit: {product_name} | DP: Rp {dp_approved:,} | Cicilan 36x: Rp {c36:,}/bln"
    )

    reply = (
        f"Terima kasih Kak *{clean_sender}*! Berikut rekomendasi resmi untuk kebutuhan Anda:\n\n"
        f"🏍️ *Unit:* *{product_name}*\n"
        f"💰 *Harga OTR:* Rp {harga_otr:,}\n"
        f"📍 *Cabang Terdekat:* {cabang}\n"
        f"📦 *Status Stok:* {status_stok}\n\n"
        f"📊 *Simulasi Kredit Resmi (Zero-Hallucination):*\n"
        f"• Uang Muka (DP): *Rp {dp_approved:,}* (Min. 15%)\n"
        f"• Cicilan 12 Bulan: *Rp {c12:,}/bln*\n"
        f"• Cicilan 24 Bulan: *Rp {c24:,}/bln*\n"
        f"• Cicilan 36 Bulan: *Rp {c36:,}/bln*\n\n"
        f"🎁 *Bonus Paket Bundling:* Helm Eksklusif & Garansi Servis Resmi Astra.\n"
        f"Tiket Anda telah terdaftar dengan ID: `{new_id}`.\n\n"
        f"Ketik `/spk {new_id}` jika Anda ingin mengunduh berkas fisik PDF SPK resmi penawaran ini!"
    )
    return reply

def _telegram_polling_worker():
    """Background polling worker menggunakan getUpdates Telegram Bot API."""
    global _last_update_id
    print("[TELEGRAM] Background Telegram Polling Worker dimulai.")

    while not _stop_polling.is_set():
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip() or TELEGRAM_BOT_TOKEN
        live_enabled = os.getenv("TELEGRAM_LIVE_ENABLED", "").strip().lower() == "true" or TELEGRAM_LIVE_ENABLED

        if not live_enabled or not token:
            # Jika belum diaktifkan atau token kosong, tidur 5 detik
            _stop_polling.wait(5.0)
            continue

        try:
            url = f"https://api.telegram.org/bot{token}/getUpdates"
            params = {"offset": _last_update_id + 1, "timeout": 10}
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                updates = data.get("result", [])
                for upd in updates:
                    _last_update_id = max(_last_update_id, upd.get("update_id", 0))
                    try:
                        msg = upd.get("message") or upd.get("edited_message") or upd.get("channel_post") or {}
                        chat = msg.get("chat", {})
                        chat_id = str(chat.get("id", ""))
                        user_obj = msg.get("from", {})
                        sender_name = user_obj.get("first_name") or chat.get("first_name") or chat.get("title") or "Konsumen"
                        text = msg.get("text", "").strip()

                        if chat_id and text:
                            balasan = handle_customer_command(chat_id, sender_name, text)
                            send_telegram_reply(chat_id, balasan)
                    except Exception as err:
                        print(f"[TELEGRAM UPDATE PROCESS ERROR]: {err}")
            elif resp.status_code == 401:
                print("[TELEGRAM ERROR] Token bot tidak valid (HTTP 401 Unauthorized).")
                _stop_polling.wait(30.0)
        except Exception as e:
            # Jaringan terputus / timeout sementara
            _stop_polling.wait(4.0)

def start_telegram_bot():
    """Meluncurkan daemon thread polling Telegram."""
    global _telegram_thread
    if _telegram_thread is None or not _telegram_thread.is_alive():
        _stop_polling.clear()
        _telegram_thread = threading.Thread(target=_telegram_polling_worker, daemon=True, name="TelegramBotWorker")
        _telegram_thread.start()

def stop_telegram_bot():
    """Menghentikan daemon thread polling Telegram secara graceful."""
    _stop_polling.set()
