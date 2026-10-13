@echo off
cd /d "%~dp0"
python SHM_Defender_Security_Center.py
if errorlevel 1 pause
