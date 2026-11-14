#!/bin/bash
# ==============================================================================
# STELAGENT AUTO-UPDATER — MSI CUBI NUC AI+ B206 (LINUX / UBUNTU)
# ==============================================================================
# Memantau branch 'main' di GitHub setiap 30 detik.
# Jika ada commit baru, otomatis melakukan git pull origin main, update pip,
# build ulang frontend, dan me-restart layanan backend/frontend secara halus.
# Aman saat mode offline / Airplane Mode (menangani network error senyap tanpa crash).
# ==============================================================================

BRANCH="${1:-main}"
INTERVAL=30
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || exit 1

echo "================================================================="
echo "🚀 STELAGENT AUTO-UPDATER — MSI CUBI NUC AI+ B206 (LINUX)"
echo "   Branch target    : $BRANCH"
echo "   Interval periksa : $INTERVAL detik"
echo "   Root direktori   : $PROJECT_ROOT"
echo "================================================================="

restart_local_services() {
    echo "[AUTO-UPDATER] Me-restart proses layanan lokal StelAgent secara halus..."
    
    # Hentikan backend port 8000 jika ada
    if command -v fuser >/dev/null 2>&1; then
        fuser -k 8000/tcp >/dev/null 2>&1
    else
        pkill -f "uvicorn backend.main:app" >/dev/null 2>&1 || true
    fi

    # Hentikan frontend port 5173 jika ada
    if command -v fuser >/dev/null 2>&1; then
        fuser -k 5173/tcp >/dev/null 2>&1
    else
        pkill -f "vite" >/dev/null 2>&1 || true
    fi

    sleep 2

    # Aktifkan virtualenv jika ada
    if [ -d "$PROJECT_ROOT/.venv" ]; then
        source "$PROJECT_ROOT/.venv/bin/activate"
    fi

    # Jalankan ulang backend di background
    nohup python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/backend.log" 2>&1 &
    echo "[AUTO-UPDATER] Backend berhasil dimulai kembali (PID: $!)."

    # Jalankan ulang frontend di background
    cd "$PROJECT_ROOT/frontend" || exit 1
    if [ -d "dist" ]; then
        nohup npx vite preview --host 0.0.0.0 --port 5173 > "$PROJECT_ROOT/frontend.log" 2>&1 &
    else
        nohup npm run dev -- --host 0.0.0.0 --port 5173 > "$PROJECT_ROOT/frontend.log" 2>&1 &
    fi
    echo "[AUTO-UPDATER] Frontend berhasil dimulai kembali."
    cd "$PROJECT_ROOT" || exit 1
}

while true; do
    NOW=$(date "+%Y-%m-%d %H:%M:%S")

    # 1. Periksa koneksi dan fetch branch (senyap jika offline)
    if git fetch origin "$BRANCH" >/dev/null 2>&1; then
        LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null)
        REMOTE_COMMIT=$(git rev-parse "origin/$BRANCH" 2>/dev/null)

        if [ -n "$LOCAL_COMMIT" ] && [ -n "$REMOTE_COMMIT" ] && [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
            echo "[$NOW] ⚡ PERUBAHAN TERDETEKSI DI GITHUB!"
            echo "   Commit Lokal  : $LOCAL_COMMIT"
            echo "   Commit Remote : $REMOTE_COMMIT"
            
            echo "[AUTO-UPDATER] 1/4 Mengunduh pembaruan (git pull origin $BRANCH)..."
            git pull origin "$BRANCH"

            echo "[AUTO-UPDATER] 2/4 Memperbarui dependensi Python backend..."
            if [ -d "$PROJECT_ROOT/.venv" ]; then
                "$PROJECT_ROOT/.venv/bin/pip" install -r "$PROJECT_ROOT/backend/requirements.txt" --quiet
            else
                pip3 install -r "$PROJECT_ROOT/backend/requirements.txt" --quiet 2>/dev/null || pip install -r "$PROJECT_ROOT/backend/requirements.txt" --quiet
            fi

            echo "[AUTO-UPDATER] 3/4 Membangun ulang frontend Vite (npm run build)..."
            cd "$PROJECT_ROOT/frontend" || exit 1
            npm run build
            cd "$PROJECT_ROOT" || exit 1

            echo "[AUTO-UPDATER] 4/4 Me-restart service lokal..."
            restart_local_services

            echo "[$NOW] ✅ PEMBARUAN SUKSES DITERAPKAN. StelAgent tersinkronisasi ke commit $REMOTE_COMMIT."
        else
            echo "[$NOW] [UP-TO-DATE] Sistem selaras dengan commit ($LOCAL_COMMIT). Menunggu pembaruan..."
        fi
    else
        echo "[$NOW] [OFFLINE / AIRPLANE MODE] Koneksi ke origin/$BRANCH tidak tersedia. StelAgent tetap berjalan normal secara lokal."
    fi

    sleep "$INTERVAL"
done
