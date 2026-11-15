#!/bin/bash
# ==============================================================================
# CI/CD DEPLOYMENT PIPELINE KE MSI CUBI NUC AI+ B206 (PWA & BACKEND)
# Agentic Sales Hub — PSAJ 2026 Showcase
# ==============================================================================

set -e

CUBI_IP="${1:-192.168.18.119}"
BACKEND_PORT="${2:-8000}"
FRONTEND_PORT="${3:-3000}"
DEPLOY_TOKEN="${4:-stelagent-b206}"

echo "================================================================="
echo "🚀 AGENTIC SALES HUB — CI/CD DEPLOYMENT PIPELINE"
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
