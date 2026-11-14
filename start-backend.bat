@echo off
title StelAgent FastAPI Backend Server
cd /d "%~dp0backend"
echo ====================================================
echo Menjalankan Backend StelAgent (FastAPI + Uvicorn)...
echo Endpoint API: http://127.0.0.1:8000
echo Dokumentasi Swagger: http://127.0.0.1:8000/docs
echo ====================================================
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
