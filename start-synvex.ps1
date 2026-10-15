# SYNVEX PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "  SYNVEX - AI CYBER-FORENSICS & DIGITAL IDENTITY" -ForegroundColor Yellow
Write-Host "  'Unmask the Signal. Expose the Evidence.'" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Yellow

$root = $PSScriptRoot

Write-Host "`n[1/2] Launching Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; uvicorn app.main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/2] Launching Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "`nSYNVEX is live on localhost!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Yellow
Write-Host "Backend:  http://127.0.0.1:8000/api/docs" -ForegroundColor Yellow

Start-Process "http://localhost:5173/"
