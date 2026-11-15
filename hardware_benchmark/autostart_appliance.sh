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
nohup uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
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
sleep 3

echo ""
echo "========================================================"
echo " APPLIANCE ONLINE! SEMUA AGENT BEKERJA DI LOCAL-FIRST."
echo " Dashboard Kantor 3D : http://localhost:3000/office (LAN: http://192.168.1.11:3000/office)"
echo " Pusat Kontrol Hub   : http://localhost:3000/dashboard (LAN: http://192.168.1.11:3000/dashboard)"
echo " Backend Swagger API : http://localhost:8000/docs (LAN: http://192.168.1.11:8000/docs)"
echo "========================================================"

# Buka Browser Kiosk jika ada DISPLAY
if [ -n "$DISPLAY" ] || [ -n "$WAYLAND_DISPLAY" ]; then
    google-chrome --kiosk --noerrdialogs --disable-infobars --no-first-run http://127.0.0.1:3000/office &
fi
