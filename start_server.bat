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

echo [*] Server uvicorn 0.0.0.0:8000 da ishga tushirilmoqda...
echo [*] Mahalliy va mobil tarmoq IP manzili tekshirilmoqda...
echo.

python projects/grocery_pos/server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Server to'xtatildi yoki xatolik yuz berdi.
    pause
)
