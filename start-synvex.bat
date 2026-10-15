@echo off
title SYNVEX Platform Launcher
echo ========================================================
echo   SYNVEX - AI CYBER-FORENSICS & DIGITAL IDENTITY
echo   "Unmask the Signal. Expose the Evidence."
echo ========================================================
echo.
echo [1/2] Starting Backend API Server on http://127.0.0.1:8000 ...
start "SYNVEX Backend (FastAPI)" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Vite Server on http://localhost:5173 ...
start "SYNVEX Frontend (React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  SYNVEX is now running!
echo  - Frontend UI:  http://localhost:5173/
echo  - Backend Docs: http://127.0.0.1:8000/api/docs
echo ========================================================
echo Opening browser...
start http://localhost:5173/
pause
