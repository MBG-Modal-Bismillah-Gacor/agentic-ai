import datetime
import json
import os
import random
import re
import threading
import time
from typing import Dict, Optional, Tuple

import requests


BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
WAHA_BASE_URL = os.getenv("WAHA_BASE_URL", "http://localhost:3050").rstrip("/")
WAHA_API_KEY = os.getenv("WAHA_API_KEY", "")
WAHA_SESSION = os.getenv("WAHA_SESSION", "default")
WAHA_LIVE_ENABLED = os.getenv("WAHA_LIVE_ENABLED", "").strip().lower() == "true"
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_LIVE_ENABLED = os.getenv("TELEGRAM_LIVE_ENABLED", "").strip().lower() == "true"
AUDIT_LOG_PATH = os.getenv(
    "OUTREACH_AUDIT_LOG_PATH",
    os.path.join(BACKEND_DIR, "workspace", "outreach_audit_log.jsonl"),
)


class SafeOutreachDispatcher:
    """Dispatch manually approved messages with a safe default and audit trail."""

    def __init__(
        self,
        min_delay: float = 4.0,
        max_delay: float = 9.0,
        max_per_hour: int = 30,
        live_enabled: Optional[bool] = None,
        audit_log_path: Optional[str] = None,
    ):
        if min_delay < 0 or max_delay < min_delay:
            raise ValueError("Rentang jeda dispatcher tidak valid.")
        if max_per_hour < 1:
            raise ValueError("Batas pengiriman per jam harus minimal 1.")

        self.min_delay = min_delay
        self.max_delay = max_delay
        self.max_per_hour = max_per_hour
        self.live_enabled = WAHA_LIVE_ENABLED if live_enabled is None else live_enabled
        self.audit_log_path = audit_log_path or AUDIT_LOG_PATH
        self.sent_timestamps = []
        self._rate_limit_lock = threading.Lock()

    def _reserve_rate_limit(self) -> Tuple[bool, int]:
        now = time.time()
        cutoff = now - 3600
        with self._rate_limit_lock:
            self.sent_timestamps = [stamp for stamp in self.sent_timestamps if stamp > cutoff]
            if len(self.sent_timestamps) >= self.max_per_hour:
                retry_after = max(1, int(self.sent_timestamps[0] + 3600 - now))
                return False, retry_after
            self.sent_timestamps.append(now)
        return True, 0

    def _catat_audit(self, entry: Dict[str, object]) -> None:
        audit_dir = os.path.dirname(self.audit_log_path)
        if audit_dir:
            os.makedirs(audit_dir, exist_ok=True)
        record = dict(entry)
        record["timestamp"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with open(self.audit_log_path, mode="a", encoding="utf-8") as audit_file:
            audit_file.write(json.dumps(record, ensure_ascii=False) + "\n")

    @staticmethod
    def _normalisasi_nomor(nomor_tujuan: str) -> Tuple[str, str]:
        if not isinstance(nomor_tujuan, str):
            raise ValueError("Nomor tujuan tidak valid.")

        cleaned = nomor_tujuan.strip()
        if cleaned.endswith("@c.us"):
            cleaned = cleaned[:-5]
        if not re.fullmatch(r"[+0-9()\-\s]+", cleaned):
            raise ValueError("Nomor tujuan hanya boleh berisi angka dan format telepon.")

        digits = re.sub(r"\D", "", cleaned)
        if digits.startswith("0"):
            digits = "62" + digits[1:]
        if not 8 <= len(digits) <= 15:
            raise ValueError("Nomor tujuan harus memiliki 8 sampai 15 digit.")
        return digits, f"{digits}@c.us"

    @staticmethod
    def _mask_destination(chat_id: str) -> str:
        number = chat_id[:-5] if chat_id.endswith("@c.us") else chat_id
        return f"***{number[-4:]}@c.us"

    def _audit_context(self, context: Optional[Dict[str, object]]) -> Dict[str, object]:
        if not context:
            return {}
        safe_context = {}
        for key in ("lead_id", "approved_by"):
            if context.get(key) is not None:
                safe_context[key] = str(context[key])[:100]
        if "consent_confirmed" in context:
            safe_context["consent_confirmed"] = bool(context["consent_confirmed"])
        return safe_context

    def kirim_whatsapp_aman(
        self,
        nomor_tujuan: str,
        pesan: str,
        mode_simulasi: Optional[bool] = None,
        audit_context: Optional[Dict[str, object]] = None,
    ) -> dict:
        try:
            _, chat_id = self._normalisasi_nomor(nomor_tujuan)
        except ValueError as error:
            result = {"status": "input_tidak_valid", "error": str(error)}
            self._catat_audit({"channel": "WhatsApp", **result, **self._audit_context(audit_context)})
            return result

        if not isinstance(pesan, str) or not pesan.strip():
            result = {"status": "input_tidak_valid", "error": "Pesan tidak boleh kosong."}
            self._catat_audit(
                {
                    "channel": "WhatsApp",
                    "destination": self._mask_destination(chat_id),
                    **result,
                    **self._audit_context(audit_context),
                }
            )
            return result

        live_send = self.live_enabled and mode_simulasi is not True
        context = self._audit_context(audit_context)
        if live_send and not (
            context.get("lead_id")
            and context.get("approved_by")
            and context.get("consent_confirmed") is True
        ):
            result = {
                "status": "ditahan_approval_gate",
                "error": "Pengiriman live memerlukan persetujuan staf dan konfirmasi consent.",
            }
            self._catat_audit(
                {
                    "channel": "WhatsApp",
                    "destination": self._mask_destination(chat_id),
                    **result,
                    **context,
                }
            )
            return result

        if live_send and not WAHA_API_KEY:
            result = {
                "status": "gagal_gateway",
                "error": "WAHA_API_KEY belum dikonfigurasi; pengiriman live dibatalkan.",
            }
            self._catat_audit(
                {
                    "channel": "WhatsApp",
                    "destination": self._mask_destination(chat_id),
                    **result,
                    **self._audit_context(audit_context),
                }
            )
            return result

        allowed, retry_after = self._reserve_rate_limit()
        if not allowed:
            result = {
                "status": "ditahan_rate_limit",
                "pesan": f"Batas aman {self.max_per_hour} pesan/jam tercapai.",
                "retry_after_seconds": retry_after,
            }
            self._catat_audit(
                {
                    "channel": "WhatsApp",
                    "destination": self._mask_destination(chat_id),
                    **result,
                    **self._audit_context(audit_context),
                }
            )
            return result

        delay = round(random.uniform(self.min_delay, self.max_delay), 2)
        print(f"[DISPATCHER] Jeda aman {delay} detik sebelum dispatch.")
        time.sleep(delay)

        if not live_send:
            result = {
                "status": "terkirim_simulasi",
                "destination": self._mask_destination(chat_id),
                "jeda_detik": delay,
            }
            self._catat_audit(
                {
                    "channel": "WhatsApp",
                    "mode": "simulation",
                    **result,
                    **self._audit_context(audit_context),
                }
            )
            return result

        headers = {"X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json"}
        payload = {"session": WAHA_SESSION, "chatId": chat_id, "text": pesan.strip()}
        try:
            response = requests.post(
                f"{WAHA_BASE_URL}/api/sendText",
                json=payload,
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()
            result = {
                "status": "terkirim_live_wa",
                "destination": self._mask_destination(chat_id),
                "jeda_detik": delay,
                "http_code": response.status_code,
            }
        except requests.RequestException as error:
            result = {
                "status": "gagal_gateway",
                "destination": self._mask_destination(chat_id),
                "error": str(error)[:300],
            }

        self._catat_audit(
            {
                "channel": "WhatsApp",
                "mode": "live",
                **result,
                **self._audit_context(audit_context),
            }
        )
        return result

    def kirim_pdf_telegram(
        self,
        chat_id: str,
        path_pdf: str,
        caption: str,
        audit_context: Optional[Dict[str, object]] = None,
    ) -> dict:
        if not TELEGRAM_LIVE_ENABLED:
            return {"status": "dilewati", "alasan": "Pengiriman Telegram live tidak diaktifkan."}
        if not TELEGRAM_BOT_TOKEN:
            return {"status": "dilewati", "alasan": "TELEGRAM_BOT_TOKEN belum dikonfigurasi."}
        context = self._audit_context(audit_context)
        if not (
            context.get("lead_id")
            and context.get("approved_by")
            and context.get("consent_confirmed") is True
        ):
            result = {
                "status": "ditahan_approval_gate",
                "alasan": "Pengiriman live memerlukan persetujuan staf dan konfirmasi consent.",
            }
            self._catat_audit({"channel": "Telegram", **result, **context})
            return result
        if not os.path.isfile(path_pdf) or os.path.getsize(path_pdf) == 0:
            return {"status": "dilewati", "alasan": "File PDF tidak tersedia atau kosong."}
        with open(path_pdf, "rb") as document:
            if document.read(5) != b"%PDF-":
                return {"status": "dilewati", "alasan": "File yang dipilih bukan PDF valid."}

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendDocument"
        try:
            with open(path_pdf, "rb") as document:
                response = requests.post(
                    url,
                    data={"chat_id": chat_id, "caption": caption},
                    files={"document": document},
                    timeout=20,
                )
            response.raise_for_status()
            response_body = response.json()
            if not response_body.get("ok"):
                result = {"status": "gagal_telegram", "error": "Telegram menolak pengiriman dokumen."}
            else:
                result = {"status": "terkirim_telegram", "http_code": response.status_code}
        except (requests.RequestException, ValueError) as error:
            error_message = str(error).replace(TELEGRAM_BOT_TOKEN, "[redacted]")[:300]
            result = {"status": "gagal_telegram", "error": error_message}

        self._catat_audit(
            {
                "channel": "Telegram",
                "status": result["status"],
                "filename": os.path.basename(path_pdf),
                "size_bytes": os.path.getsize(path_pdf),
            }
        )
        return result


if __name__ == "__main__":
    dispatcher = SafeOutreachDispatcher()
    result = dispatcher.kirim_whatsapp_aman(
        nomor_tujuan="6281234567801",
        pesan="Halo, ini uji simulasi dispatcher.",
        mode_simulasi=True,
    )
    print("Hasil Uji Dispatcher:", json.dumps(result, indent=2, ensure_ascii=False))
