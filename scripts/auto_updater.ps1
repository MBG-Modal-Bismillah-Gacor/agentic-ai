<#
.SYNOPSIS
    Auto-Updater Daemon untuk Mini PC MSI Cubi NUC AI+ B206 (StelAgent / Agentic AI)
.DESCRIPTION
    Memantau branch 'main' di GitHub setiap 30 detik.
    Jika ada commit baru, skrip otomatis melakukan git pull, update dependensi pip,
    rebuild frontend Vite, dan me-restart layanan lokal secara graceful.
    Aman saat offline / Airplane Mode (menangani network error secara senyap tanpa crash).
#>

param(
    [string]$Branch = "main",
    [int]$IntervalSeconds = 30
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🚀 STELAGENT AUTO-UPDATER — MSI CUBI NUC AI+ B206" -ForegroundColor Cyan
Write-Host "   Branch target    : $Branch" -ForegroundColor Gray
Write-Host "   Interval periksa : $IntervalSeconds detik" -ForegroundColor Gray
Write-Host "   Root direktori   : $ProjectRoot" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan

function Restart-LocalServices {
    Write-Host "[AUTO-UPDATER] Me-restart proses layanan lokal StelAgent secara halus..." -ForegroundColor Yellow
    
    # Hentikan proses backend python/uvicorn yang berjalan pada port 8000 jika ada
    try {
        $backendProcesses = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidToKill in $backendProcesses) {
            if ($pidToKill -and $pidToKill -ne $PID) {
                Write-Host "[AUTO-UPDATER] Menghentikan proses backend lama (PID: $pidToKill)..." -ForegroundColor DarkGray
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        # Tangani senyap
    }

    # Jalankan ulang backend di background
    try {
        Start-Process powershell -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "$ProjectRoot\run_backend.ps1" -WindowStyle Hidden
        Write-Host "[AUTO-UPDATER] Backend berhasil dimulai kembali." -ForegroundColor Green
    } catch {
        Write-Host "[AUTO-UPDATER] Galat saat memulai backend: $_" -ForegroundColor Red
    }
}

while ($true) {
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    try {
        # 1. Periksa konektivitas dan ambil update remote (senyap jika offline)
        $fetchOutput = git fetch origin $Branch 2>&1
        $fetchExitCode = $LASTEXITCODE

        if ($fetchExitCode -ne 0) {
            # Mode offline / Airplane Mode atau galat jaringan
            Write-Host "[$now] [OFFLINE / AIRPLANE MODE] Koneksi ke origin/$Branch tidak tersedia. StelAgent tetap berjalan normal secara lokal." -ForegroundColor DarkYellow
        } else {
            # 2. Bandingkan commit lokal HEAD dengan origin/$Branch
            $localCommit = (git rev-parse HEAD 2>$null).Trim()
            $remoteCommit = (git rev-parse "origin/$Branch" 2>$null).Trim()

            if ($localCommit -and $remoteCommit -and ($localCommit -ne $remoteCommit)) {
                Write-Host "[$now] ⚡ PERUBAHAN TERDETEKSI!" -ForegroundColor Yellow
                Write-Host "   Commit Lokal  : $localCommit" -ForegroundColor DarkGray
                Write-Host "   Commit Remote : $remoteCommit" -ForegroundColor Cyan
                Write-Host "[AUTO-UPDATER] 1/4 Mengunduh pembaruan (git pull origin $Branch)..." -ForegroundColor Cyan
                
                git pull origin $Branch

                Write-Host "[AUTO-UPDATER] 2/4 Memperbarui dependensi Python backend..." -ForegroundColor Cyan
                pip install -r "$ProjectRoot\backend\requirements.txt" --quiet

                Write-Host "[AUTO-UPDATER] 3/4 Membangun ulang frontend Vite (npm run build)..." -ForegroundColor Cyan
                Push-Location "$ProjectRoot\frontend"
                try {
                    npm run build
                } finally {
                    Pop-Location
                }

                Write-Host "[AUTO-UPDATER] 4/4 Me-restart service..." -ForegroundColor Cyan
                Restart-LocalServices

                Write-Host "[$now] ✅ PEMBARUAN SUKSES DITERAPKAN. StelAgent tersinkronisasi ke commit $remoteCommit." -ForegroundColor Green
            } else {
                Write-Host "[$now] [UP-TO-DATE] Sistem selaras dengan commit ($localCommit). Menunggu pembaruan berikutnya..." -ForegroundColor DarkGray
            }
        }
    } catch {
        # Tangani galat tak terduga secara senyap agar daemon tidak mati
        Write-Host "[$now] [AUTO-UPDATER NOTICE] Terjadi kendala siklus updater: $_" -ForegroundColor DarkYellow
    }

    Start-Sleep -Seconds $IntervalSeconds
}
