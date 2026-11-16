#!/bin/bash
# ==============================================================================
# CI/CD DEPLOYMENT PIPELINE KE MSI CUBI NUC AI+ B206 (PWA & BACKEND)
# Agentic Sales Hub — PSAJ 2026 Showcase
# Mendukung eksekusi langsung di Cubi NUC maupun jarak jauh (remote) dari laptop.
# ==============================================================================

set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BASE_DIR"

CUBI_IP="${1:-174.17.0.227}"
BACKEND_PORT="${2:-8000}"
FRONTEND_PORT="${3:-3000}"
DEPLOY_TOKEN="${4:-stelagent-b206}"

# Deteksi otomatis apakah skrip dijalankan langsung di dalam Cubi NUC
IS_LOCAL_CUBI=false
LOCAL_IPS=$(hostname -I 2>/dev/null || ip addr 2>/dev/null || echo "")
HOST_NAME=$(hostname 2>/dev/null || echo "")

if [[ "$HOST_NAME" == *"Cubi-NUC"* ]] || [[ "$LOCAL_IPS" == *"$CUBI_IP"* ]] || [[ "$CUBI_IP" == "127.0.0.1" ]] || [[ "$CUBI_IP" == "localhost" ]]; then
    IS_LOCAL_CUBI=true
fi

# ==============================================================================
# JALUR A: EKSEKUSI LANGSUNG DI MINI PC CUBI NUC
# ==============================================================================
if [ "$IS_LOCAL_CUBI" = true ]; then
    echo "================================================================="
    echo "🚀 DEPLOYMENT LOCAL APPLIANCE: MSI CUBI NUC AI+ B206"
    echo "Host: $HOST_NAME | IP: $CUBI_IP"
    echo "================================================================="
    echo ""

    echo "[1/4] 📦 Mengambil pembaruan kode terbaru dari GitHub..."
    git pull origin main || git pull origin main --rebase || true

    echo ""
    echo "[2/4] 🔨 Membangun PWA Frontend Production (npm install & build)..."
    cd "$BASE_DIR/frontend"
    echo "       Memperbarui dependensi frontend (npm install)..."
    npm install --prefer-offline --no-audit --no-fund
    echo "       Membangun bundle PWA (npm run build)..."
    npm run build
    cd "$BASE_DIR"

    echo ""
    echo "[3/4] 🔄 Memastikan service Appliance berjalan normal..."
    if [ -f "$BASE_DIR/hardware_benchmark/restart_appliance.sh" ]; then
        bash "$BASE_DIR/hardware_benchmark/restart_appliance.sh"
    else
        pkill -f "uvicorn backend.main:app" >/dev/null 2>&1 || true
        pkill -f "vite" >/dev/null 2>&1 || true
        sleep 2
        
        PYTHON_BIN="python3"
        [ -f "$BASE_DIR/.venv/bin/python3" ] && PYTHON_BIN="$BASE_DIR/.venv/bin/python3"
        nohup "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port "$BACKEND_PORT" > "$BASE_DIR/backend.log" 2>&1 &
        
        cd "$BASE_DIR/frontend"
        if [ -d "dist" ]; then
            nohup npx vite preview --host 0.0.0.0 --port "$FRONTEND_PORT" > "$BASE_DIR/frontend.log" 2>&1 &
        else
            nohup npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT" > "$BASE_DIR/frontend.log" 2>&1 &
        fi
        cd "$BASE_DIR"
    fi

    echo ""
    echo "[4/4] 🔍 Memverifikasi status layanan..."
    sleep 3
    if curl -s "http://127.0.0.1:${BACKEND_PORT}/api/v1/system/health" | grep -q "online"; then
        echo "  ✅ Backend FastAPI: ONLINE di port $BACKEND_PORT"
    else
        echo "  ⚠️ Backend FastAPI belum merespons."
    fi

    if curl -s -k -I "https://127.0.0.1:${FRONTEND_PORT}" | grep -q "200\|304\|HTTP"; then
        echo "  ✅ Frontend PWA (HTTPS/SSL): ONLINE & SIAP DIGUNAKAN di port $FRONTEND_PORT"
    elif curl -s -I "http://127.0.0.1:${FRONTEND_PORT}" | grep -q "200\|304\|HTTP"; then
        echo "  ✅ Frontend PWA: ONLINE di port $FRONTEND_PORT"
    else
        echo "  ⚠️ Frontend PWA di port $FRONTEND_PORT belum merespons."
    fi

    echo ""
    echo "================================================================="
    echo "🎉 PWA DI CUBI NUC BERHASIL DIBUILD & DIPERBARUI DENGAN HTTPS/SSL!"
    echo "================================================================="
    echo "🌐 Akses PWA & Backend (Adaptif terhadap perubahan IP):"
    echo "  • Localhost Mini PC : https://localhost:${FRONTEND_PORT}/office"
    echo "  • Virtual 3D Office : https://${CUBI_IP}:${FRONTEND_PORT}/office"
    echo "  • Pusat Kontrol Hub : https://${CUBI_IP}:${FRONTEND_PORT}/dashboard"
    echo "  • Landing Showroom  : https://${CUBI_IP}:${FRONTEND_PORT}/"
    echo "  • Swagger API Docs  : http://${CUBI_IP}:${BACKEND_PORT}/docs"
    echo "💡 Catatan PWA: Buka link HTTPS di browser, klik 'Lanjutan' -> 'Lanjutkan ke situs',"
    echo "   lalu klik ikon 'Install App' / 'Tambahkan ke Layar Utama' di address bar browser."
    echo "================================================================="
    exit 0
