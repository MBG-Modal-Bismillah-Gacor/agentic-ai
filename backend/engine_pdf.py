import os
import io
import json
import csv
from datetime import datetime
from typing import List, Dict, Any, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(WORKSPACE_DIR, "config", "business_profile.json")
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, "output")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==============================================================================
# DETERMINISTIC FINANCIAL ENGINE (ZERO-HALLUCINATION)
# ==============================================================================

DEFAULT_BUNGA_TAHUNAN = 0.08  # 8% flat rate per tahun
DEFAULT_MINIMAL_DP_RATIO = 0.15  # Minimal DP 15% dari OTR

def hitung_angsuran_bulanan(
    harga_otr: int,
    nominal_dp: int,
    tenor_bulan: int,
    bunga_tahunan: float = DEFAULT_BUNGA_TAHUNAN
) -> int:
    """
    Menghitung angsuran per bulan secara deterministik matematis murni.
    Rumus leasing flat:
      Pokok Hutang = Harga OTR - DP
      Total Bunga = Pokok Hutang * Bunga Tahunan * (Tenor Bulan / 12)
      Total Pembayaran = Pokok Hutang + Total Bunga
      Angsuran per Bulan = Total Pembayaran / Tenor Bulan (dibulatkan ke ribuan terdekat)
    """
    if tenor_bulan <= 0:
        raise ValueError("Tenor bulan harus lebih besar dari 0.")
    
    pokok_hutang = max(0, harga_otr - nominal_dp)
    tahun = tenor_bulan / 12.0
    total_bunga = pokok_hutang * bunga_tahunan * tahun
    total_kredit = pokok_hutang + total_bunga
    angsuran_kasar = total_kredit / tenor_bulan
    
    # Pembulatan rapi ke kelipatan seribu
    return int(round(angsuran_kasar / 1000.0) * 1000)

def hitung_simulasi_kredit(
    harga_otr: int,
    nominal_dp: int,
    bunga_tahunan: float = DEFAULT_BUNGA_TAHUNAN,
    minimal_dp_ratio: float = DEFAULT_MINIMAL_DP_RATIO
) -> Dict[str, Any]:
    """
    Menghasilkan simulasi pembiayaan lengkap untuk tenor 12, 24, dan 36 bulan.
    Memvalidasi batas minimal DP secara deterministik.
    """
    dp_minimal_rekomendasi = int(harga_otr * minimal_dp_ratio)
    dp_terpenuhi = nominal_dp >= dp_minimal_rekomendasi
    pokok_hutang = max(0, harga_otr - nominal_dp)

    skema_tenor = {}
    for tenor in [12, 24, 36]:
        tahun = tenor / 12.0
        total_bunga = int(pokok_hutang * bunga_tahunan * tahun)
        total_kredit = pokok_hutang + total_bunga
        angsuran = hitung_angsuran_bulanan(harga_otr, nominal_dp, tenor, bunga_tahunan)
        skema_tenor[f"tenor_{tenor}_bulan"] = {
            "tenor_bulan": tenor,
            "angsuran_per_bulan": angsuran,
            "total_bunga": total_bunga,
            "total_kredit": total_kredit
        }

    return {
        "harga_otr": harga_otr,
        "nominal_dp": nominal_dp,
        "dp_minimal_rekomendasi": dp_minimal_rekomendasi,
        "dp_valid": dp_terpenuhi,
        "pokok_hutang": pokok_hutang,
        "suku_bunga_tahunan_persen": round(bunga_tahunan * 100, 2),
        "skema_tenor": skema_tenor
    }

# ==============================================================================
# REPORTLAB PDF GENERATOR ENGINE
# ==============================================================================

def generate_spk_pdf(
    nama_konsumen: str,
    domisili: str,
    unit_barang: str,
    harga_otr: int,
    nominal_dp: int,
    tenor_bulan: int,
    angsuran_per_bulan: int,
    items_bundling: Optional[List[Dict[str, Any]]] = None,
    nomor_spk: Optional[str] = None,
    file_name: Optional[str] = None,
    id_lead: Optional[str] = None,
    output_dir: Optional[str] = None
) -> str:
    """
    Menghasilkan berkas fisik biner PDF SPK resmi dengan tata letak deterministik.
    Mengembalikan path absolut berkas PDF yang dihasilkan.
    """
    if items_bundling is None:
        items_bundling = []
        
    target_output_dir = output_dir or OUTPUT_DIR
    os.makedirs(target_output_dir, exist_ok=True)

    if not nomor_spk:
        tanggal_str = datetime.now().strftime("%Y%m%d")
        nomor_spk = f"SPK/AIC/{tanggal_str}/{abs(hash(nama_konsumen)) % 10000:04d}"

    # Muat konfigurasi profil entitas
    profil = {
        "nama_perusahaan": "NUSANTARA MOTOR DIGITAL HUB",
        "tipe_industri": "Otomotif & Mobilitas",
        "judul_spk": "SURAT PESANAN KENDARAAN (SPK) RESMI",
        "klausul_resmi": "*Dokumen diterbitkan secara otomatis oleh Agentic Sales Hub lokal. Sah sebagai bukti pemesanan unit dan pengajuan pembiayaan.",
        "mata_uang": "Rp"
    }
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8-sig") as f:
                profil.update(json.load(f))
        except Exception:
            pass

    judul_dokumen = profil.get("judul_spk", "SURAT PESANAN KENDARAAN (SPK) RESMI")

    clean_name = nama_konsumen.replace(' ', '_').replace('/', '_')
    if not file_name:
        if id_lead:
            file_name = f"SPK_{id_lead}_{clean_name}.pdf"
        else:
            file_name = f"SPK_{clean_name}_{datetime.now().strftime('%H%M%S')}.pdf"

    pdf_path = os.path.join(target_output_dir, file_name)

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
    story.append(Paragraph(f"<b>{judul_dokumen}</b>", title_style))
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
    klausul_teks = profil.get("klausul_resmi", "*Dokumen diterbitkan secara otomatis oleh Agentic Sales Hub lokal. Sah sebagai bukti pemesanan unit dan pengajuan pembiayaan.")
    story.append(Paragraph(f"<i>{klausul_teks}</i>", subtitle_style))
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
    print("Menjalankan uji kalkulasi finansial deterministik...")
    simulasi = hitung_simulasi_kredit(
        harga_otr=27350000,
        nominal_dp=4000000,
        bunga_tahunan=0.08
    )
    print(f"Hasil simulasi DP: Rp {simulasi['nominal_dp']:,} (Minimal DP: Rp {simulasi['dp_minimal_rekomendasi']:,}, Valid: {simulasi['dp_valid']})")
    for tenor_key, detail in simulasi["skema_tenor"].items():
        print(f" - {detail['tenor_bulan']} Bulan: Rp {detail['angsuran_per_bulan']:,}/bln (Total Kredit: Rp {detail['total_kredit']:,})")

    print("\nMenjalankan uji penerbitan SPK PDF...")
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
