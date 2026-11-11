@echo off
chcp 65001 >nul
title GroceryStore POS Terminal
cls

echo ================================================================
echo    🛒 GROCERY STORE POS TERMINAL
echo ================================================================
echo.

cd /d "%~dp0..\.."
set PYTHONPATH=%CD%
if not defined DATA_DIR set "DATA_DIR=%~dp0store_data"
if not defined BIND_HOST set "BIND_HOST=127.0.0.1"

call "%~dp0ensure_runtime.bat"
if errorlevel 1 (
    pause
    exit /b 1
)

"%POS_PYTHON%" projects\grocery_pos\setup_store.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] Dastlabki sozlash bajarilmadi.
    pause
    exit /b 1
)

"%POS_PYTHON%" projects\grocery_pos\server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Ilova to'xtatildi.
    pause
)
