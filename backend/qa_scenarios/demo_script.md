# 📋 Skenario Uji Coba Pameran PSAJ 2026
**Peran:** Panji (Live Demo Director)
**Target Audiens:** Lord AIC (Pak Agus Indra Cahaya) dan Dewan Juri Pameran

---

## Skenario 1: The "Golden Path" (Pemesanan Mulus)
**Tujuan:** Menunjukkan kecepatan inferensi AI lokal, fungsi *Approval Gate*, dan fitur keamanan anti-spam (Rate Limiting).

1. **Persiapan:** Buka antarmuka tabel prospek di Virtual Office Alfa (`localhost:3000`).
2. **Pemilihan Data:** Pilih prospek dengan kode **LD-001 (Budi Santoso)**. 
   * *Konteks Prospek:* DP Rp 2.500.000, Minat: Motor harian irit.
3. **Eksekusi AI:** Klik tombol **"Auto-Pitch"**.
4. **Validasi Backend (Untuk Juri):** Tunjukkan terminal SSE backend kepada juri. Soroti bagaimana model `qwen2.5:3b` menyusun draf pesan sapaan penawaran unit Beat Street secara lokal dengan waktu sangat cepat ($\le 3$ detik).
5. **Approval Gate:** Tekan tombol **"Setujui & Kirim"** di Virtual Office.
6. **Validasi Anti-Spam:** Buktikan di terminal bahwa Dispatcher menahan pesan selama beberapa detik (*human-like randomized delay* minimum 4 detik) sebagai proteksi anti-spam sebelum statusnya berubah menjadi terkirim ke WhatsApp.

---

## Skenario 2: The "Objection & Upselling Path" (Unit Habis / DP Kurang)
**Tujuan:** Mendemonstrasikan kelincahan AI menangani penolakan teknis (stok/budget) dan kolaborasi antar-modul (Generator SPK).

1. **Pemilihan Data:** Pilih prospek yang memiliki minat spesifik pada unit **Vario 160 Hitam**.
2. **Deteksi Sistem:** Biarkan sistem membaca data stok CSV dan mendeteksi bahwa varian Hitam sedang habis/kosong, tetapi varian Merah berstatus *ready*.
3. **Handling Objection (AI):** Tunjukkan draf balasan AI yang secara cerdas merekomendasikan unit alternatif (Merah). Soroti bagaimana AI otomatis menambahkan paket bundling helm atau servis gratis deterministik sebagai daya tarik/kompensasi.
4. **Validasi Dokumen Fisik:** Eksekusi persetujuan dan demokan pembuatan dokumen fisik PDF Surat Pesanan Kendaraan (SPK) ber-kop dealer (hasil modul Tian) yang terbit ke dalam Telegram/sistem hanya dalam 1 detik.

---

## Skenario 3: The "Offline Reliability Test" (Uji Ketahanan Tanpa Internet)
**Tujuan:** Membuktikan janji *Local-First Guarantee* (keamanan, privasi data lokal, dan operasional tanpa hambatan jaringan).

1. **Simulasi Ekstrem:** Putuskan koneksi internet secara langsung dengan mematikan sambungan Wi-Fi di laptop/mini PC B206 di depan juri.
2. **Eksekusi Offline:** Jalankan kembali simulasi pembuatan dokumen SPK serta inferensi draf pesan penawaran baru.
3. **Pembuktian:** Tunjukkan hasil akhirnya kepada dewan juri bahwa seluruh fungsi inti AI (LLM lokal) dan generator dokumen tetap berjalan 100% sempurna tanpa memerlukan ping ke server luar.    