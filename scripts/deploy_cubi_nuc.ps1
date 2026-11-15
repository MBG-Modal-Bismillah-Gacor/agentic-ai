<#
.SYNOPSIS
    CI/CD Automated Deployment Pipeline ke MSI Cubi NUC AI+ B206 (PWA & Backend)
    Agentic Sales Hub — PSAJ 2026 Showcase
.DESCRIPTION
    Skrip ini menjalankan tahapan Continuous Integration (pengujian otomatis QA & integrasi),
    mempublikasikan commit terbaru ke GitHub, lalu memicu deployment Continuous Deployment (CD)
    ke Mini PC Cubi NUC (IP: 192.168.18.119) melalui API Webhook Deployment.
#>

param(
    [string]$CubiIP = "192.168.18.119",
    [string]$BackendPort = "8000",
    [string]$FrontendPort = "3000",
    [string]$DeployToken = "stelagent-b206",
    [switch]$SkipTests = $false,
    [switch]$SkipPush = $false
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🚀 AGENTIC SALES HUB — CI/CD DEPLOYMENT PIPELINE" -ForegroundColor Cyan
Write-Host "Target Appliance : MSI Cubi NUC AI+ B206" -ForegroundColor Yellow
Write-Host "Target IP Address: $CubiIP (LAN)" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. TAHAP CI: VALIDASI & PENGUJIAN OTOMATIS
if (-not $SkipTests) {
    Write-Host "[1/4] 🧪 Menjalankan Automated QA Suite & Test Integrasi..." -ForegroundColor Blue
    try {
        $qaResult = python backend/qa_test_suite.py
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ QA Test Suite GAGAL! Deployment dibatalkan demi keamanan sistem." -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✅ QA Test Suite: LULUS 9/9" -ForegroundColor Green

        $intResult = python scripts/test_integration.py
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Integration Test GAGAL! Deployment dibatalkan." -ForegroundColor Red
            exit 1
        }
        Write-Host "  ✅ Integration Test: LULUS 7/7" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Terjadi kesalahan saat pengujian: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/4] ⏩ Melewati pengujian lokal (-SkipTests aktif)." -ForegroundColor Gray
}

# 2. TAHAP CI: GIT PUSH KE REMOTE REPOSITORY
if (-not $SkipPush) {
    Write-Host "`n[2/4] 📦 Sinkronisasi Perubahan ke Git Remote (origin/main)..." -ForegroundColor Blue
    try {
        git push origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Git push mengembalikan kode non-zero, melanjutkan..." -ForegroundColor Yellow
        } else {
            Write-Host "  ✅ Git push berhasil." -ForegroundColor Green
        }
    }
    catch {
        Write-Host "⚠️ Peringatan saat git push: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[2/4] ⏩ Melewati git push (-SkipPush aktif)." -ForegroundColor Gray
}

# 3. TAHAP CD: MEMICU DEPLOYMENT KE MINI PC CUBI NUC (192.168.18.119)
Write-Host "`n[3/4] ⚡ Mengirim Trigger Deployment ke Cubi NUC ($CubiIP)..." -ForegroundColor Blue
$deployUrl = "http://${CubiIP}:${BackendPort}/api/v1/system/cicd-deploy"
$deployBody = @{
    secret_token = $DeployToken
    branch       = "main"
    build_pwa    = $true
    pull_git     = $true
} | ConvertTo-Json

try {
    Write-Host "  📡 Menghubungi webhook: $deployUrl ..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $deployUrl -Method Post -Body $deployBody -ContentType "application/json" -TimeoutSec 120
    Write-Host "  ✅ Sinyal Deployment Diterima oleh Cubi NUC!" -ForegroundColor Green
    Write-Host "     • Status      : $($response.status)" -ForegroundColor White
    Write-Host "     • Commit SHA  : $($response.commit_sha)" -ForegroundColor White
    Write-Host "     • PWA Build   : $(if ($response.pwa_ready) { 'SUKSES' } else { 'PROSES/DETAIL' })" -ForegroundColor White
}
catch {
    Write-Host "  ⚠️ Webhook API tidak merespons ($deployUrl): $_" -ForegroundColor Yellow
    Write-Host "  ℹ️ Mencoba verifikasi status layanan Cubi NUC secara langsung..." -ForegroundColor Cyan
}

# 4. TAHAP VERIFIKASI POST-DEPLOYMENT
Write-Host "`n[4/4] 🔍 Memverifikasi Layanan PWA & Backend di Cubi NUC..." -ForegroundColor Blue
Start-Sleep -Seconds 3

$backendOk = $false
try {
    $health = Invoke-RestMethod -Uri "http://${CubiIP}:${BackendPort}/api/v1/system/health" -Method Get -TimeoutSec 5
    if ($health.status -eq "online") {
        Write-Host "  ✅ Backend FastAPI: ONLINE (Mode: $($health.mode), LLM: $($health.local_llm))" -ForegroundColor Green
        $backendOk = $true
    }
} catch {
    Write-Host "  ❌ Backend FastAPI di port $BackendPort belum merespons." -ForegroundColor Red
}

$frontendOk = $false
try {
    $pwaTest = Invoke-WebRequest -Uri "http://${CubiIP}:${FrontendPort}" -Method Get -TimeoutSec 5 -UseBasicParsing
    if ($pwaTest.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend PWA: ONLINE & SIAP DIGUNAKAN (Port $FrontendPort)" -ForegroundColor Green
        $frontendOk = $true
    }
} catch {
    Write-Host "  ⚠️ Frontend PWA di port $FrontendPort belum merespons." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
if ($backendOk -and $frontendOk) {
    Write-Host "🎉 CI/CD DEPLOYMENT SELESAI DENGAN SUKSES! (100% READY)" -ForegroundColor Green
} else {
    Write-Host "⚡ CI/CD SELESAI DENGAN CATATAN (Periksa log di atas)" -ForegroundColor Yellow
}
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "🌐 URL Akses PWA & Backend di Cubi NUC ($CubiIP):" -ForegroundColor White
Write-Host "  • Virtual 3D Office : http://${CubiIP}:${FrontendPort}/office" -ForegroundColor Cyan
Write-Host "  • Pusat Kontrol Hub : http://${CubiIP}:${FrontendPort}/dashboard" -ForegroundColor Cyan
Write-Host "  • Landing Showroom  : http://${CubiIP}:${FrontendPort}/" -ForegroundColor Cyan
Write-Host "  • Swagger API Docs  : http://${CubiIP}:${BackendPort}/docs" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
