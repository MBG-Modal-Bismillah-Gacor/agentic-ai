# 🤖 Agentic AI — StelAgent (Autonomous Intelligence Hub)
### Local-First Enterprise Sales Appliance for MSI Cubi NUC AI+ B206
**Showcase:** PSAJ 2026 Showcase  
**Supervisi & Bimbingan:** Agus Indra Cahaya (Lord AIC)  
**Branding UI / Produk:** StelAgent  
**Nama Proyek Induk:** Agentic AI  

---

## 📌 Ringkasan Eksekutif

**Agentic AI** dengan antarmuka **StelAgent** adalah sistem orkestrasi multi-agen otonom (*autonomous agentic swarm*) tingkat *enterprise* yang dirancang dengan paradigma **Local-First & Air-Gapped Ready**. Seluruh pemrosesan kecerdasan buatan, komputasi finansial deterministik, penyimpanan basis data prospek, dan penerbitan dokumen hukum dijalankan 100% secara lokal di dalam unit mini PC **MSI Cubi NUC AI+ B206** tanpa ketergantungan API cloud berbayar (*zero cloud egress*).

Solusi ini mentransformasi ruang pamer (*showroom*) otomotif modern (studi kasus: jaringan dealer Astra Motor Honda) dengan menghadirkan:
1. **Virtual Office 3D & Diorama Isometrik Interaktif:** Visualisasi spasial arsitektur kantor, stasiun kerja agen AI, dan kamera pengawas 360° CCTV lokal.
2. **Deterministic Financial & SPK Engine:** Perhitungan uang muka (DP), batas minimum leasing, dan skema angsuran 12/24/36 bulan dengan akurasi matematika mutlak (*zero-hallucination*), serta penerbitan berkas fisik PDF Surat Pesanan Kendaraan (SPK) ber-kop resmi.
3. **Autonomous Swarm Deliberation:** Tim agen (`Scout` -> `Cubi Supply` -> `Gate` -> `Scribe`) yang berdetak setiap 30 detik secara otonom untuk mendeteksi defisit unit berstatus stok `0` di cabang lokal dan menegosiasikan alokasi restock darurat ke Pusat Distribusi Astra tanpa memalsukan status ketersediaan barang.
4. **Human-in-the-Loop Safe Outreach Gate:** Gerbang persetujuan direktur sales dengan kotak konfirmasi persetujuan (*consent*), pembatasan frekuensi pengiriman (maksimal 30 pesan/jam), jeda acak manusiawi (4–9 detik), pencatatan audit log ter-masking, dan *mode simulasi aman* secara *default*.

---

## 👥 Tim Pengembang & Pembagian Peran

Proyek ini dibangun melalui kolaborasi deterministik ke-5 anggota tim di bawah arahan langsung **Agus Indra Cahaya (Lord AIC)**:

| No | Anggota Tim | Peran & Spesialisasi | Kontribusi & Fokus Wilayah |
|:---|:---|:---|:---|
| 1 | **Idham** | *Backend Orchestration & Swarm Lead* | Arsitektur monorepo FastAPI, siklus hidup agen, *background heartbeat*, state machine antrean prospek, dan integrasi API menyeluruh (`backend/main.py`). |
| 2 | **Alfa** | *Frontend & UI Rebranding Specialist* | Antarmuka Virtual Office 3D Three.js/Fiber, rebranding 100% StelAgent, komponen Sales Approval Gate, panel Deliberasi multi-agen real-time, dan unduh PDF SPK (`frontend/`). |
| 3 | **Tian** | *Data Ingestion & Deterministic Document Specialist* | Mesin finansial deterministik nol-halusinasi, penerbitan dokumen PDF SPK ReportLab resmi (`backend/engine_pdf.py`), dan integritas relasional CSV (`backend/workspace/`). |
| 4 | **Hasbi** | *Edge AI & Hardware Optimization Specialist* | Profiling inferensi lokal NPU/iGPU B206 (`hardware_benchmark/`), model runtime `qwen2.5:3b`/`hermes3:8b`, dan daemon auto-updater (`scripts/auto_updater.ps1`). |
| 5 | **Panji** | *Information Security & Outreach QA Specialist* | `SafeOutreachDispatcher` (`backend/dispatcher.py`), sanitasi kredensial (0 hardcoded token/secret), audit logging ter-masking, dan automated test suite (`backend/qa_test_suite.py`). |

---

## ⚡ Arsitektur Hardware: MSI Cubi NUC AI+ B206

Sistem didesain khusus agar dapat berjalan mandiri (*standalone appliance*) pada mini PC **MSI Cubi NUC AI+ B206** dengan spesifikasi:
- **Processor:** Intel® Core™ Ultra Processor dengan arsitektur hybrid performa/efisiensi.
- **NPU Dedicated:** Intel® AI Boost NPU terakselerasi hingga **48 TOPS** untuk inferensi LLM offline.
- **Grafis:** Intel® Arc™ Graphics dengan akselerasi instruksi kuantisasi INT4/INT8.
- **Konektivitas & Keamanan:** Dual 2.5GbE LAN (Port 8000 Backend), isolasi air-gapped total, tanpa transmisi data sensitif konsumen ke server pihak ketiga.