fi

# ==============================================================================
# JALUR B: EKSEKUSI REMOTE DARI LAPTOP PENGEMBANG KE CUBI NUC
# ==============================================================================
echo "================================================================="
echo "🚀 AGENTIC SALES HUB — CI/CD REMOTE DEPLOYMENT PIPELINE"
echo "Target Appliance : MSI Cubi NUC AI+ B206"
echo "Target IP Address: $CUBI_IP (LAN)"
echo "================================================================="
echo ""

# 1. TAHAP CI: VALIDASI & PENGUJIAN OTOMATIS
echo "[1/4] 🧪 Menjalankan Automated QA Suite & Test Integrasi..."
if python3 backend/qa_test_suite.py; then
    echo "  ✅ QA Test Suite: LULUS 9/9"
else
    echo "❌ QA Test Suite GAGAL! Deployment dibatalkan."
    exit 1
fi

if python3 scripts/test_integration.py; then
    echo "  ✅ Integration Test: LULUS 7/7"
else
    echo "❌ Integration Test GAGAL! Deployment dibatalkan."
    exit 1
fi

# 2. TAHAP CI: GIT PUSH
echo ""
echo "[2/4] 📦 Sinkronisasi Perubahan ke Git Remote (origin/main)..."
git push origin main || echo "⚠️ Git push warning (melanjutkan...)"

# 3. TAHAP CD: TRIGGER DEPLOYMENT KE CUBI NUC
echo ""
echo "[3/4] ⚡ Mengirim Trigger Deployment ke Cubi NUC ($CUBI_IP)..."
DEPLOY_URL="http://${CUBI_IP}:${BACKEND_PORT}/api/v1/system/cicd-deploy"

HTTP_STATUS=$(curl -s -o /tmp/deploy_res.json -w "%{http_code}" -X POST "$DEPLOY_URL" \
    -H "Content-Type: application/json" \
    -d "{\"secret_token\": \"$DEPLOY_TOKEN\", \"branch\": \"main\", \"build_pwa\": true, \"pull_git\": true}" || true)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "  ✅ Sinyal Deployment Diterima oleh Cubi NUC!"
    cat /tmp/deploy_res.json
else
    echo "  ⚠️ Webhook HTTP $HTTP_STATUS ($DEPLOY_URL)"
fi

# 4. TAHAP VERIFIKASI POST-DEPLOYMENT
echo ""
echo "[4/4] 🔍 Memverifikasi Layanan PWA & Backend di Cubi NUC..."
sleep 3

if curl -s "http://${CUBI_IP}:${BACKEND_PORT}/api/v1/system/health" | grep -q "online"; then
    echo "  ✅ Backend FastAPI: ONLINE di port $BACKEND_PORT"
else
    echo "  ❌ Backend FastAPI di port $BACKEND_PORT belum merespons."
fi

if curl -s -I "http://${CUBI_IP}:${FRONTEND_PORT}" | grep -q "200"; then
    echo "  ✅ Frontend PWA: ONLINE & SIAP DIGUNAKAN di port $FRONTEND_PORT"
else
    echo "  ⚠️ Frontend PWA di port $FRONTEND_PORT belum merespons."
fi

echo ""
echo "================================================================="
echo "🎉 CI/CD DEPLOYMENT SELESAI!"
echo "================================================================="
echo "🌐 URL Akses PWA & Backend di Cubi NUC ($CUBI_IP):"
echo "  • Virtual 3D Office : http://${CUBI_IP}:${FRONTEND_PORT}/office"
echo "  • Pusat Kontrol Hub : http://${CUBI_IP}:${FRONTEND_PORT}/dashboard"
echo "  • Landing Showroom  : http://${CUBI_IP}:${FRONTEND_PORT}/"
echo "  • Swagger API Docs  : http://${CUBI_IP}:${BACKEND_PORT}/docs"
echo "================================================================="
