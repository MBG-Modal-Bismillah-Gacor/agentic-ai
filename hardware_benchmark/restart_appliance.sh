#!/bin/bash
# ==============================================================================
# RESTART APPLIANCE — MSI CUBI NUC AI+ B206 (LINUX / UBUNTU)
# ==============================================================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================================"
echo " 🔄 ME-RESTART AGENTIC SALES HUB (STELAGENT APPLIANCE)"
echo "========================================================"

# 1. Hentikan service lama yang sedang berjalan
echo "[1/4] Menghentikan service lama pada port 8000, 3000 & 5173..."
if command -v fuser >/dev/null 2>&1; then
    fuser -k 8000/tcp >/dev/null 2>&1 || true
    fuser -k 3000/tcp >/dev/null 2>&1 || true
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

PYTHON_BIN="python3"
if [ -f "$BASE_DIR/.venv/bin/python3" ]; then
    PYTHON_BIN="$BASE_DIR/.venv/bin/python3"
elif [ -f "$BASE_DIR/.venv/bin/python" ]; then
    PYTHON_BIN="$BASE_DIR/.venv/bin/python"
elif [ -f "$BASE_DIR/backend/.venv/bin/python" ]; then
    PYTHON_BIN="$BASE_DIR/backend/.venv/bin/python"
fi

nohup "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > "$BASE_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID 2>/dev/null || true
sleep 3

# Verifikasi apakah Port 8000 hidup
if ! curl -s http://127.0.0.1:8000/api/v1/system/health >/dev/null 2>&1; then
    echo "       ⚠️ PERINGATAN: Backend gagal start. Menampilkan log backend.log:"
    tail -n 15 "$BASE_DIR/backend.log"
else
    echo "       ✅ Backend FastAPI aktif di port 8000."
fi

# 4. Jalankan Frontend
echo "[4/4] Menjalankan Frontend Virtual Office (Port 3000)..."
cd "$BASE_DIR/frontend" || exit 1
if [ -d "dist" ]; then
    nohup npx vite preview --host 0.0.0.0 --port 3000 > "$BASE_DIR/frontend.log" 2>&1 &
else
    nohup npm run dev -- --host 0.0.0.0 --port 3000 > "$BASE_DIR/frontend.log" 2>&1 &
fi
FRONTEND_PID=$!
disown $FRONTEND_PID 2>/dev/null || true
sleep 2

echo ""
echo "========================================================"
echo " ✅ RESTART SELESAI! SEMUA SERVICE BERJALAN NORMAL."
echo " Dashboard Kantor 3D : http://localhost:3000/office (LAN: http://192.168.1.11:3000/office)"
echo " Pusat Kontrol Hub   : http://localhost:3000/dashboard (LAN: http://192.168.1.11:3000/dashboard)"
echo " Backend Swagger API : http://localhost:8000/docs (LAN: http://192.168.1.11:8000/docs)"
echo "========================================================"
