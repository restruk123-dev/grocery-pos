@echo off
setlocal
set "POS_VENV=%~dp0.venv"
set "POS_PYTHON=%POS_VENV%\Scripts\python.exe"

if not exist "%POS_PYTHON%" (
    echo [*] Isolated Python environment not found; creating it...
    where py >nul 2>&1
    if not errorlevel 1 (
        py -3 -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
        if not errorlevel 1 (
            py -3 -m venv "%POS_VENV%"
            if not errorlevel 1 goto venv_ready
        )
    )
    where python >nul 2>&1
    if errorlevel 1 (
        echo [!] Python 3 is required. Install Python 3.11 or newer, then run this file again.
        exit /b 1
    )
    python -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1
    if errorlevel 1 (
        echo [!] Python 3.11 or newer is required.
        exit /b 1
    )
    python -m venv "%POS_VENV%"
    if errorlevel 1 (
        echo [!] Could not create the local Python environment.
        exit /b 1
    )
)

:venv_ready
if not exist "%POS_PYTHON%" (
    echo [!] The local Python environment was not created successfully.
    exit /b 1
)

"%POS_PYTHON%" -c "import fastapi, uvicorn, sqlmodel, pydantic, multipart, httpx, qrcode" >nul 2>&1
if errorlevel 1 (
    echo [*] Installing the small local runtime dependency set. Internet is needed once.
    "%POS_PYTHON%" -m pip install -r "%~dp0requirements-local.txt"
    if errorlevel 1 (
        echo [!] Dependency installation failed. Check internet access and try again.
        exit /b 1
    )
)

"%POS_PYTHON%" -c "import fastapi, uvicorn, sqlmodel, pydantic, multipart, httpx, qrcode" >nul 2>&1
if errorlevel 1 (
    echo [!] Required runtime packages are still unavailable.
    exit /b 1
)

endlocal & set "POS_PYTHON=%POS_PYTHON%"
exit /b 0
