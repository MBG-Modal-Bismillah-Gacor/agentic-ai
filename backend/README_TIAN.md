# 📑 PANDUAN DATA INGESTION & DETERMINISTIC DOCUMENT ENGINE

### Modul Khusus: Tian (Data Ingestion & Deterministic Document Specialist)
**Proyek:** Agentic Sales Hub — PSAJ 2026 Showcase  
**Repositori:** [idhmyst/agentic-ai](https://github.com/idhmyst/agentic-ai)  
**Branch Kerja:** `feature/data-pdf-engine`  
**Fokus Wilayah:** `backend/workspace/` & `backend/engine_pdf.py`

---

## 🎯 Misi & Tanggung Jawab Tian

Halo Yan! Sesuai cetak biru resmi *Business Brief* dan arahan Lord AIC (Pak Agus Indra Cahaya):
> *"Otomasi SPK & PDF Resmi: Sales cukup kirim kebutuhan... sistem langsung mencocokkan stok CSV, menghitung simulasi DP/tenor, dan menerbitkan berkas PDF SPK ber-kop dealer... Zero-Hallucination: Menyatukan katalog barang, stok fisik cabang, dan paket bundling otomatis secara deterministik lewat kode tanpa risiko salah hitung."*

Tugas utama kamu adalah menjadi **penjamin akurasi data & penerbitan dokumen legal formal**:
1. **Validasi Multi-File Deterministik:** Memastikan sistem membaca data tabular (`katalog_produk.csv`, `stok_cabang.csv`, `aturan_bundling.json`) secara konsisten dengan penanganan encoding bersih (`utf-8-sig`).
2. **Kalkulasi Finansial Presisi (Zero-Hallucination):** Seluruh hitungan matematika (harga OTR, batas minimal DP, skema angsuran 12/24/36 bulan, dan diskon paket bundling) wajib dihitung oleh kode Python murni, bukan ditebak oleh AI generatif.
3. **Penyempurnaan Engine PDF SPK (`engine_pdf.py`):** Mengembangkan generator berkas biner PDF formal berbasis pustaka `reportlab` lengkap dengan kop dealer, tabel leasing dua kolom, nomor SPK unik, dan klausul hukum siap cetak.
4. **Skema Profil Bisnis Dinamis (`business_profile.json`):** Memastikan tata letak PDF dan kolom tabel dapat beradaptasi jika use case diganti (misal: otomotif ke properti/ritel).

---

## 🛠️ Langkah Awal (Setup Lingkungan Kerja)

### 1. Masuk ke Branch Khusus
Buka terminal PowerShell di laptopmu:
```powershell
git clone https://github.com/idhmyst/agentic-ai.git
cd agentic-ai
git checkout -b feature/data-pdf-engine
```

### 2. Pasang Dependensi Dokumen
Pastikan dependensi ReportLab dan manipulasi data terpasang:
```powershell
cd backend
python -m pip install reportlab pydantic
```

---

## 📂 Struktur Berkas Kerja Tian

Seluruh pengerjaan kamu berpusat di folder `backend/`:
```text
backend/
├── README_TIAN.md               # Panduan tugas kamu ini
├── engine_pdf.py                # Core Engine Generator PDF SPK Resmi
├── config/
│   └── business_profile.json    # Metadata profil industri dinamis
├── workspace/
│   ├── katalog_produk.csv       # Master katalog & segmen kebutuhan
│   ├── stok_cabang.csv          # Ketersediaan fisik per cabang dealer
│   ├── aturan_bundling.json     # Aturan cross-selling produk komplementer
│   └── leads_mentah.csv         # Data prospek sales
└── output_dokumen/              # Direktori target penyimpanan berkas .pdf
```

---

## 📄 Implementasi Modul PDF Engine Resmi (`backend/engine_pdf.py`)

Gunakan modul deterministik berikut untuk merender berkas biner PDF SPK formal:

```python
import os
import io
import json
import csv
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(WORKSPACE_DIR, "config", "business_profile.json")
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "output_dokumen")

os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_spk_pdf(
    nama_konsumen: str,
    domisili: str,
    unit_barang: str,
    harga_otr: int,
    nominal_dp: int,
    tenor_bulan: int,
    angsuran_per_bulan: int,
    items_bundling: list = None,
    nomor_spk: str = None
) -> str:
    """
    Menghasilkan berkas fisik biner PDF SPK resmi dengan tata letak deterministik.
    Mengembalikan path absolut berkas PDF yang dihasilkan.
    """
    if items_bundling is None:
        items_bundling = []
        
    if not nomor_spk:
        tanggal_str = datetime.now().strftime("%Y%m%d")
        nomor_spk = f"SPK/AIC/{tanggal_str}/{abs(hash(nama_konsumen)) % 10000:04d}"

    # Muat konfigurasi profil entitas
    profil = {
        "nama_perusahaan": "NUSANTARA MOTOR DIGITAL HUB",
        "tipe_industri": "Otomotif & Mobilitas",
        "klausul_resmi": "*Dokumen diterbitkan secara otomatis oleh Agentic Sales Hub lokal. Sah sebagai bukti pemesanan unit dan pengajuan pembiayaan.",
        "mata_uang": "Rp"
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8-sig") as f:
                profil.update(json.load(f))
        except Exception:
            pass

    file_name = f"SPK_{nama_konsumen.replace(' ', '_')}_{datetime.now().strftime('%H%M%S')}.pdf"
    pdf_path = os.path.join(OUTPUT_DIR, file_name)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=15,
        leading=18,
        alignment=1,
        textColor=colors.HexColor('#1E293B')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        alignment=1,
        textColor=colors.HexColor('#64748B')
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    header_table_style = ParagraphStyle(
        'HeaderTable',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        fontName='Helvetica-Bold',
        textColor=colors.HexColor('#0F172A')
    )

    # 1. KOP SURAT RESMI
    story.append(Paragraph(f"<b>{profil['nama_perusahaan'].upper()}</b>", title_style))
    story.append(Paragraph(f"Sektor: {profil['tipe_industri']} | Layanan Mandiri Local Appliance B206", subtitle_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>SURAT PESANAN KENDARAAN (SPK) RESMI</b>", title_style))
    story.append(Paragraph(f"Nomor Dokumen: <b>{nomor_spk}</b> | Tanggal: {datetime.now().strftime('%d-%m-%Y %H:%M')}", subtitle_style))
    story.append(Spacer(1, 15))

    # 2. IDENTITAS PEMESAN & UNIT
    curr = profil["mata_uang"]
    info_data = [
        [Paragraph("<b>Nama Pemesan</b>", body_style), Paragraph(f": {nama_konsumen}", body_style)],
        [Paragraph("<b>Domisili / Wilayah</b>", body_style), Paragraph(f": {domisili}", body_style)],
        [Paragraph("<b>Unit Dipesan</b>", body_style), Paragraph(f": <b>{unit_barang}</b>", body_style)],
        [Paragraph("<b>Harga OTR Dasar</b>", body_style), Paragraph(f": {curr} {harga_otr:,}", body_style)],
        [Paragraph("<b>Uang Muka (DP) Disepakati</b>", body_style), Paragraph(f": <b>{curr} {nominal_dp:,}</b>", body_style)],
        [Paragraph("<b>Jangka Waktu (Tenor)</b>", body_style), Paragraph(f": {tenor_bulan} Bulan", body_style)],
        [Paragraph("<b>Estimasi Angsuran / Bulan</b>", body_style), Paragraph(f": <b>{curr} {angsuran_per_bulan:,} / bln</b>", body_style)],
    ]
    t_info = Table(info_data, colWidths=[160, 360])
    t_info.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_info)
    story.append(Spacer(1, 15))

    # 3. RINCIAN BUNDLING & AKSESORIS KOMPLEMENTER (JIKA ADA)
    if items_bundling:
        story.append(Paragraph("<b>PAKET BUNDLING & LAYANAN KOMPLEMENTER</b>", header_table_style))
        story.append(Spacer(1, 5))
        bundling_table = [
            [Paragraph("<b>Item Pelengkap</b>", header_table_style), Paragraph("<b>Kategori</b>", header_table_style), Paragraph("<b>Status Biaya</b>", header_table_style)]
        ]
        for it in items_bundling:
            bundling_table.append([
                Paragraph(it.get("nama", "-"), body_style),
                Paragraph(it.get("kategori", "Aksesoris"), body_style),
                Paragraph(it.get("biaya", "Termasuk Promo"), body_style)
            ])
        t_bundling = Table(bundling_table, colWidths=[240, 140, 140])
        t_bundling.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_bundling)
        story.append(Spacer(1, 15))

    # 4. KLAUSUL HUKUM & TANDA TANGAN
    story.append(Paragraph(f"<i>{profil['klausul_resmi']}</i>", subtitle_style))
    story.append(Spacer(1, 30))

    ttd_data = [
        [Paragraph("Pemohon / Pembeli,", subtitle_style), Paragraph("Petugas Sales Dealer,", subtitle_style)],
        ["", ""],
        ["", ""],
        [Paragraph(f"( <b>{nama_konsumen}</b> )", subtitle_style), Paragraph("( <b>Sales Executive</b> )", subtitle_style)]
    ]
    t_ttd = Table(ttd_data, colWidths=[260, 260])
    t_ttd.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,1), (-1,1), 35),
    ]))
    story.append(t_ttd)

    doc.build(story)
    return pdf_path

if __name__ == "__main__":
    # Uji Coba Independen oleh Tian
    print("Menjalankan uji penerbitan SPK PDF...")
    hasil = generate_spk_pdf(
        nama_konsumen="Hendra Pratama",
        domisili="Purwokerto Timur",
        unit_barang="Vario 160 CBS (Merah)",
        harga_otr=27350000,
        nominal_dp=4000000,
        tenor_bulan=24,
        angsuran_per_bulan=1350000,
        items_bundling=[
            {"nama": "Jaket Touring All-Weather", "kategori": "Apparel", "biaya": "FREE BUNDLING"},
            {"nama": "Garansi Extended Mesin 2 Tahun", "kategori": "Proteksi", "biaya": "Rp 500.000"}
        ]
    )
    print(f"✅ Dokumen SPK berhasil diterbitkan: {hasil}")
```

---

## 🧪 Validasi Integritas Data Tabular (`workspace/`)

Tian bertanggung jawab memastikan tabel data selalu bersih dari karakter asing yang membuat parser rusak:

1. **Format CSV:** Selalu gunakan koma (`,`) sebagai delimiter, bukan titik koma (`;`).
2. **Karakter Bersih:** Hapus tanda pemisah ribuan titik pada angka (contoh yang benar: `27350000`, bukan `27.350.000`) agar fungsi `int()` di Python tidak mengalami *ValueError*.
3. **Validasi Relasi Antar-File:** Pastikan setiap `id_produk` yang ada di `aturan_bundling.json` benar-benar terdaftar di `katalog_produk.csv`.

---

## 🚀 Alur Sinkronisasi Git untuk Tian

Setelah menguji pembuatan PDF dan merapikan dataset CSV:
```powershell
git add backend/engine_pdf.py backend/workspace/ backend/config/
git commit -m "feat(document): implementasi generator PDF SPK deterministik dan perapian dataset tabular"
git push origin feature/data-pdf-engine
```

Setelah di-push, Tian dapat mengabari Idham agar fungsi `generate_spk_pdf()` langsung dipanggil di endpoint backend `POST /api/v1/sales/generate-spk`.
