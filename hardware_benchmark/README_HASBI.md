# ⚡ PANDUAN RUNTIME & HARDWARE OPTIMIZATION

### Modul Khusus: Hasbi (Edge AI & Hardware Runtime Specialist)
**Proyek:** Agentic Sales Hub — PSAJ 2026 Showcase  
**Branch Kerja:** `feature/hardware-optimization`  
**Target Hardware:** Standalone Mini PC **MSI Cubi NUC AI+ B206** (Intel Core Ultra, Intel Arc iGPU, Intel AI Boost NPU)

---

## 🎯 Misi & Tanggung Jawab Hasbi

Sesuai arahan Lord AIC (Pak Agus Indra Cahaya) di dokumen resmi *Business Brief*:
> *"Wajib benchmark; jangan mengasumsikan NPU otomatis terpakai tanpa pengujian... Model lokal pilih berdasarkan benchmark pada SKU final, bukan klaim TOPS saja."*

Tugas utama Hasbi adalah menjadi **penjamin performa komputasi lokal (*Local Appliance Performance*)**:
1. Menentukan konfigurasi inferensi model AI lokal yang paling stabil, cepat, dan hemat daya di MSI Cubi NUC AI+ B206.
2. Membandingkan performa model **`qwen2.5:3b`** (ekstraksi & draf cepat) vs **`hermes3:8b`** (penalaran & deliberasi multi-agen).
3. Melakukan profiling penggunaan RAM, latensi respons (*tokens per second*), dan inspeksi akselerasi GPU/VRAM/NPU.
4. Menyiapkan skrip *auto-start on boot* (baik untuk appliance Ubuntu Desktop 26 maupun Windows) agar saat mini PC dinyalakan, sistem kantor 3D langsung tampil di monitor.

---

## 🔬 Spesifikasi Model & Profil Kuantisasi

| Model ID | Ukuran GGUF | Kuantisasi | Kebutuhan RAM | Peruntukan di Sistem |
| :--- | :--- | :--- | :--- | :--- |
| **`qwen2.5:3b`** | ~1.9 GB | Q4_K_M | ~3.2 GB | **Default Pipeline:** Peracikan sapaan cepat, ekstraksi lead mentah, dan negosiasi stok ke pemasok. |
| **`hermes3:8b`** | ~4.9 GB | Q4_K_M | ~7.5 GB | **Advanced Reasoner:** Analisis komparasi multi-cabang kompleks dan penalaran tingkat lanjut. |

### Download Model di Terminal:
```bash
ollama pull qwen2.5:3b
ollama pull hermes3:8b
```

---

## 🛠️ Langkah Menjalankan Benchmark

1. Pastikan virtual environment aktif dan paket pendukung terpasang:
   ```bash
   source .venv/bin/activate    # (atau .venv\Scripts\activate di Windows)
   pip install psutil requests
   ```

2. Jalankan skrip benchmark otomatis:
   ```bash
   python hardware_benchmark/benchmark_b206.py
   ```
   Skrip akan mencatat metrik latensi, kecepatan token per detik (TPS), pemakaian RAM delta, serta mengecek status offload VRAM/GPU via Ollama runtime API.

3. Hasil pengujian otomatis tersimpan di:
   `hardware_benchmark/hasil_benchmark_psaj.json`

---

## 📊 Pemantauan Sistem Real-Time

Untuk memantau beban CPU, sisa RAM, dan model yang sedang aktif di memori secara real-time:
```bash
python hardware_benchmark/system_monitor.py
```

---

## 🔌 Launcher Appliance Pameran

- **Di Ubuntu Linux (Cubi NUC):**
  Tersedia `hardware_benchmark/autostart_appliance.sh` atau gunakan setup `systemd` + Kiosk desktop autostart ke URL `http://127.0.0.1:5173/office`.
- **Di Windows:**
  Tersedia `hardware_benchmark/autostart_appliance.bat` (Frontend berjalan di port `5173` rute `/office`, Backend di port `8000`).

---

## 📈 Laporan Metrik Target PSAJ 2026

1. **Latensi Generate Pesan:** $\le 3.5\text{ detik}$ menggunakan `qwen2.5:3b`.
2. **Kecepatan Inferensi:** $\ge 25\text{ tokens/detik}$ pada arsitektur Intel Core Ultra.
3. **Batas Aman Memori:** Total konsumsi RAM $\le 10\text{ GB}$ dari kapasitas fisik B206.
4. **Thermal & Stability:** Lulus siklus swarm tanpa crash / OOM.
