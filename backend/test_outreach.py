import csv
import json
import os
import tempfile
import unittest
from unittest.mock import Mock, patch

import main
import requests
from dispatcher import SafeOutreachDispatcher
from fastapi import HTTPException


class SafeOutreachDispatcherTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.audit_path = os.path.join(self.temp_dir.name, "audit.jsonl")
        self.dispatcher = SafeOutreachDispatcher(
            min_delay=4,
            max_delay=9,
            max_per_hour=1,
            live_enabled=False,
            audit_log_path=self.audit_path,
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    @patch("dispatcher.random.uniform", return_value=4.5)
    def test_simulation_is_safe_and_audited(self, _uniform, sleep, post):
        result = self.dispatcher.kirim_whatsapp_aman(
            "081234567801",
            "Pesan privat yang tidak boleh masuk audit.",
            audit_context={
                "lead_id": "LD-TEST",
                "approved_by": "QA",
                "consent_confirmed": True,
            },
        )

        self.assertEqual(result["status"], "terkirim_simulasi")
        self.assertEqual(result["jeda_detik"], 4.5)
        sleep.assert_called_once_with(4.5)
        post.assert_not_called()
        with open(self.audit_path, encoding="utf-8") as audit_file:
            audit = json.loads(audit_file.readline())
        self.assertEqual(audit["destination"], "***7801@c.us")
        self.assertTrue(audit["consent_confirmed"])
        self.assertNotIn("Pesan privat", json.dumps(audit))

    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    def test_rate_limit_blocks_second_attempt(self, sleep, post):
        first = self.dispatcher.kirim_whatsapp_aman("6281234567801", "uji")
        second = self.dispatcher.kirim_whatsapp_aman("6281234567801", "uji")

        self.assertEqual(first["status"], "terkirim_simulasi")
        self.assertEqual(second["status"], "ditahan_rate_limit")
        self.assertGreater(second["retry_after_seconds"], 0)
        sleep.assert_called_once()
        post.assert_not_called()

    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    def test_explicit_live_request_cannot_override_safe_configuration(self, sleep, post):
        result = self.dispatcher.kirim_whatsapp_aman(
            "6281234567801",
            "uji",
            mode_simulasi=False,
        )

        self.assertEqual(result["status"], "terkirim_simulasi")
        post.assert_not_called()
        sleep.assert_called_once()

    @patch("dispatcher.WAHA_API_KEY", "test-key")
    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    def test_live_dispatch_requires_approval_and_consent(self, sleep, post):
        dispatcher = SafeOutreachDispatcher(
            min_delay=4,
            max_delay=4,
            live_enabled=True,
            audit_log_path=self.audit_path,
        )

        result = dispatcher.kirim_whatsapp_aman(
            "6281234567801",
            "uji",
            mode_simulasi=False,
        )

        self.assertEqual(result["status"], "ditahan_approval_gate")
        sleep.assert_not_called()
        post.assert_not_called()

    @patch("dispatcher.WAHA_API_KEY", "test-key")
    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    def test_live_gateway_success_is_only_reported_after_http_success(self, sleep, post):
        response = Mock(status_code=201)
        response.raise_for_status.return_value = None
        post.return_value = response
        dispatcher = SafeOutreachDispatcher(
            min_delay=4,
            max_delay=4,
            live_enabled=True,
            audit_log_path=self.audit_path,
        )

        result = dispatcher.kirim_whatsapp_aman(
            "081234567801",
            "uji",
            mode_simulasi=False,
            audit_context={
                "lead_id": "LD-TEST",
                "approved_by": "QA",
                "consent_confirmed": True,
            },
        )

        self.assertEqual(result["status"], "terkirim_live_wa")
        self.assertEqual(post.call_args.kwargs["json"]["chatId"], "6281234567801@c.us")
        sleep.assert_called_once_with(4)

    @patch("dispatcher.WAHA_API_KEY", "test-key")
    @patch("dispatcher.requests.post", side_effect=requests.ConnectionError("offline"))
    @patch("dispatcher.time.sleep")
    def test_gateway_failure_is_not_reported_as_success(self, _sleep, post):
        dispatcher = SafeOutreachDispatcher(
            min_delay=4,
            max_delay=4,
            live_enabled=True,
            audit_log_path=self.audit_path,
        )

        result = dispatcher.kirim_whatsapp_aman(
            "6281234567801",
            "uji",
            mode_simulasi=False,
            audit_context={
                "lead_id": "LD-TEST",
                "approved_by": "QA",
                "consent_confirmed": True,
            },
        )

        self.assertEqual(result["status"], "gagal_gateway")
        post.assert_called_once()
        with open(self.audit_path, encoding="utf-8") as audit_file:
            audit = json.loads(audit_file.readline())
        self.assertEqual(audit["status"], "gagal_gateway")

    @patch("dispatcher.requests.post")
    @patch("dispatcher.time.sleep")
    def test_invalid_destination_is_rejected_without_network_or_delay(self, sleep, post):
        result = self.dispatcher.kirim_whatsapp_aman("not-a-phone", "uji")

        self.assertEqual(result["status"], "input_tidak_valid")
        sleep.assert_not_called()
        post.assert_not_called()

    @patch("dispatcher.TELEGRAM_BOT_TOKEN", "test-token")
    @patch("dispatcher.TELEGRAM_LIVE_ENABLED", True)
    @patch("dispatcher.requests.post")
    def test_telegram_dispatch_requires_approval(self, post):
        result = self.dispatcher.kirim_pdf_telegram(
            "test-chat",
            os.path.join(self.temp_dir.name, "missing.pdf"),
            "uji",
        )

        self.assertEqual(result["status"], "ditahan_approval_gate")
        post.assert_not_called()

    @patch("dispatcher.TELEGRAM_BOT_TOKEN", "test-token")
    @patch("dispatcher.TELEGRAM_LIVE_ENABLED", True)
    @patch("dispatcher.requests.post", side_effect=requests.ConnectionError("failed test-token"))
    def test_telegram_failure_redacts_token_from_error(self, post):
        pdf_path = os.path.join(self.temp_dir.name, "valid.pdf")
        with open(pdf_path, "wb") as pdf_file:
            pdf_file.write(b"%PDF-1.4 test")

        result = self.dispatcher.kirim_pdf_telegram(
            "test-chat",
            pdf_path,
            "uji",
            audit_context={
                "lead_id": "LD-TEST",
                "approved_by": "QA",
                "consent_confirmed": True,
            },
        )

        self.assertEqual(result["status"], "gagal_telegram")
        self.assertNotIn("test-token", result["error"])
        post.assert_called_once()


class ApprovalGateTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.leads_path = os.path.join(self.temp_dir.name, "leads.csv")
        self.fieldnames = [
            "id_lead",
            "nama_prospek",
            "nomor_wa",
            "minat_kebutuhan",
            "budget_dp",
            "domisili",
            "status_kontak",
        ]
        self._write_lead("pending")

    def tearDown(self):
        self.temp_dir.cleanup()

    def _write_lead(self, status):
        with open(self.leads_path, "w", encoding="utf-8", newline="") as lead_file:
            writer = csv.DictWriter(lead_file, fieldnames=self.fieldnames)
            writer.writeheader()
            writer.writerow(
                {
                    "id_lead": "LD-TEST",
                    "nama_prospek": "QA",
                    "nomor_wa": "6281234567890",
                    "minat_kebutuhan": "motor harian",
                    "budget_dp": "2500000",
                    "domisili": "Purwokerto",
                    "status_kontak": status,
                }
            )

    def _read_status(self):
        with open(self.leads_path, encoding="utf-8", newline="") as lead_file:
            return next(csv.DictReader(lead_file))["status_kontak"]

    @patch.object(main.outreach_dispatcher, "kirim_whatsapp_aman")
    def test_approval_requires_consent_before_dispatch(self, dispatch):
        with patch.object(main, "LEADS_FILE", self.leads_path):
            with self.assertRaises(HTTPException) as error:
                main.approve_outreach(
                    main.ApprovalRequest(
                        id_lead="LD-TEST",
                        pesan_final="uji",
                        approved_by="QA",
                        consent_confirmed=False,
                    )
                )

        self.assertEqual(error.exception.status_code, 400)
        dispatch.assert_not_called()
        self.assertEqual(self._read_status(), "pending")

    @patch.object(
        main.outreach_dispatcher,
        "kirim_whatsapp_aman",
        return_value={"status": "terkirim_simulasi", "jeda_detik": 4.5},
    )
    def test_approval_uses_saved_number_and_records_simulation(self, dispatch):
        with patch.object(main, "LEADS_FILE", self.leads_path):
            result = main.approve_outreach(
                main.ApprovalRequest(
                    id_lead="LD-TEST",
                    pesan_final="uji",
                    approved_by="QA",
                    consent_confirmed=True,
                )
            )

        self.assertEqual(result["status"], "simulated")
        self.assertEqual(self._read_status(), "simulated")
        self.assertEqual(dispatch.call_args.kwargs["nomor_tujuan"], "6281234567890")
        self.assertTrue(dispatch.call_args.kwargs["audit_context"]["consent_confirmed"])

    @patch.object(main.outreach_dispatcher, "kirim_whatsapp_aman")
    def test_unknown_lead_is_rejected_without_dispatch(self, dispatch):
        with patch.object(main, "LEADS_FILE", self.leads_path):
            with self.assertRaises(HTTPException) as error:
                main.approve_outreach(
                    main.ApprovalRequest(
                        id_lead="LD-MISSING",
                        pesan_final="uji",
                        approved_by="QA",
                        consent_confirmed=True,
                    )
                )

        self.assertEqual(error.exception.status_code, 404)
        dispatch.assert_not_called()

    @patch.object(main.outreach_dispatcher, "kirim_whatsapp_aman")
    def test_already_dispatched_lead_cannot_be_sent_twice(self, dispatch):
        self._write_lead("dispatched")
        with patch.object(main, "LEADS_FILE", self.leads_path):
            with self.assertRaises(HTTPException) as error:
                main.approve_outreach(
                    main.ApprovalRequest(
                        id_lead="LD-TEST",
                        pesan_final="uji",
                        approved_by="QA",
                        consent_confirmed=True,
                    )
                )

        self.assertEqual(error.exception.status_code, 409)
        dispatch.assert_not_called()


class StockStatusTests(unittest.TestCase):
    def test_zero_stock_is_never_reported_as_ready(self):
        status = main.get_stock_status(
            "MTR-02",
            "Banyumas",
            {
                "MTR-02": [
                    {
                        "cabang": "Banyumas Kota",
                        "stok_ready": "0",
                        "status": "Kosong",
                    }
                ]
            },
        )

        self.assertEqual(status, "Kosong di Banyumas Kota")

    def test_missing_stock_is_reported_as_unverified(self):
        status = main.get_stock_status("MTR-01", "Purwokerto", {})

        self.assertEqual(status, "Stok belum terverifikasi di cabang Purwokerto")


if __name__ == "__main__":
    unittest.main()
