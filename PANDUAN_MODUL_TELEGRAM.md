# 📱 PANDUAN RESMI MODUL PERINTAH BOT TELEGRAM
### **StelAgent — Agentic AI Sales Hub (MSI Cubi NUC AI+ B206)**

Dokumen ini adalah panduan operasional lengkap modul **Telegram Bot Gateway** untuk dua peran pengguna:
1. **Calon Pembeli (Customer / Inbound Lead)**
2. **Staf Sales Dealer (Internal Sales Representative)**

---

## 👥 1. MENU PERINTAH KONSUMEN (CALON PEMBELI)

Calon pembeli dapat berinteraksi secara mandiri 24/7 tanpa perlu antre menunggu respon manusia:

| Perintah | Deskripsi | Contoh Input | Respon Otomatis Bot |
| :--- | :--- | :--- | :--- |
| **`/start`** atau **`/help`** | Menyapa calon pembeli, mengenalkan dealer resmi Honda Astra, dan menampilkan panduan interaksi. | `/start` | Salam hangat personal, daftar katalog, dan ajakan konsultasi. |
| **`/katalog`** | Menampilkan daftar seluruh motor Honda, harga OTR resmi, segmen kebutuhan, dan batas minimal DP 15%. | `/katalog` | Tabel harga OTR resmi Beat Street, Vario 160, dan PCX 160. |
| **`/stok`** | Memeriksa ketersediaan unit fisik riil di cabang dealer Purwokerto Timur & Banyumas Kota. | `/stok` | Menampilkan sisa unit ready per cabang langsung dari database stok fisik showroom. |
| **`/spk [ID]`** | Mengunduh berkas fisik resmi biner PDF SPK penawaran kendaraan langsung ke chat Telegram pembeli. | `/spk LD-002` | Generator PDF menyusun berkas biner resmi SPK ber-kop dealer dan mengirimkannya sebagai file `.pdf`. |
| **Chat Konsultasi Bebas** | Konsultasi kebutuhan motor dalam bahasa Indonesia santai. | *"Mau Vario 160 di Purwokerto Timur DP 4 juta"* | Matching motor + cek stok cabang + simulasi angsuran 12/24/36 bulan matematis presisi (*Zero-Hallucination*). |

---

## 💼 2. MENU PERINTAH STAF SALES DEALER (INTERNAL PORTAL)

Staf sales dapat mengelola seluruh alur penjualan langsung dari aplikasi Telegram di HP tanpa perlu membuka dashboard web admin atau laptop:

| Perintah Sales | Deskripsi | Format Perintah | Alur & Output Sistem |
| :--- | :--- | :--- | :--- |
| **`/sales`** | Membuka Portal Kontrol Penjualan dan menampilkan seluruh menu kerja sales. | `/sales` | Menampilkan ringkasan perintah sales & instruksi kerja cepat. |
| **`/prospek`** | Memeriksa daftar antrean calon pembeli yang belum dihubungi (*status: Pending*). | `/prospek` | Menampilkan daftar ID prospek, nama, nomor WA, domisili, dan preferensi motor yang menunggu di-follow-up. |
| **`/tawarkan [ID]`** | Memerintahkan agen AI (*Cubi Scout & Scribe*) untuk menyusunkan draf penawaran personal. | `/tawarkan LD-002` | Menyajikan analisis unit, status stok cabang, kalkulasi kredit, dan draf pesan WhatsApp yang siap dikirim. |
| **`/kirim [ID]`** | Mengesahkan draf penawaran, mendispatch pesan ke WhatsApp pembeli, dan mencetak berkas resmi PDF SPK. | `/kirim LD-002` | Status prospek berubah menjadi *Dispatched*, pesan terkirim via WA Gateway, dan file PDF SPK dikirimkan ke chat Telegram sales! |
| **`/autopipeline`** | Menjalankan otomatisasi penuh untuk menawarkan motor ke seluruh antrean prospek pending sekaligus. | `/autopipeline` | Agen AI memproses seluruh prospek pending secara beruntun dengan jeda aman anti-banned. |
| **`/tambah [Data]`** | Mendaftarkan prospek baru yang baru ditemui sales di pameran/lapangan. | `/tambah Doni, 0812998877, vario sporty, Purwokerto Timur, 4000000` | Prospek otomatis tersimpan ke Data Vault dan langsung siap dibuatkan penawaran AI. |
| **`/rapat`** | Memantau sesi negosiasi restock darurat otonom antara Cubi Supply dengan Pemasok Astra Hub. | `/rapat` | Menampilkan transkrip persetujuan alokasi unit dan nomor Surat Jalan resmi (`DO-ASTRA-XXX`). |

---

## ⚡ 3. CARA MENDAFTARKAN AUTOCOMPLETE COMMAND DI TELEGRAM (BOTFATHER)

Agar saat Anda atau siapa pun mengetik tanda garis miring **`/`** di keyboard HP langsung muncul menu pop-up perintah otomatis, daftarkan daftar perintah ini ke `@BotFather`:

1. Buka Telegram, buka chat dengan **`@BotFather`**.
2. Ketik perintah: **`/setcommands`**.
3. Pilih bot StelAgent Anda.
4. Salin dan kirim teks berikut persis:

```text
start - Mulai interaksi & panduan layanan
katalog - Daftar harga OTR motor Honda resmi
stok - Ketersediaan unit fisik showroom cabang
sales - Portal kontrol penjualan khusus tim sales
prospek - Lihat antrean prospek pending
tawarkan - Susun draf penawaran AI personal
kirim - Sahkan penawaran & cetak PDF SPK
autopipeline - Eksekusi otomatis seluruh antrean
tambah - Daftarkan prospek baru dari lapangan
rapat - Pantau hasil negosiasi restock Astra Hub
```

5. Selesai! Sekarang saat mengetik tanda `/` di chat bot, daftar tombol perintah di atas akan langsung muncul di keyboard HP pengguna.

---

## 🎯 4. SKENARIO DEMO LIVE SHOWCASE DI HADAPAN JURI LOMBA

Berikut skenario presentasi paling memukau (*wow-factor*) selama 2 menit:

```text
LANGKAH 1 (Interaksi Juri):
"Bapak/Ibu Juri, silakan buka Telegram di HP Anda dan chat ke bot kami:
'Saya minat PCX 160 di Purwokerto Timur dengan DP 5 juta'."

LANGKAH 2 (Respon Otomatis Edge AI):
Dalam 1 detik, HP juri menerima balasan rincian OTR, status stok cabang,
simulasi cicilan 12/24/36 bulan, dan tiket prospek baru (misal: LD-TEL-591).

LANGKAH 3 (Sinkronisasi Layar Monitor Dashboard):
Arahkan pandangan juri ke layar monitor laptop/proyektor:
"Perhatikan layar monitor panggung: Tiket nama Bapak/Ibu Juri baru saja
muncul secara instan di Pusat Kontrol dan Kantor 3D kami!"

LANGKAH 4 (Aksi Sales dari Telegram):
Sales mengetik di HP: "/kirim LD-TEL-591"
Seketika dokumen resmi PDF SPK ber-kop Astra Motor terbit dan langsung
terunduh di ruang obrolan Telegram juri!
```

---
*Dokumen ini diterbitkan oleh Tim Pengembang StelAgent — Agentic AI Sales Hub.*
