@echo off
chcp 65001 >nul
title GroceryStore POS & Accounting Server
cls

echo ================================================================
echo    🛒 GROCERY STORE POS - SERVERNI ISHGA TUSHIRISH
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

echo [*] Birinchi sozlash tekshirilmoqda; mavjud baza tozalanmaydi...
"%POS_PYTHON%" projects\grocery_pos\setup_store.py
if %ERRORLEVEL% NEQ 0 (
    echo [!] Dastlabki sozlash bajarilmadi.
    pause
    exit /b 1
)

if "%BIND_HOST%"=="127.0.0.1" echo [*] Local-only server 127.0.0.1:8000 da ishga tushirilmoqda...
if not "%BIND_HOST%"=="127.0.0.1" echo [!] Server BIND_HOST=%BIND_HOST% ga bog'lanadi. LAN xavfsizligiga ishonch hosil qiling.
echo.

"%POS_PYTHON%" projects\grocery_pos\server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server to'xtatildi yoki xatolik yuz berdi.
    pause
)
