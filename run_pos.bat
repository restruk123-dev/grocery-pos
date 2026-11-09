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

python projects/grocery_pos/server.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Ilova to'xtatildi.
    pause
)
