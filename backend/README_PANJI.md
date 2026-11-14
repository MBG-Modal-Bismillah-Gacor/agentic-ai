# Panduan Security, QA & Outreach Gateway

## Status keamanan

- WhatsApp dan Telegram live nonaktif secara default.
- Pengiriman WA hanya diproses setelah staf menekan persetujuan, mengonfirmasi consent, dan memberi nama penyetuju.
- Mode simulasi mencatat status `simulated`; status ini tidak berarti pesan terkirim.
- Audit menyimpan status, waktu, lead ID, penyetuju, konfirmasi consent, dan nomor yang dimasking. Isi pesan tidak disimpan.
- Jangan menaruh token bot atau API key di kode, dokumentasi, CSV, atau commit. Simpan hanya di environment lokal.

Jika token pernah masuk ke repositori atau dokumen bersama, anggap token tersebut terekspos: cabut/rotasi melalui penyedia terkait sebelum mengaktifkannya kembali. Penghapusan dari berkas kerja tidak menghapusnya dari riwayat Git.

## Menjalankan backend dan QA

Dari root repositori:

```powershell
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Di terminal lain:

```powershell
python -m unittest discover -s backend -p "test_*.py" -v
python backend\qa_test_suite.py
```

QA suite hanya melakukan pemeriksaan baca dan input negatif. Tes dispatcher mengisolasi file audit dan mem-mock waktu serta HTTP; tidak menghubungi WAHA atau Telegram.

## Konfigurasi lokal

Gunakan variabel environment; `backend/.env.example` berisi nama konfigurasi tanpa kredensial. Nilai live harus diaktifkan secara sengaja dan gateway harus dikonfigurasi terlebih dahulu:

- `WAHA_LIVE_ENABLED=true` bersama `WAHA_BASE_URL`, `WAHA_API_KEY`, dan `WAHA_SESSION` mengaktifkan WAHA.
- `TELEGRAM_LIVE_ENABLED=true` bersama `TELEGRAM_BOT_TOKEN` mengaktifkan pengiriman dokumen.
- Jika nilai live tidak lengkap, jangan kirim. Jangan mengganti kegagalan gateway dengan status sukses simulasi.

Jalankan service pada loopback untuk demo lokal. CORS dibatasi ke origin localhost yang umum; atur `APP_CORS_ORIGINS` jika UI dipasang di origin lain.

## Kriteria demo dan batas validasi

1. Golden path: pastikan draft muncul, staf meninjau/mengeditnya, consent dikonfirmasi, lalu hasil API menunjukkan simulasi atau pengiriman live secara eksplisit.
2. Objection handling: validasi stok dan rekomendasi unit terhadap CSV serta aturan bundling; tes ini tidak mengubah stok.
3. Offline: jalankan hanya setelah memastikan model dan aset yang diperlukan tersedia lokal. QA otomatis tidak memutus koneksi Wi-Fi.

`/api/v1/system/activities` adalah log aktivitas, bukan transcript multi-agent. Background heartbeat, negosiasi pemasok, perubahan stok otomatis, dan PDF SPK harus diuji terpisah sebelum diklaim tersedia.
