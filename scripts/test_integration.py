"""
Script Pengujian Integrasi End-to-End (Integration Test Runner)
Agentic Sales Hub — PSAJ 2026 Showcase
"""

import sys
import os
import json
import csv
from datetime import datetime

# Pastikan path workspace ada di sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.main import (
    app,
    health_check,
    get_leads_queue,
    create_lead,
    NewLeadRequest,
    generate_pitch,
    PitchRequest,
    approve_outreach,
    ApprovalRequest,
    get_team_config_endpoint,
    get_activities,
    api_simulasi_kredit,
    SimulasiKreditRequest,
    api_generate_spk,
    GenerateSPKRequest,
    download_spk
)
from backend.engine_pdf import hitung_simulasi_kredit, hitung_angsuran_bulanan, generate_spk_pdf

def run_tests():
    print("=" * 65)
    print("🚀 MENJALANKAN INTEGRATION TEST: AGENTIC SALES HUB")
    print("=" * 65)

    passed = 0
    total = 6

    # 1. Health & Appliance Check
    print("\n[TEST 1/6] System Health & Appliance Telemetry...")
    try:
        health = health_check()
        assert health["status"] == "online"
        assert health["katalog_count"] > 0
        print(f"  ✅ Health Check OK: Mode {health['mode']}, Katalog: {health['katalog_count']} items, Total Leads: {health['total_leads']}")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")

    # 2. Tabular Data Ingestion
    print("\n[TEST 2/6] Tabular Data Ingestion & Relational Integrity...")
    try:
        ws_dir = os.path.join(BASE_DIR, "backend", "workspace")
        katalog_file = os.path.join(ws_dir, "katalog_produk.csv")
        with open(katalog_file, "r", encoding="utf-8-sig") as f:
            katalog_rows = list(csv.DictReader(f))
        pids = {r["id_produk"] for r in katalog_rows}

        bundling_file = os.path.join(ws_dir, "aturan_bundling.json")
        with open(bundling_file, "r", encoding="utf-8-sig") as f:
            bundling = json.load(f)

        for pid, rule in bundling.items():
            assert pid in pids, f"Produk utama {pid} tidak ada di katalog"
            for bonus in rule.get("cross_sell", []):
                assert bonus in pids, f"Produk bonus {bonus} tidak ada di katalog"

        print(f"  ✅ Ingestion Data OK: {len(katalog_rows)} produk, {len(bundling)} aturan bundling tervalidasi 100% konsisten.")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")

    # 3. Deterministic Financial Engine (Zero-Hallucination)
    print("\n[TEST 3/6] Deterministic Financial Engine (Tenor 12/24/36 & DP Bounds)...")
    try:
        sim = hitung_simulasi_kredit(harga_otr=27350000, nominal_dp=4000000, bunga_tahunan=0.08)
        assert sim["dp_minimal_rekomendasi"] == int(27350000 * 0.15)
        for t in [12, 24, 36]:
            k = f"tenor_{t}_bulan"
            assert k in sim["skema_tenor"]
            assert sim["skema_tenor"][k]["angsuran_per_bulan"] > 0

        # Verifikasi rumus manual vs fungsi
        angsuran_24 = hitung_angsuran_bulanan(27350000, 4000000, 24, 0.08)
        assert angsuran_24 == sim["skema_tenor"]["tenor_24_bulan"]["angsuran_per_bulan"]

        print(f"  ✅ Financial Engine OK: OTR Rp 27.350.000 | DP Rp 4.000.000 | Cicilan 24x: Rp {angsuran_24:,}/bln")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")

    # 4. Deterministic PDF Generation Engine
    print("\n[TEST 4/6] ReportLab SPK PDF Binary Generation...")
    try:
        pdf_path = generate_spk_pdf(
            nama_konsumen="Test Integrasi Sales",
            domisili="Purwokerto Timur",
            unit_barang="Vario 160 CBS (Merah)",
            harga_otr=27350000,
            nominal_dp=4000000,
            tenor_bulan=24,
            angsuran_per_bulan=1129000,
            items_bundling=[
                {"nama": "Jaket Touring All-Weather", "kategori": "Apparel", "biaya": "FREE BUNDLING"},
                {"nama": "Garansi Extended Mesin 2 Tahun", "kategori": "Proteksi", "biaya": "Rp 500.000"}
            ]
        )
        assert os.path.exists(pdf_path)
        with open(pdf_path, "rb") as pf:
            header = pf.read(8)
            assert header.startswith(b"%PDF-"), "Berkas bukan format binary PDF resmi"
        size = os.path.getsize(pdf_path)
        print(f"  ✅ PDF Engine OK: Diterbitkan {os.path.basename(pdf_path)} ({size} bytes) dengan header {header.decode('latin1').strip()}")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")

    # 5. Full Lead Lifecycle API Pipeline
    print("\n[TEST 5/6] Full Lead Pipeline: Create -> Pitch -> Approval...")
    leads_file = os.path.join(BASE_DIR, "backend", "workspace", "leads_mentah.csv")
    with open(leads_file, "rb") as f:
        original_leads_content = f.read()
    try:
        # A. Create
        req_lead = NewLeadRequest(
            nama="Konsumen Uji Coba",
            nomor_wa="6281999888777",
            minat="sporty komuter kencang",
            budget_dp=3500000,
            domisili="Banyumas Kota"
        )
        res_lead = create_lead(req_lead)
        lead_id = res_lead["lead"]["id_lead"]
        assert lead_id.startswith("LD-")

        # B. Pitch
        req_pitch = PitchRequest(
            id_lead=lead_id,
            nama="Konsumen Uji Coba",
            minat="sporty komuter kencang",
            domisili="Banyumas Kota"
        )
        res_pitch = generate_pitch(req_pitch)
        assert res_pitch["unit_rekomendasi"]
        assert res_pitch["approval_required"] is True

        # C. Approve & Dispatch
        req_appr = ApprovalRequest(
            id_lead=lead_id,
            nomor_wa="6281999888777",
            pesan_final=res_pitch["draft_pitch"]
        )
        res_appr = approve_outreach(req_appr)
        assert res_appr["status"] == "approved"
        assert res_appr["dispatched_to_gateway"] is True

        print(f"  ✅ Lead Pipeline OK: Lead #{lead_id} ({res_pitch['unit_rekomendasi']}) berhasil diproses sampai dispatch.")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")
    finally:
        with open(leads_file, "wb") as f:
            f.write(original_leads_content)

    # 6. Sales SPK API & File Download Endpoint
    print("\n[TEST 6/6] Sales SPK & Simulasi API Endpoints...")
    try:
        # Simulasi via API
        sim_res = api_simulasi_kredit(SimulasiKreditRequest(harga_otr=19300000, nominal_dp=2500000))
        assert sim_res["dp_valid"] is False  # 2.5jt < 15% dari 19.3jt (2.895jt)

        # SPK via API
        spk_res = api_generate_spk(GenerateSPKRequest(
            nama_konsumen="Konsumen Uji Coba",
            domisili="Banyumas Kota",
            unit_barang="Beat Street",
            harga_otr=19300000,
            nominal_dp=2500000,
            tenor_bulan=12
        ))
        assert spk_res["status"] == "success"
        fname = spk_res["file_name"]

        # Download endpoint
        dl = download_spk(fname)
        assert os.path.exists(dl.path)

        print(f"  ✅ Sales SPK API OK: Endpoint menerbitkan {fname} dan endpoint download siap melayani klien.")
        passed += 1
    except Exception as e:
        print(f"  ❌ GAGAL: {e}")

    print("\n" + "=" * 65)
    print(f"🏁 HASIL AKHIR: {passed}/{total} Pengujian Integrasi Berhasil.")
    print("=" * 65)

    if passed == total:
        print("🎉 Semua modul (Backend, Data Ingestion, Financial, SPK Engine) 100% SIAP!")
        return 0
    else:
        print("⚠️ Ditemukan kegagalan pada pengujian integrasi.")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())
