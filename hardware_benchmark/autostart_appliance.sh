#!/bin/bash
# ========================================================
# AGENTIC SALES HUB — APPLIANCE LAUNCHER (LINUX / UBUNTU)
# Target Hardware: MSI Cubi NUC AI+ B206
# ========================================================

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "========================================================"
echo " MEMULAI AGENTIC SALES HUB (LOCAL AI APPLIANCE B206)"
echo "========================================================"
echo " Direktori Proyek: $BASE_DIR"
echo ""

# 1. Cek & Jalankan Ollama Local Engine
echo "[1/3] Memeriksa Ollama Local AI Runtime..."
if ! pgrep -x "ollama" > /dev/null; then
    echo "       Menyalakan 'ollama serve' di background..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
else
    echo "       ✅ Ollama sudah aktif di port 11434."
fi

# 2. Jalankan Backend FastAPI (Port 8000)
echo "[2/3] Membuka API Core & Swarm Heartbeat (Port 8000)..."
cd "$BASE_DIR"
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi
nohup python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
disown $BACKEND_PID 2>/dev/null || true
sleep 3

# 3. Jalankan Frontend Virtual Office (Port 3000)
echo "[3/3] Menjalankan Virtual Office Interface (Port 3000)..."
cd "$BASE_DIR/frontend"
if [ -d "dist" ]; then
    echo "       Menjalankan mode production preview..."
    nohup npx vite preview --host 0.0.0.0 --port 3000 > ../frontend.log 2>&1 &
else
    echo "       Menjalankan mode dev..."
    nohup npm run dev -- --host 0.0.0.0 --port 3000 > ../frontend.log 2>&1 &
fi
FRONTEND_PID=$!
disown $FRONTEND_PID 2>/dev/null || true
sleep 3

echo ""
echo "========================================================"
echo " APPLIANCE ONLINE! SEMUA AGENT BEKERJA DI LOCAL-FIRST."
echo " Dashboard Kantor 3D : http://localhost:3000/office (LAN: http://192.168.18.119:3000/office)"
echo " Pusat Kontrol Hub   : http://localhost:3000/dashboard (LAN: http://192.168.18.119:3000/dashboard)"
echo " Backend Swagger API : http://localhost:8000/docs (LAN: http://192.168.18.119:8000/docs)"
echo "========================================================"

# Buka Aplikasi Mandiri (Standalone PWA / App Mode) jika ada display
if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
    if command -v google-chrome >/dev/null 2>&1; then
        google-chrome --app=http://127.0.0.1:3000/office --no-first-run &
    elif command -v chromium-browser >/dev/null 2>&1; then
        chromium-browser --app=http://127.0.0.1:3000/office --no-first-run &
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://127.0.0.1:3000/office &
    fi
fi
