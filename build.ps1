# Aristotle AI — Build Script (Phase 9)
# Run from the project root: .\build.ps1
# Output: dist\aristotle\aristotle.exe

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=== Aristotle AI Build ===" -ForegroundColor Cyan

# 1. Check PyInstaller is installed
Write-Host "[1/4] Checking PyInstaller..." -ForegroundColor Yellow
$pi = python -c "import PyInstaller; print(PyInstaller.__version__)" 2>$null
if (-not $pi) {
    Write-Host "     PyInstaller not found. Installing..." -ForegroundColor Red
    pip install "PyInstaller>=6.3.0"
}
else {
    Write-Host "     PyInstaller $pi found." -ForegroundColor Green
}

# 2. Clean previous build
Write-Host "[2/4] Cleaning previous build..." -ForegroundColor Yellow
$foldersToClean = @("build", "dist")
foreach ($folder in $foldersToClean) {
    $path = Join-Path $ProjectRoot $folder
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host "     Removed $folder\"  -ForegroundColor Gray
    }
}

# 3. Run PyInstaller
Write-Host "[3/4] Building with PyInstaller..." -ForegroundColor Yellow
Set-Location $ProjectRoot
python -m PyInstaller aristotle.spec --noconfirm

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Build FAILED. Check the output above." -ForegroundColor Red
    exit 1
}

# 4. Copy models folder if it exists
Write-Host "[4/4] Finalising dist folder..." -ForegroundColor Yellow
$modelsSource = Join-Path $ProjectRoot "models"
$modelsDest   = Join-Path $ProjectRoot "dist\aristotle\models"

if (Test-Path $modelsSource) {
    Write-Host "     Copying models\ to dist\aristotle\models\" -ForegroundColor Gray
    Copy-Item $modelsSource $modelsDest -Recurse -Force
}
else {
    Write-Host "     WARNING: models\ folder not found." -ForegroundColor Red
    Write-Host "     Copy your .gguf model file into dist\aristotle\models\ before distributing." -ForegroundColor Red
    New-Item -ItemType Directory -Path $modelsDest -Force | Out-Null
}

# Done
Write-Host ""
Write-Host "=== Build complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Output:   dist\aristotle\aristotle.exe" -ForegroundColor White
Write-Host "To run:   .\dist\aristotle\aristotle.exe" -ForegroundColor White
Write-Host ""
Write-Host "Before distributing, ensure dist\aristotle\models\ contains your .gguf file." -ForegroundColor Yellow
Write-Host ""
