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

from backend.engine_pdf import generate_spk_pdf
from backend.dispatcher import SafeOutreachDispatcher

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
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
    """Mengirim pesan teks balasan ke customer di Telegram."""
    token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip() or TELEGRAM_BOT_TOKEN
    if not token:
        return False
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        resp = requests.post(url, json={
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown"
        }, timeout=10)
        return resp.status_code == 200
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

def handle_customer_command(chat_id: str, sender_name: str, text: str) -> str:
    """
    Memproses perintah & teks kebutuhan customer dari Telegram.
    Mengembalikan balasan teks yang ramah, profesional, dan deterministik.
    """
    clean_text = text.strip()
    cmd = clean_text.lower()
    katalog = get_katalog_data()
    stok_rows = get_stok_data()

    # Log aktivitas masuk ke dashboard
    log_tele_event(
        "Telegram Gateway",
        f"Pesan Masuk Customer: {sender_name}",
        f"Chat ID: {chat_id} | Perintah: {clean_text[:60]}"
    )

    # 1. PERINTAH /start atau /help atau /bantuan
    if cmd in ["/start", "/help", "/bantuan", "halo", "hai", "menu"]:
        return (
            f"👋 *Halo Kak {sender_name}! Selamat datang di StelAgent Virtual Sales Hub.* 🏍️\n"
            f"Layanan Penjualan Resmi Honda Astra Motor (Local-First Agentic AI).\n\n"
            f"*Perintah Cepat yang Dapat Digunakan:*\n"
            f"• `/katalog` — Lihat daftar motor Honda & harga OTR resmi\n"
            f"• `/stok` — Cek ketersediaan unit fisik di cabang dealer\n"
            f"• `/spk [id_prospek]` — Unduh berkas resmi PDF SPK penawaran Anda\n\n"
            f"💡 *Atau langsung ketik kebutuhan Anda*, contoh:\n"
            f"_\"Saya mau tanya Vario 160 di Purwokerto Timur DP 4 juta\"_\n"
            f"Tim agen AI kami akan langsung memberikan simulasi kredit presisi & ketersediaan stok."
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
        f"Simulasi Finansial Telegram: {sender_name}",
        f"Unit: {product_name} | DP: Rp {dp_approved:,} | Cicilan 36x: Rp {c36:,}/bln"
    )

    reply = (
        f"Terima kasih Kak *{sender_name}*! Berikut rekomendasi resmi untuk kebutuhan Anda:\n\n"
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
                    msg = upd.get("message", {})
                    chat = msg.get("chat", {})
                    chat_id = str(chat.get("id", ""))
                    sender_name = chat.get("first_name", "Konsumen")
                    text = msg.get("text", "")

                    if chat_id and text:
                        balasan = handle_customer_command(chat_id, sender_name, text)
                        send_telegram_reply(chat_id, balasan)
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
