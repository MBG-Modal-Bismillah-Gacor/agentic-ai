# 📑 SPESIFIKASI MODUL BACKEND TELEGRAM GATEWAY
### **Berkas Inti:** `backend/telegram_bot.py`

Modul ini bertanggung jawab atas komunikasi dua arah (*bidirectional messaging*) antara cloud Telegram dengan appliance lokal **MSI Cubi NUC AI+ B206**:

---

## 🏗️ 1. Arsitektur Teknis
1. **Pola Koneksi (*Long-Polling Worker*):**
   * Menggunakan daemon thread `_telegram_polling_worker` dengan pemanggilan HTTP `getUpdates`.
   * **Keuntungan:** Tidak membutuhkan IP publik, tidak membutuhkan sertifikat SSL/HTTPS, dan aman berjalan di balik router Wi-Fi/LAN lokal showroom.
2. **Dual-Layer Messaging Resilience:**
   * Lapisan 1: Mengirim pesan terformat dengan parser `Markdown`.
   * Lapisan 2 (Fallback): Jika Telegram menolak Markdown (misal nama pengirim mengandung karakter `_` atau `*`), fungsi otomatis mengirimkan ulang dalam format *plain text* bersih tanpa gagal.
3. **Sinkronisasi Terpadu dengan Database Lokal:**
   * Membaca dan memperbarui `backend/workspace/leads_mentah.csv`.
   * Membaca ketersediaan stok fisik dari `backend/workspace/stok_cabang.csv`.
   * Menerbitkan berkas PDF legal formal via `backend/engine_pdf.py`.
   * Merekam jejak audit di `backend/workspace/outreach_audit_log.jsonl`.
   * Memancarkan event langsung ke *Server-Sent Events* (SSE) UI melalui `log_tele_event`.

---

## 📋 2. Ringkasan Perintah Terdaftar

### **Kategori A: Customer Facing**
- `/start` atau `/help` — Panduan umum dan salam selamat datang.
- `/katalog` — Ekstraksi master katalog motor dan harga OTR resmi.
- `/stok` — Pengecekan sisa unit fisik di seluruh cabang aktif.
- `/spk [id]` — Ekstraksi data prospek dan pengiriman berkas biner PDF SPK.
- *Pesan teks bebas* — NLP keyword extractor, OTR matching, dan kalkulator cicilan 12/24/36 bulan.

### **Kategori B: Sales Facing (Portal Kontrol Penjualan)**
- `/sales` — Menu perintah khusus staf dealer.
- `/prospek` — Ekstraksi antrean prospek berstatus `pending`, `warm`, atau `hot`.
- `/tawarkan [id]` — Eksekusi orkestrasi Cubi Scout & Cubi Scribe untuk menyusun draf penawaran.
- `/kirim [id]` — Eksekusi persetujuan Sales Gate, dispatch pesan ke konsumen, dan pengiriman PDF SPK.
- `/autopipeline` — Iterasi otomatis pemrosesan seluruh antrean prospek pending.
- `/tambah [data]` — Pendaftaran prospek baru secara instan ke CSV Data Vault.
- `/rapat` — Ekstraksi status telemetri negosiasi restock otonom agen dengan Astra Hub.

---

## 🔒 3. Keamanan & Konfigurasi Lingkungan (`.env`)
Pastikan variabel berikut terisi di berkas `backend/.env`:
```env
TELEGRAM_LIVE_ENABLED=true
TELEGRAM_BOT_TOKEN=token_bot_anda_disini
```
*Token bot tidak pernah disimpan di repositori Git publik dan hanya di-load dari berkas `.env` lokal.*
