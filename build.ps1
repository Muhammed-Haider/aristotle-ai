# Aristotle AI — Full Build Script (Phase 9)
# Produces a single .msi installer that bundles the FastAPI backend + Tauri UI.
#
# Usage (from project root, venv active):
#   .\build.ps1
#
# Output:
#   tauri-ui\src-tauri\target\release\bundle\msi\Aristotle AI_*.msi

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Aristotle AI — Phase 9 Build Pipeline  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check prerequisites ──────────────────────────────────────────────
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor Yellow

$pyVersion = python --version 2>&1
if (-not $pyVersion) { Write-Host "ERROR: Python not found." -ForegroundColor Red; exit 1 }
Write-Host "      $pyVersion" -ForegroundColor Gray

$nodeVersion = node --version 2>&1
if (-not $nodeVersion) { Write-Host "ERROR: Node.js not found." -ForegroundColor Red; exit 1 }
Write-Host "      Node $nodeVersion" -ForegroundColor Gray

$rustVersion = rustc --version 2>&1
if (-not $rustVersion) { Write-Host "ERROR: Rust not found. Install from https://rustup.rs" -ForegroundColor Red; exit 1 }
Write-Host "      $rustVersion" -ForegroundColor Gray

$piVersion = python -c "import PyInstaller; print(PyInstaller.__version__)" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      PyInstaller not found — installing..." -ForegroundColor Yellow
    pip install "PyInstaller>=6.3.0"
}
else { Write-Host "      PyInstaller $piVersion" -ForegroundColor Gray }

# ── Step 2: Build Python API backend with PyInstaller ────────────────────────
Write-Host ""
Write-Host "[2/5] Building Python API backend (PyInstaller)..." -ForegroundColor Yellow
Set-Location $Root

# Clean previous API build
foreach ($d in @("build", "dist\aristotle-api")) {
    if (Test-Path $d) { Remove-Item $d -Recurse -Force }
}

python -m PyInstaller aristotle-api.spec --noconfirm
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: PyInstaller build failed." -ForegroundColor Red; exit 1
}

$apiExe = Join-Path $Root "dist\aristotle-api\aristotle-api.exe"
if (-not (Test-Path $apiExe)) {
    Write-Host "ERROR: Expected $apiExe not found after build." -ForegroundColor Red; exit 1
}
Write-Host "      Built: $apiExe" -ForegroundColor Green

# ── Step 3: Copy API binary as Tauri sidecar ─────────────────────────────────
Write-Host ""
Write-Host "[3/5] Copying API binary to Tauri sidecar location..." -ForegroundColor Yellow

# Get the Rust target triple (e.g. x86_64-pc-windows-msvc)
$triple = (rustc -Vv 2>&1 | Select-String "^host:").ToString().Split(":")[-1].Trim()
Write-Host "      Target triple: $triple" -ForegroundColor Gray

$binDir = Join-Path $Root "tauri-ui\src-tauri\binaries"
New-Item -ItemType Directory -Path $binDir -Force | Out-Null

$sidecarName = "aristotle-api-$triple.exe"
$sidecarDest = Join-Path $binDir $sidecarName
Copy-Item $apiExe $sidecarDest -Force
Write-Host "      Copied to: $sidecarDest" -ForegroundColor Green

# ── Step 4: Install Node deps and build Tauri ─────────────────────────────────
Write-Host ""
Write-Host "[4/5] Building Tauri desktop app..." -ForegroundColor Yellow
Set-Location (Join-Path $Root "tauri-ui")

Write-Host "      Installing Node dependencies..." -ForegroundColor Gray
npm install --silent
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: npm install failed." -ForegroundColor Red; exit 1 }

Write-Host "      Running tauri build (this takes a few minutes)..." -ForegroundColor Gray
npm run tauri build
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: tauri build failed." -ForegroundColor Red; exit 1 }

# ── Step 5: Report output ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Locating installer..." -ForegroundColor Yellow
Set-Location $Root

$msi = Get-ChildItem "tauri-ui\src-tauri\target\release\bundle\msi\*.msi" -ErrorAction SilentlyContinue | Select-Object -First 1
$nsis = Get-ChildItem "tauri-ui\src-tauri\target\release\bundle\nsis\*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  Build Complete!                        " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
if ($msi)  { Write-Host "  MSI installer:  $($msi.FullName)"  -ForegroundColor White }
if ($nsis) { Write-Host "  NSIS installer: $($nsis.FullName)" -ForegroundColor White }
Write-Host ""
Write-Host "  NOTE: The installer does NOT include the GGUF model." -ForegroundColor Yellow
Write-Host "  Users must download a model and place it at:" -ForegroundColor Yellow
Write-Host "  %APPDATA%\aristotle-ai\models\model_new.gguf" -ForegroundColor Yellow
Write-Host ""
