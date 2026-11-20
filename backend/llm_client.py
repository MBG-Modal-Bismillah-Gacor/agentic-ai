import os
import requests
from typing import Optional, Dict, Any

def call_unified_llm(
    prompt: str,
    system_prompt: str = "Anda adalah AI Assistant resmi Astra Motor.",
    temperature: float = 0.3,
    max_tokens: Optional[int] = None
) -> str:
    """
    Konektor AI Multi-Platform (Distributed Edge-AI Architecture):
    1. Primary: MSI EdgeXpert MS-C931 (Platform NVIDIA DGX™ Spark, Grace Blackwell, 1000 AI TOPS)
       Endpoint OpenAI-compatible standard: /v1/chat/completions
    2. Secondary Fallback: Local Ollama di MSI Cubi NUC (port 11434 /api/generate)
    3. Return string kosong jika seluruh endpoint offline agar fallback Zero-Hallucination aktif.
    """
    llm_api_url = os.getenv("LLM_API_URL", "http://localhost:0001/v1/chat/completions").strip()
    active_model = os.getenv("LOCAL_LLM_MODEL", os.getenv("LLM_MODEL", "qwen2.5:7b")).strip()
    api_key = os.getenv("LLM_API_KEY", "").strip()
    timeout = float(os.getenv("LLM_TIMEOUT", "30.0"))

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    # 1. Coba Primary Endpoint (MSI EdgeXpert MS-C931 / OpenAI Chat Completions)
    if llm_api_url:
        try:
            # Connect timeout 2.5s jika remote server agar tidak macet/freeze saat EdgeExpert mati
            is_local = "127.0.0.1" in llm_api_url or "localhost" in llm_api_url
            conn_timeout = timeout if is_local else 2.5
            req_timeout = (conn_timeout, timeout)

            if "/chat/completions" in llm_api_url or "/v1/" in llm_api_url:
                payload: Dict[str, Any] = {
                    "model": active_model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                    "stream": False
                }
                if max_tokens:
                    payload["max_tokens"] = max_tokens
            else:
                # Format endpoint native Ollama /api/generate
                payload = {
                    "model": active_model,
                    "prompt": f"{system_prompt}\n\n{prompt}",
                    "stream": False,
                    "temperature": temperature
                }

            res = requests.post(llm_api_url, json=payload, headers=headers, timeout=req_timeout)
            if res.status_code == 200:
                data = res.json()
                if "choices" in data and len(data["choices"]) > 0:
                    text = data["choices"][0].get("message", {}).get("content", "").strip()
                    if text:
                        return text
                elif "response" in data:
                    text = data.get("response", "").strip()
                    if text:
                        return text
        except Exception:
            pass

    # 2. Coba Secondary Fallback ke Ollama lokal di port 11434 jika URL primary bukan 11434
    if "11434" not in llm_api_url:
        try:
            payload = {
                "model": active_model,
                "prompt": f"{system_prompt}\n\n{prompt}",
                "stream": False,
                "temperature": temperature
            }
            res = requests.post("http://127.0.0.1:11434/api/generate", json=payload, timeout=45.0)
            if res.status_code == 200:
                text = res.json().get("response", "").strip()
                if text:
                    return text
        except Exception:
            pass

    return ""