### Profil Model Lokal:
- **`qwen2.5:3b` (Default Fast Pipeline):** Menangani ekstraksi kebutuhan prospek, peracikan draf WhatsApp, dan negosiasi pengadaan unit ke pemasok dengan latensi rata-rata $\le 2.3\text{ detik}$ dan kecepatan $\ge 30\text{ tokens/detik}$.
- **`hermes3:8b` (Deep Reasoning):** Menangani evaluasi komparasi multi-cabang kompleks dan audit legal saat dibutuhkan daya penalaran tingkat lanjut.

---

## 🔄 Daemon Auto-Updater Mini PC (`scripts/auto_updater.ps1`)

Untuk mempermudah pemeliharaan unit fisik mini PC di lokasi pameran PSAJ 2026, disediakan skrip pemantau latar belakang otomatis:

```powershell
# Menjalankan pemantau branch main setiap 30 detik di mini PC:
powershell -ExecutionPolicy Bypass -File scripts\auto_updater.ps1 -Branch main -IntervalSeconds 30
```

### Mekanisme Kerja Auto-Updater:
1. **Deteksi Head Commit:** Memeriksa apakah `HEAD != origin/main` setiap 30 detik.
2. **Penanganan Offline Senyap (*Graceful Catch*):** Jika mini PC berada dalam mode *Airplane Mode* / tanpa internet, skrip menangani galat koneksi secara senyap sehingga aplikasi **StelAgent** tetap beroperasi lancar tanpa terganggu.
3. **Pembaruan Otomatis 4-Tahap:**
   - Melakukan `git pull origin main`.
   - Memperbarui dependensi Python (`pip install -r backend/requirements.txt`).
   - Melakukan build aset produksi frontend (`npm run build` di `frontend/`).
   - Me-restart proses layanan lokal backend port 8000 secara halus.

---

## 🛡️ Keamanan Kredensial & Kebijakan Data

1. **Zero Hardcoded Secret:** Repositori diaudit ketat sehingga **0 token Telegram bot, API key, atau kata sandi** yang tertanam di dalam berkas kode maupun Markdown.
2. **Manajemen Environment:** Seluruh konfigurasi privat dikelola via `.env` lokal (tercantum di `.gitignore`) dengan panduan template di `backend/.env.example`.
3. **Pemberian Izin Prospek (*Consent-Driven*):** Tidak ada pesan yang dapat diproses oleh *Approval Gate* tanpa adanya *checkbox consent* aktif dari staf/direktur.
4. **Penyensoran Audit (*PII Masking*):** Seluruh nomor telepon dienkripsi dan di-masking (contoh: `***7801@c.us`) pada berkas `backend/workspace/outreach_audit_log.jsonl`.

---

## 🚀 Panduan Menjalankan Sistem

### 1. Prasyarat Sistem
- Python 3.10+
- Node.js 18+ & npm
- (Opsional) Ollama terpasang dengan model `qwen2.5:3b`

### 2. Menjalankan Backend (FastAPI Core)
```powershell
# Dari direktori root:
python run_backend.py
# Atau via uvicorn langsung:
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Menjalankan Frontend (StelAgent UI)
```powershell
cd frontend
npm install
npm run dev
# Akses Virtual Office: http://localhost:5173/office
# Akses Dashboard SaaS: http://localhost:5173/dashboard
```

### 4. Menjalankan Pengujian Kualitas (QA Test Suite)
```powershell
# Menjalankan 9 pengujian otomatis (Kesehatan, Lead Queue, Pitch, Gate Consent, Activities, Integritas CSV, Deliberations Swarm, dan Penerbitan Dokumen PDF SPK):
python backend\qa_test_suite.py
```

### 5. Menjalankan Benchmark Hardware B206
```powershell
# Menghasilkan bukti empiris performa NPU/CPU/RAM ke hardware_benchmark/hasil_benchmark_b206.json:
python hardware_benchmark\benchmark_b206.py
```

---

## 📑 Dokumentasi Endpoint Utama Backend

- `GET /api/v1/system/health`: Telemetri kesehatan appliance, status mode simulasi/live, dan koneksi NPU.
- `GET /api/v1/leads/queue`: Daftar antrean prospek dengan penilaian prioritas (*Hot*, *Warm*, *Cold*).
- `POST /api/v1/leads/generate-pitch`: Peracikan draf penawaran personal berbasis data stok cabang lokal.
- `POST /api/v1/leads/approve-and-send`: Otorisasi direktur dengan validasi *consent*, perhitungan cicilan deterministik, dan penerbitan berkas PDF SPK resmi.
- `GET /api/v1/documents/{filename}`: Endpoint pengunduhan berkas fisik PDF SPK resmi dari browser.
- `GET /api/v1/deliberations`: Transkrip koordinasi rapat internal multi-agen (`Scout` -> `Cubi Supply` -> `Gate` -> `Scribe`) saat defisit stok unit 0 terdeteksi.
- `POST /api/v1/sales/simulasi-kredit`: Simulasi cicilan pembiayaan leasing deterministik (tenor 12, 24, 36 bulan).

---
© 2026 StelAgent // Agentic AI Enterprise Labs. All Rights Reserved.
Showcase PSAJ 2026 — Mini PC MSI Cubi NUC AI+ B206.
