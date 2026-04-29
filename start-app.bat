@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   ONCOVISION AI - BOOT SEQUENCE
echo ========================================
echo.

echo STEP 1: Cleaning active ports 8000/3000...
powershell -Command "Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"

echo STEP 2: Initializing Diagnostic Backend...
start "OncoVision_Backend" cmd /k "python src/server.py"

echo STEP 3: Initializing Medical Dashboard...
if exist "frontend" (
    pushd frontend
    start "OncoVision_Frontend" cmd /k "npm run dev"
    popd
) else (
    echo [ERROR] Frontend directory missing.
)

echo.
echo ========================================
echo   SERVICES LAUNCHED SUCCESSFULLY
echo ========================================
echo.
pause
