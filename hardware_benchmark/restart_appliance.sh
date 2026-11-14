#!/bin/bash
# ==============================================================================
# RESTART APPLIANCE — MSI CUBI NUC AI+ B206 (LINUX / UBUNTU)
# ==============================================================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================================"
echo " 🔄 ME-RESTART AGENTIC SALES HUB (STELAGENT APPLIANCE)"
echo "========================================================"

# 1. Hentikan service lama yang sedang berjalan
echo "[1/4] Menghentikan service lama pada port 8000 & 5173..."
if command -v fuser >/dev/null 2>&1; then
    fuser -k 8000/tcp >/dev/null 2>&1 || true
    fuser -k 5173/tcp >/dev/null 2>&1 || true
else
    pkill -f "uvicorn backend.main:app" >/dev/null 2>&1 || true
    pkill -f "vite" >/dev/null 2>&1 || true
fi
sleep 2

# 2. Periksa Ollama AI Engine
echo "[2/4] Memeriksa Ollama AI Runtime..."
if ! pgrep -x "ollama" > /dev/null; then
    echo "       Menyalakan 'ollama serve' di background..."
    ollama serve > /dev/null 2>&1 &
    sleep 2
else
    echo "       ✅ Ollama aktif."
fi

# 3. Jalankan Backend FastAPI
echo "[3/4] Menjalankan Backend FastAPI (Port 8000)..."
cd "$BASE_DIR" || exit 1
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
nohup python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > "$BASE_DIR/backend.log" 2>&1 &
sleep 2

# 4. Jalankan Frontend
echo "[4/4] Menjalankan Frontend Virtual Office (Port 5173)..."
cd "$BASE_DIR/frontend" || exit 1
if [ -d "dist" ]; then
    nohup npx vite preview --host 0.0.0.0 --port 5173 > "$BASE_DIR/frontend.log" 2>&1 &
else
    nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$BASE_DIR/frontend.log" 2>&1 &
fi
sleep 2

echo ""
echo "========================================================"
echo " ✅ RESTART SELESAI! SEMUA SERVICE BERJALAN NORMAL."
echo " Dashboard Kantor 3D : http://localhost:5173/office"
echo " Backend Swagger API : http://localhost:8000/docs"
echo "========================================================"
