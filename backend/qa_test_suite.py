import csv
import os
import sys
import time

import requests


BASE_URL = os.getenv("QA_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STOK_CSV_PATH = os.path.join(BACKEND_DIR, "workspace", "stok_cabang.csv")
failures = 0


def cetak_hasil(nomor: int, judul: str, lulus: bool, catatan: str = "") -> None:
    global failures
    status = "✅ [LULUS]" if lulus else "❌ [GAGAL]"
    print(f"{status} Tes #{nomor}: {judul}")
    if catatan:
        print(f"    └── {catatan}")
    if not lulus:
        failures += 1


def jalankan_pengujian_qa() -> int:
    global failures
    failures = 0
    print("=" * 68)
    print("AUTOMATED QA — AGENTIC SALES HUB (READ-ONLY / NO LIVE DISPATCH)")
    print("=" * 68)

    try:
        health_response = requests.get(f"{BASE_URL}/api/v1/system/health", timeout=5)
        health = health_response.json()
    except (requests.RequestException, ValueError) as error:
        cetak_hasil(1, "Kesehatan Backend", False, f"Backend tidak tersedia: {error}")
        return 1

    cetak_hasil(
        1,
        "Kesehatan Backend",
        health_response.status_code == 200 and health.get("status") == "online",
        f"HTTP {health_response.status_code} | mode={health.get('outreach_mode', 'unknown')}",
    )

    leads = []
    try:
        queue_response = requests.get(f"{BASE_URL}/api/v1/leads/queue", timeout=10)
        queue_body = queue_response.json()
        leads = queue_body.get("leads", []) if isinstance(queue_body, dict) else []
        queue_ok = (
            queue_response.status_code == 200
            and isinstance(leads, list)
            and queue_body.get("total") == len(leads)
            and len(leads) > 0
        )
        cetak_hasil(
            2,
            "Lead queue dan bentuk payload",
            queue_ok,
            f"HTTP {queue_response.status_code} | total={len(leads)}",
        )
    except (requests.RequestException, ValueError, AttributeError) as error:
        cetak_hasil(2, "Lead queue dan bentuk payload", False, str(error))

    lead = leads[0] if leads else {}
    lead_id = lead.get("id_lead", "")
    try:
        start = time.time()
        pitch_response = requests.post(
            f"{BASE_URL}/api/v1/leads/generate-pitch",
            json={
                "id_lead": lead_id,
                "nama": lead.get("nama", "QA"),
                "minat": lead.get("minat", "motor harian"),
                "domisili": lead.get("domisili", "Purwokerto Timur"),
            },
            timeout=60,
        )
        elapsed = round(time.time() - start, 2)
        pitch = pitch_response.json()
        pitch_ok = (
            pitch_response.status_code == 200
            and pitch.get("id_lead") == lead_id
            and isinstance(pitch.get("draft_pitch"), str)
            and bool(pitch["draft_pitch"].strip())
            and pitch.get("approval_required") is True
        )
        cetak_hasil(
            3,
            "Pembuatan pitch dan approval-required",
            pitch_ok,
            f"HTTP {pitch_response.status_code} | latensi={elapsed}s",
        )
    except (requests.RequestException, ValueError, AttributeError) as error:
        cetak_hasil(3, "Pembuatan pitch dan approval-required", False, str(error))

    try:
        gate_response = requests.post(
            f"{BASE_URL}/api/v1/leads/approve-and-send",
            json={
                "id_lead": lead_id,
                "pesan_final": "QA negative test; jangan dikirim.",
                "approved_by": "QA",
                "consent_confirmed": False,
            },
            timeout=5,
        )
        try:
            gate_body = gate_response.json()
        except ValueError:
            gate_body = {}
        detail = gate_body.get("detail", "")
        gate_ok = (
            gate_response.status_code == 400
            and isinstance(detail, str)
            and "consent" in detail.lower()
        )
        cetak_hasil(
            4,
            "Approval Gate menolak tanpa consent (tanpa dispatch)",
            gate_ok,
            f"HTTP {gate_response.status_code}",
        )
    except requests.RequestException as error:
        cetak_hasil(4, "Approval Gate menolak tanpa consent (tanpa dispatch)", False, str(error))

    try:
        activities_response = requests.get(f"{BASE_URL}/api/v1/system/activities", timeout=8)
        activities_body = activities_response.json()
        activities = activities_body.get("activities") if isinstance(activities_body, dict) else None
        activities_ok = (
            activities_response.status_code == 200
            and isinstance(activities, list)
            and all(isinstance(item, dict) for item in activities)
        )
        cetak_hasil(
            5,
            "Bentuk endpoint activity log",
            activities_ok,
            f"HTTP {activities_response.status_code} | records={len(activities or [])}",
        )
    except (requests.RequestException, ValueError, AttributeError) as error:
        cetak_hasil(5, "Bentuk endpoint activity log", False, str(error))

    try:
        stock_rows = []
        if os.path.isfile(STOK_CSV_PATH):
            with open(STOK_CSV_PATH, mode="r", encoding="utf-8-sig", newline="") as stock_file:
                reader = csv.DictReader(stock_file)
                stock_rows = list(reader)
                stock_header = set(reader.fieldnames or [])
        else:
            stock_header = set()
        stock_ok = (
            {"id_produk", "cabang", "stok_ready", "status"}.issubset(stock_header)
            and bool(stock_rows)
        )
        cetak_hasil(
            6,
            "Integritas schema stok_cabang.csv",
            stock_ok,
            f"rows={len(stock_rows)}",
        )
    except (OSError, csv.Error) as error:
        cetak_hasil(6, "Integritas schema stok_cabang.csv", False, str(error))

    try:
        negative_response = requests.post(
            f"{BASE_URL}/api/v1/leads/generate-pitch",
            json={
                "id_lead": "QA-ID-NOT-FOUND",
                "nama": "QA",
                "minat": "test",
                "domisili": "test",
            },
            timeout=10,
        )
        negative_ok = negative_response.status_code == 404
        cetak_hasil(
            7,
            "Lead tidak dikenal ditolak tanpa HTTP 500",
            negative_ok,
            f"HTTP {negative_response.status_code}",
        )
    except requests.RequestException as error:
        cetak_hasil(7, "Lead tidak dikenal ditolak tanpa HTTP 500", False, str(error))

    print("=" * 68)
    print(f"QA selesai: {7 - failures}/7 lulus.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(jalankan_pengujian_qa())
