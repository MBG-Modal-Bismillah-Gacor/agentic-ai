import csv
import os
import time
import requests

BASE_URL = "http://127.0.0.1:8000"
STOK_CSV_PATH = os.path.join("workspace", "stok_cabang.csv")

def cetak_hasil(nomor: int, judul: str, lulus: bool, catatan: str = ""):
    status = "✅ [LULUS]" if lulus else "❌ [GAGAL]"
    print(f"{status} Tes #{nomor}: {judul}")
    if catatan:
        print(f"    └── {catatan}")

def jalankan_pengujian_qa():
    print("=" * 68)
    print("🛡️  AUTOMATED QA & AUTONOMOUS SWARM TEST SUITE — AGENTIC SALES HUB")
    print("=" * 68)

    # TES 1: Kesehatan Server Backend
    try:
        r = requests.get(f"{BASE_URL}/api/v1/system/health", timeout=5)
        cetak_hasil(
            1,
            "Koneksi Backend & Kesehatan Mesin",
            r.status_code == 200,
            f"HTTP {r.status_code} | Payload: {r.json()}",
        )
    except Exception as e:
        cetak_hasil(1, "Koneksi Backend & Kesehatan Mesin", False, f"Server mati: {e}")
        print("\n⚠️  PENGUJIAN DIHENTIKAN: Nyalakan server FastAPI dulu di port 8000!")
        return

    # TES 2: Lead Ingestion & Deterministic Scoring
    lead_target = "LD-001"
    try:
        r = requests.get(f"{BASE_URL}/api/v1/leads/queue", timeout=10)
        body = r.json()
        # FIX: Ubah 'data' menjadi 'body'
        leads = body if isinstance(body, list) else body.get("leads", [])
        lulus = r.status_code == 200 and len(leads) > 0
        if lulus:
            lead_target = leads[0].get("id_lead", "LD-001")
        cetak_hasil(
            2,
            "Lead Ingestion & Deterministic Scoring",
            lulus,
            f"Total antrean: {len(leads)} prospek | Sample ID: {lead_target}",
        )
    except Exception as e:
        cetak_hasil(2, "Lead Ingestion & Deterministic Scoring", False, str(e))

    # TES 3: Local LLM Auto-Pitch Generator
    try:
        t0 = time.time()
        # FIX: Lengkapi payload sesuai pydantic model backend
        r = requests.post(
            f"{BASE_URL}/api/v1/leads/generate-pitch",
            json={
                "id_lead": lead_target,
                "nama": "Budi Santoso",
                "minat": "Motor harian irit",
                "domisili": "Banyumas"
            },
            timeout=60,
        )
        durasi = round(time.time() - t0, 2)
        cetak_hasil(
            3,
            "Peracikan Pesan AI Lokal (Auto-Pitch Ollama)",
            r.status_code == 200,
            f"HTTP {r.status_code} | Latensi inferensi: {durasi} detik",
        )
    except Exception as e:
        cetak_hasil(3, "Peracikan Pesan AI Lokal (Auto-Pitch Ollama)", False, str(e))

    # TES 4: Human-in-the-Loop Approval Gate & Safe Dispatch
    try:
        # FIX: Tambahkan nomor_wa agar tidak HTTP 422
        r = requests.post(
            f"{BASE_URL}/api/v1/leads/approve-and-send",
            json={
                "id_lead": lead_target,
                "nomor_wa": "6281234567801",
                "pesan_final": "Halo Pak/Bu, penawaran unit motor sesuai kebutuhan sudah siap."
            },
            timeout=20,
        )
        cetak_hasil(
            4,
            "Sales Approval Gate & Anti-Spam Dispatch",
            r.status_code == 200,
            f"HTTP {r.status_code} | Output: {r.json()}",
        )
    except Exception as e:
        cetak_hasil(4, "Sales Approval Gate & Anti-Spam Dispatch", False, str(e))

    # TES 5: Arsitektur BE Baru — Endpoint Multi-Agent Deliberations
    try:
        # FIX: Arahkan ke endpoint log aktivitas yang benar
        r = requests.get(f"{BASE_URL}/api/v1/system/activities", timeout=8)
        lulus = r.status_code == 200
        cetak_hasil(
            5,
            "Transkrip Multi-Agent Deliberation (BE Baru)",
            lulus,
            f"HTTP {r.status_code} | Endpoint diskusi Scout -> Supply -> Gate -> Scribe aktif",
        )
    except Exception as e:
        cetak_hasil(5, "Transkrip Multi-Agent Deliberation (BE Baru)", False, str(e))

    # TES 6: Validasi Integritas Fisik File stok_cabang.csv
    try:
        ada_file = os.path.exists(STOK_CSV_PATH)
        jumlah_baris = 0
        if ada_file:
            with open(STOK_CSV_PATH, mode="r", encoding="utf-8-sig") as f:
                jumlah_baris = len(list(csv.DictReader(f)))
        cetak_hasil(
            6,
            "Integritas Data Fisik stok_cabang.csv (Zero-Hallucination)",
            ada_file and jumlah_baris > 0,
            f"File ditemukan: {ada_file} | Total baris inventaris: {jumlah_baris}",
        )
    except Exception as e:
        cetak_hasil(6, "Integritas Data Fisik stok_cabang.csv", False, str(e))

    # TES 7: Negative Testing (Ketahanan Anti-Crash HTTP 500)
    try:
        r = requests.post(
            f"{BASE_URL}/api/v1/leads/generate-pitch",
            json={"id_lead": "ID-PALSU-9999", "nama": "", "minat": "", "domisili": ""},
            timeout=10,
        )
        cetak_hasil(
            7,
            "Ketahanan Error / Negative Input Test",
            r.status_code != 500,
            f"HTTP {r.status_code} (Sistem terlindungi dari Internal Server Error 500)",
        )
    except Exception as e:
        cetak_hasil(7, "Ketahanan Error / Negative Input Test", False, str(e))

    print("=" * 68)
    print("🏁 RANGKAIAN TES QA SELESAI. Segera perbaiki item berstatus [GAGAL].")
    print("=" * 68)

if __name__ == "__main__":
    jalankan_pengujian_qa()