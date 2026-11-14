import time
import json
import os
import sys
import requests

try:
    import psutil
except ImportError:
    psutil = None
    print("[PERINGATAN] Modul 'psutil' belum terpasang. Jalankan 'pip install psutil' untuk metrik RAM akurat.")

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_PS_URL = "http://localhost:11434/api/ps"
MODELS_TO_TEST = ["qwen2.5:3b", "hermes3:8b"]

TEST_PROMPT = """
Anda adalah Sales Intelligence Engine lokal.
Analisis data prospek berikut:
Nama: Hendra Pratama
Domisili: Purwokerto
Kebutuhan: Motor matic harian hemat DP 3.5jt
Unit Ready: Beat Street (DP Min: 2jt), Vario 160 (DP Min: 3.5jt)

Tentukan unit yang paling pas dan buatkan draf ringkas konfirmasi pesanan dalam 2 kalimat.
"""

def get_ram_usage_gb():
    if psutil:
        return round(psutil.virtual_memory().used / (1024 ** 3), 2)
    return 0.0

def inspect_ollama_runtime(model_name):
    """Memeriksa apakah model aktif ter-offload ke GPU/NPU/CPU via API /api/ps."""
    try:
        res = requests.get(OLLAMA_PS_URL, timeout=3)
        if res.status_code == 200:
            running_models = res.json().get("models", [])
            for m in running_models:
                if model_name in m.get("name", ""):
                    size_vram = m.get("size_vram", 0)
                    size_total = m.get("size", 1)
                    vram_ratio = round((size_vram / size_total) * 100, 1) if size_total > 0 else 0
                    return {
                        "runtime_status": "Loaded in Memory",
                        "size_vram_bytes": size_vram,
                        "vram_offload_percentage": f"{vram_ratio}%",
                        "hardware_acceleration": "GPU/VRAM Offloaded" if size_vram > 0 else "System RAM / CPU Bound"
                    }
    except Exception:
        pass
    return {"runtime_status": "Unknown", "hardware_acceleration": "Standard / Not Reported"}

def run_benchmark(model_name):
    print(f"\n==================================================")
    print(f"Memulai Benchmark untuk Model: [{model_name}]")
    print(f"==================================================")
    
    ram_before = get_ram_usage_gb()
    
    payload = {
        "model": model_name,
        "prompt": TEST_PROMPT,
        "stream": False,
        "temperature": 0.2
    }
    
    start_time = time.time()
    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            res_data = response.json()
            eval_count = res_data.get("eval_count", 0)                 # Jumlah token dihasilkan
            eval_duration = res_data.get("eval_duration", 1) / 1e9    # Konversi nanodetik ke detik
            prompt_eval_count = res_data.get("prompt_eval_count", 0)
            prompt_eval_duration = res_data.get("prompt_eval_duration", 1) / 1e9
            
            tps = eval_count / eval_duration if eval_duration > 0 else 0
            prompt_tps = prompt_eval_count / prompt_eval_duration if prompt_eval_duration > 0 else 0
            
            ram_after = get_ram_usage_gb()
            runtime_info = inspect_ollama_runtime(model_name)
            
            hasil = {
                "model": model_name,
                "status": "SUCCESS",
                "total_latency_seconds": round(elapsed_time, 2),
                "generated_tokens": eval_count,
                "tokens_per_second": round(tps, 2),
                "prompt_eval_tokens": prompt_eval_count,
                "prompt_tokens_per_second": round(prompt_tps, 2),
                "ram_usage_gb": ram_after,
                "ram_delta_gb": round(ram_after - ram_before, 2),
                "hardware_info": runtime_info,
                "sample_output": res_data.get("response", "").strip()[:140] + "..."
            }
            
            print(f"⏱️ Total Waktu        : {hasil['total_latency_seconds']} detik")
            print(f"🚀 Kecepatan Inferensi: {hasil['tokens_per_second']} tokens/detik")
            print(f"🧠 Akselerasi Hardware: {runtime_info['hardware_acceleration']} ({runtime_info.get('vram_offload_percentage', 'N/A')})")
            print(f"💾 Total RAM Terpakai : {hasil['ram_usage_gb']} GB (delta: +{hasil['ram_delta_gb']} GB)")
            print(f"💬 Ringkasan Respons  : \"{hasil['sample_output']}\"")
            return hasil
        else:
            print(f"❌ Error HTTP {response.status_code}: {response.text}")
            return {"model": model_name, "status": f"HTTP_ERROR_{response.status_code}", "detail": response.text}
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Gagal: Ollama tidak aktif di http://localhost:11434. Pastikan 'ollama serve' berjalan.")
        return {"model": model_name, "status": "CONNECTION_FAILED", "detail": "Ollama service offline"}
    except Exception as e:
        print(f"❌ Terjadi kesalahan: {e}")
        return {"model": model_name, "status": f"EXCEPTION: {str(e)}"}

if __name__ == "__main__":
    benchmark_results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "hardware_target": "MSI Cubi NUC AI+ B206",
        "processor": "Intel Core Ultra / Intel Arc Graphics / AI Boost NPU",
        "results": []
    }
    
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hasil_benchmark_psaj.json")
    
    for model in MODELS_TO_TEST:
        res = run_benchmark(model)
        benchmark_results["results"].append(res)
        time.sleep(3)  # Pendinginan buffer memori & thermal
        
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(benchmark_results, f, indent=2, ensure_ascii=False)
        
    print(f"\n✅ Hasil benchmark berhasil disimpan ke: {output_path}")
