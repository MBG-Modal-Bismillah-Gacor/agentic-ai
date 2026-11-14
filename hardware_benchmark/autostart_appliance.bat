@echo off
title AGENTIC SALES HUB — APPLIANCE LAUNCHER
color 0b

echo ========================================================
echo  MEMULAI AGENTIC SALES HUB (LOCAL AI APPLIANCE B206)
echo ========================================================
echo.

:: 1. Cek & Jalankan Ollama Local Engine
echo [1/3] Menjalankan Ollama Local AI Runtime...
start /B ollama serve
timeout /t 3 /nobreak >nul

:: 2. Jalankan Backend FastAPI (Port 8000)
echo [2/3] Membuka API Core & Swarm Heartbeat (Port 8000)...
cd /d "%~dp0\.."
if exist .venv\Scripts\activate.bat call .venv\Scripts\activate.bat
start "Backend Engine" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
timeout /t 3 /nobreak >nul

:: 3. Jalankan Frontend Virtual Office (Port 5173)
echo [3/3] Menjalankan Virtual Office Interface (Port 5173)...
cd /d "%~dp0\..\frontend"
start "Virtual Office UI" cmd /k "npm run dev -- --host 0.0.0.0 --port 5173"
timeout /t 5 /nobreak >nul

:: Buka Browser Showcase Secara Otomatis langsung ke Kantor 3D
start http://localhost:5173/office

echo.
echo ========================================================
echo  APPLIANCE ONLINE! SEMUA AGENT BEKERJA DI LOCAL-FIRST.
echo  Kantor 3D: http://localhost:5173/office
echo ========================================================
pause
