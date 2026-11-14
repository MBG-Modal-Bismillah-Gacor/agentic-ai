# 🛡️ PANDUAN SECURITY, QA & OUTREACH GATEWAY

### Modul Khusus: Panji (Security, QA & Outreach Gateway Specialist)
**Proyek:** Agentic Sales Hub — PSAJ 2026 Showcase  
**Repositori:** [idhmyst/agentic-ai](https://github.com/idhmyst/agentic-ai)  
**Branch Kerja:** `feature/outreach-qa`  
**Fokus Wilayah:** `backend/security/`, `backend/gateway/`, & skenario pengujian pameran

---

## 🎯 Misi & Tanggung Jawab Panji

Halo Nji! Sesuai dokumen resmi *Business Brief* yang diinisiasi oleh Lord AIC (Pak Agus Indra Cahaya):
> *"Governed autonomy: pengiriman pesan, diskon, komitmen kontrak, dan tindakan berisiko dibatasi oleh kebijakan dan persetujuan... Di luar MVP: Mass outreach tanpa consent dan kontrol... Belum tervalidasi: Mode offline dapat memulihkan pekerjaan tertunda dengan aman."*
> Serta peringatan di obrolan tim: *"ati2 wa disadap / diblokir"*.

Tugas utama kamu adalah menjadi **benteng tata kelola, keamanan jalur komunikasi, dan penjamin keandalan demo pameran**:
1. **Tata Kelola Komunikasi & Anti-Spam (*Rate Limiting & Delay Jitter*):** Mencegah pemblokiran nomor sales dealer oleh sistem Meta dengan mengatur jeda acak manusia (*human-like randomized delay*) saat mengeksekusi antrean pesan penawaran.
2. **Pengawalan Approval Gate (*Human-in-the-Loop*):** Memastikan pesan hasil racikan AI lokal tidak terkirim secara liar sebelum staf sales menekan tombol persetujuan di Virtual Office Alfa.
3. **Integrasi Multi-Kanal Gateway:** Mengelola pengiriman pesan ke WhatsApp (via WAHA HTTP API) dan Telegram Bot sebagai saluran pendukung.
4. **Skenario Live Demo & Objection Handling QA:** Merancang skenario uji coba lapangan saat pameran PSAJ (misal: bagaimana sistem merespons bila budget DP konsumen kurang atau stok warna unit sedang kosong).

---

## 🛠️ Langkah Awal (Setup Lingkungan Kerja)

### 1. Masuk ke Branch Khusus
Buka terminal PowerShell di laptopmu:
```powershell
git clone https://github.com/idhmyst/agentic-ai.git
cd agentic-ai
git checkout -b feature/outreach-qa
```

### 2. Struktur Folder Kerja Panji
```text
agentic-ai/
└── backend/
    ├── README_PANJI.md             # Panduan tugas kamu ini
    ├── gateway/
    │   ├── dispatcher.py           # Eksekutor pengiriman WhatsApp & Telegram
    │   └── rate_limiter.py         # Algoritma delay acak anti-banned Meta
    └── qa_scenarios/
        ├── test_leads_100.json     # Dataset pengujian beban 100 prospek
        └── demo_script_psaj.md     # Skenario interaksi pameran untuk juri
```

---

## ⏱️ Implementasi Modul Anti-Spam & Dispatcher (`backend/gateway/dispatcher.py`)

Gunakan modul ini untuk menjembatani backend Idham ke gateway pengiriman resmi secara terkontrol:

```python
import time
import random
import requests
from typing import Dict, Any

WAHA_BASE_URL = "http://localhost:3050"
WAHA_API_KEY = "admin123"
SESSION_NAME = "default"

TELEGRAM_BOT_TOKEN = "8514963634:AAHQ-2wsQo49y2fBpHoULeC2vPL8pGWlODw"

class SafeOutreachDispatcher:
    def __init__(self, min_delay_sec: int = 4, max_delay_sec: int = 10):
        self.min_delay = min_delay_sec
        self.max_delay = max_delay_sec

    def apply_human_jitter(self):
        """Menerapkan penundaan acak agar menyerupai ketikan manusia dan menghindari filter spam Meta."""
        delay = random.uniform(self.min_delay, self.max_delay)
        print(f"[SECURITY GATE] Menerapkan jeda proteksi anti-spam: {delay:.2f} detik...")
        time.sleep(delay)

    def send_whatsapp_message(self, target_wa: str, message_text: str) -> Dict[str, Any]:
        """Kirim pesan melalui WhatsApp Gateway (WAHA) setelah lolos Approval Gate."""
        self.apply_human_jitter()
        
        # Bersihkan format nomor internasional (contoh: 0812 -> 62812)
        clean_number = target_wa.strip().replace("+", "").replace("-", "")
        if clean_number.startswith("0"):
            clean_number = "62" + clean_number[1:]
        chat_id = f"{clean_number}@c.us"

        headers = {
            "X-Api-Key": WAHA_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "session": SESSION_NAME,
            "chatId": chat_id,
            "text": message_text
        }

        try:
            res = requests.post(f"{WAHA_BASE_URL}/api/sendText", json=payload, headers=headers, timeout=15)
            if res.status_code in [200, 201]:
                return {"status": "SUCCESS", "channel": "WhatsApp", "chatId": chat_id, "data": res.json()}
            else:
                return {"status": "FAILED", "code": res.status_code, "error": res.text}
        except Exception as e:
            # Fallback simulasi jika container WAHA belum aktif di lokal tester
            print(f"[DISPATCHER WARNING] Gateway WAHA offline, dialihkan ke mode simulasi: {e}")
            return {"status": "SIMULATED_SUCCESS", "channel": "WhatsApp", "note": "Log offline tersimpan"}

    def send_telegram_spk_doc(self, chat_id: str, pdf_path: str, caption: str) -> bool:
        """Kirim berkas fisik PDF SPK hasil generator Tian ke Telegram tim sales."""
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
        try:
            with open(pdf_path, "rb") as doc:
                files = {"document": doc}
                data = {"chat_id": chat_id, "caption": caption, "parse_mode": "Markdown"}
                r = requests.post(url, files=files, data=data, timeout=30)
                return r.status_code == 200
        except Exception as err:
            print(f"[TELEGRAM ERROR] Gagal mengirim PDF: {err}")
            return False

dispatcher = SafeOutreachDispatcher()

if __name__ == "__main__":
    print("Menguji Safe Outreach Dispatcher...")
    res = dispatcher.send_whatsapp_message("6281234567801", "Halo Kak Budi, unit Beat Street ready di dealer kami.")
    print("Hasil Dispatch:", res)
```

---

## 📋 Skenario Uji Coba Pameran PSAJ 2026 (`demo_script_psaj.md`)

Panji bertindak sebagai pengarah demonstrasi (*Live Demo Director*). Siapkan 3 skenario berikut untuk dipraktekkan di depan Lord AIC dan juri pameran:

### Skenario 1: The "Golden Path" (Pemesanan Mulus)
1. Buka tabel di Virtual Office Alfa (`localhost:3000`).
2. Pilih prospek **LD-001 (Budi Santoso)** dengan DP Rp 2.500.000 (Minat: Motor harian irit).
3. Klik tombol **"Auto-Pitch"**.
4. Tunjukkan ke juri: terminal SSE backend mencatat aktivitas AI lokal, model `qwen2.5:3b` menyusun pesan sapaan untuk unit Beat Street dalam waktu $\le 3$ detik.
5. Tekan tombol **"Setujui & Kirim"** di Virtual Office $\rightarrow$ Dispatcher Panji menahan pesan beberapa detik (anti-spam) lalu mengirimkannya ke WhatsApp.

### Skenario 2: The "Objection & Upselling Path" (Unit Habis / DP Kurang)
1. Pilih prospek dengan minat **Vario 160 Hitam**.
2. Sistem mendeteksi di stok CSV bahwa varian Hitam habis, namun varian Merah tersedia (*ready*).
3. AI merekomendasikan unit alternatif + paket bundling helm/servis gratis deterministik.
4. Terbitkan dokumen resmi PDF SPK (modul Tian) ber-kop dealer dalam 1 detik.

### Skenario 3: The "Offline Reliability Test" (Cabut Koneksi Internet)
1. Matikan sambungan Wi-Fi di laptop/mini PC B206.
2. Jalankan pembuatan simulasi SPK dan inferensi draf pesan.
3. Tunjukkan ke dewan juri bahwa seluruh fungsi inti tetap berjalan 100% tanpa internet (*Local-First Guarantee*).

---

## 🔒 Checklist Keamanan & QA Sebelum Pameran
- [ ] **Sanitasi Kredensial:** Pastikan tidak ada nomor telepon pribadi atau API key rahasia yang ter-commit ke publik tanpa `.env`.
- [ ] **Pemberian Jeda Acak:** Validasi bahwa fungsi `apply_human_jitter()` aktif (jeda minimal 4 detik per pesan blast).
- [ ] **Validasi Dokumen Fisik:** Pastikan setiap PDF yang dikirim melalui gateway tidak berstatus berkas rusak (*corrupted 0 KB*).
- [ ] **Kesiapan Skenario Juri:** Panji memegang kendali teks dan alur cerita saat demonstrasi berlangsung.

---

## 🚀 Alur Sinkronisasi Git untuk Panji

Setelah menyusun modul dispatcher dan skenario pengujian:
```powershell
git add backend/gateway/ backend/qa_scenarios/
git commit -m "feat(security-qa): implementasi safe dispatcher dengan delay anti-spam dan skenario demo PSAJ"
git push origin feature/outreach-qa
```