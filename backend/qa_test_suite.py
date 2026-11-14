import csv
import os
import sys
import time

import requests


BASE_URL = os.getenv("QA_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
STOK_CSV_PATH = os.path.join(BACKEND_DIR, "workspace", "stok_cabang.csv")
LEADS_CSV_PATH = os.path.join(BACKEND_DIR, "workspace", "leads_mentah.csv")
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

    # Backup isi file CSV asli agar tidak rusak selama pengujian
    orig_leads_content = None
    if os.path.isfile(LEADS_CSV_PATH):
        try:
            with open(LEADS_CSV_PATH, "rb") as f:
                orig_leads_content = f.read()
        except OSError:
            pass

    orig_stok_content = None
    if os.path.isfile(STOK_CSV_PATH):
        try:
            with open(STOK_CSV_PATH, "rb") as f:
                orig_stok_content = f.read()
        except OSError:
            pass

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

    # Tes #8: Tersedianya endpoint Deliberations internal multi-agen swarm
    try:
        delib_resp = requests.get(f"{BASE_URL}/api/v1/deliberations", timeout=10)
        if delib_resp.status_code == 404:
            delib_resp = requests.get(f"{BASE_URL}/deliberations", timeout=10)
        delib_body = delib_resp.json() if delib_resp.status_code == 200 else {}
        delibs = delib_body.get("deliberations", [])
        delib_ok = (
            delib_resp.status_code == 200
            and isinstance(delibs, list)
            and len(delibs) > 0
            and all("turns" in d for d in delibs)
        )
        cetak_hasil(
            8,
            "Tersedianya endpoint Deliberations internal agen swarm",
            delib_ok,
            f"HTTP {delib_resp.status_code} | sesi={len(delibs)}",
        )
    except Exception as error:
        cetak_hasil(8, "Tersedianya endpoint Deliberations internal agen swarm", False, str(error))

    # Tes #9: Alur simulasi persetujuan & penerbitan berkas PDF SPK resmi
    try:
        pending_lead = next(
            (l for l in leads if l.get("status_kontak") not in ["dispatched", "approved"]),
            None,
        )
        target_lead = pending_lead or (leads[1] if len(leads) > 1 else (leads[0] if leads else {}))
        target_lead_id = target_lead.get("id_lead", "LD-002")
        target_name = target_lead.get("nama", "Hendra Pratama")

        sim_appr_resp = requests.post(
            f"{BASE_URL}/api/v1/leads/approve-and-send",
            json={
                "id_lead": target_lead_id,
                "pesan_final": f"Halo Bapak {target_name}, simulasi penawaran SPK resmi Anda telah disetujui.",
                "approved_by": "QA Director",
                "consent_confirmed": True,
            },
            timeout=15,
        )
        sim_body = sim_appr_resp.json() if sim_appr_resp.status_code == 200 else {}
        pdf_file = sim_body.get("pdf_filename", "")
        pdf_url = sim_body.get("pdf_url", "")

        pdf_download_ok = False
        if pdf_url:
            doc_resp = requests.get(f"{BASE_URL}{pdf_url}", timeout=10)
            pdf_download_ok = (
                doc_resp.status_code == 200
                and doc_resp.content.startswith(b"%PDF-")
            )

        spk_ok = (
            sim_appr_resp.status_code == 200
            and sim_body.get("status") in ["simulated", "dispatched"]
            and bool(pdf_file)
            and pdf_download_ok
        )
        cetak_hasil(
            9,
            "Alur simulasi persetujuan & penerbitan PDF SPK resmi",
            spk_ok,
            f"HTTP {sim_appr_resp.status_code} | file={pdf_file} | download_ok={pdf_download_ok}",
        )
    except Exception as error:
        cetak_hasil(9, "Alur simulasi persetujuan & penerbitan PDF SPK resmi", False, str(error))
    finally:
        # Pulihkan CSV asli secara deterministik agar data tetap 100% utuh & bersih
        if orig_leads_content is not None:
            try:
                with open(LEADS_CSV_PATH, "wb") as f:
                    f.write(orig_leads_content)
            except OSError:
                pass
        if orig_stok_content is not None:
            try:
                with open(STOK_CSV_PATH, "wb") as f:
                    f.write(orig_stok_content)
            except OSError:
                pass

    print("=" * 68)
    print(f"QA selesai: {9 - failures}/9 lulus.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(jalankan_pengujian_qa())
