# Start Aristotle AI (Python backend + Tauri frontend)
$env:TEMP = "E:\tmp"
$env:TMP  = "E:\tmp"

Write-Host "Starting Python API backend..." -ForegroundColor Cyan
$api = Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList "-m", "api.server" -PassThru -WindowStyle Hidden

Write-Host "Starting Tauri frontend..." -ForegroundColor Cyan
Set-Location tauri-ui
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
npm run tauri dev

# Cleanup on exit
$api | Stop-Process -ErrorAction SilentlyContinue
