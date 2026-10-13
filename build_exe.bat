@echo off
setlocal
cd /d "%~dp0"
echo ===============================================
echo   SHM Defender Security Center - EXE Builder
echo ===============================================
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.10+ and enable Add Python to PATH.
  pause
  exit /b 1
)
python -m pip install --upgrade pyinstaller
if errorlevel 1 (
  echo Could not install PyInstaller. Check your internet connection.
  pause
  exit /b 1
)
python -m PyInstaller --noconfirm --clean --onefile --windowed --uac-admin --name SHM_Defender_Security_Center SHM_Defender_Security_Center.py
if errorlevel 1 (
  echo Build failed. Review the messages above.
  pause
  exit /b 1
)
echo.
echo BUILD COMPLETE
echo EXE: %CD%\dist\SHM_Defender_Security_Center.exe
echo.
pause
