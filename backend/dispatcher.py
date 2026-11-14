import datetime
import json
import os
import random
import time
import requests

# Konfigurasi Gateway (Sesuaikan dengan port WAHA / Telegram Bot yang aktif)
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3050")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "admin123")
WAHA_SESSION = os.getenv("WAHA_SESSION", "default")

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
AUDIT_LOG_PATH = os.path.join("workspace", "outreach_audit_log.jsonl")


class SafeOutreachDispatcher:
    """
    Pengelola pengiriman pesan keluar dengan proteksi anti-spam Meta:
    - Jittered Delay (jeda acak menyerupai ketikan manusia)
    - Rate Limiting (pembatasan jumlah pesan per jam)
    - Audit Trail (pencatatan riwayat setiap pesan keluar)
    """

    def __init__(self, min_delay: float = 4.0, max_delay: float = 9.0, max_per_hour: int = 30):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.max_per_hour = max_per_hour
        self.sent_timestamps = []

    def _cek_rate_limit(self) -> bool:
        sekarang = time.time()
        satu_jam_lalu = sekarang - 3600
        self.sent_timestamps = [t for t in self.sent_timestamps if t > satu_jam_lalu]
        return len(self.sent_timestamps) < self.max_per_hour

    def _catat_audit(self, entry: dict):
        os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
        entry["timestamp"] = datetime.datetime.now().isoformat()
        with open(AUDIT_LOG_PATH, mode="a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    def kirim_whatsapp_aman(self, nomor_tujuan: str, pesan: str, mode_simulasi: bool = True) -> dict:
        """
        Mengirim pesan WhatsApp setelah melalui Sales Approval Gate.
        Set mode_simulasi=False jika container WAHA sudah berstatus WORKING.
        """
        if not self._cek_rate_limit():
            hasil = {
                "status": "ditahan_rate_limit",
                "pesan": f"Batas aman {self.max_per_hour} pesan/jam tercapai demi keamanan akun.",
            }
            self._catat_audit(hasil)
            return hasil

        # 1. Terapkan jeda acak manusiawi (Jittered Delay)
        jeda = round(random.uniform(self.min_delay, self.max_delay), 2)
        print(f"[DISPATCHER] Menerapkan jeda anti-spam selama {jeda} detik sebelum mengirim ke {nomor_tujuan}...")
        time.sleep(jeda)

        chat_id = nomor_tujuan if "@c.us" in nomor_tujuan else f"{nomor_tujuan}@c.us"

        # 2. Mode Simulasi (Aman untuk demo pameran tanpa risiko spam nomor asli)
        if mode_simulasi:
            self.sent_timestamps.append(time.time())
            hasil = {
                "status": "terkirim_simulasi",
                "tujuan": chat_id,
                "jeda_detik": jeda,
                "preview_pesan": pesan[:80] + "..." if len(pesan) > 80 else pesan,
            }
            self._catat_audit(hasil)
            return hasil

        # 3. Mode Live Gateway (WAHA REST API)
        headers = {"X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json"}
        payload = {"session": WAHA_SESSION, "chatId": chat_id, "text": pesan}
        try:
            res = requests.post(f"{WAHA_BASE_URL}/api/sendText", json=payload, headers=headers, timeout=15)
            res.raise_for_status()
            self.sent_timestamps.append(time.time())
            hasil = {
                "status": "terkirim_live_wa",
                "tujuan": chat_id,
                "jeda_detik": jeda,
                "http_code": res.status_code,
            }
        except Exception as e:
            hasil = {
                "status": "gagal_gateway",
                "tujuan": chat_id,
                "error": str(e),
            }

        self._catat_audit(hasil)
        return hasil

    def kirim_pdf_telegram(self, chat_id: str, path_pdf: str, caption: str) -> dict:
        """Mengirimkan berkas fisik PDF SPK resmi ke Telegram staf sales / pembeli."""
        if not TELEGRAM_BOT_TOKEN or not os.path.exists(path_pdf):
            return {"status": "dilewati", "alasan": "Token Telegram kosong atau file PDF belum tersedia."}

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
        try:
            with open(path_pdf, "rb") as doc_file:
                res = requests.post(
                    url,
                    data={"chat_id": chat_id, "caption": caption},
                    files={"document": doc_file},
                    timeout=20,
                )
            return {"status": "terkirim_telegram", "http_code": res.status_code}
        except Exception as e:
            return {"status": "gagal_telegram", "error": str(e)}


if __name__ == "__main__":
    dispatcher = SafeOutreachDispatcher(min_delay=2.0, max_delay=4.0)
    hasil_uji = dispatcher.kirim_whatsapp_aman(
        nomor_tujuan="6281234567801",
        pesan="Halo Pak Budi, unit Beat Street Hitam Doff siap diproses sesuai DP Rp 2.500.000.",
        mode_simulasi=True,
    )
    print("Hasil Uji Dispatcher:", json.dumps(hasil_uji, indent=2))