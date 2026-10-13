SHM Defender Security Center
=============================

WHAT THIS IS
A simple Windows desktop interface for checking Microsoft Defender status,
requesting security intelligence updates, running Quick/Full scans, and viewing
threat detection history.

REQUIREMENTS
- Windows 10 or Windows 11
- Microsoft Defender Antivirus available on the PC
- Python 3.10+ only if running from source
- Internet connection for security intelligence updates

RUN FROM SOURCE
1. Install Python from https://www.python.org/downloads/windows/
2. During installation, enable "Add Python to PATH".
3. Double-click run_app.bat.

BUILD AN EXE
1. Install Python and ensure "Add Python to PATH" is enabled.
2. Double-click build_exe.bat.
3. When finished, find:
   dist\SHM_Defender_Security_Center.exe

The build script uses PyInstaller and requests administrator privileges at launch.
An internet connection is needed the first time to install PyInstaller.

NOTES
- This app does not disable security features or change Defender settings.
- Scans are requested through Microsoft's Defender PowerShell cmdlets.
- Scan progress and final results may be shown in Windows Security.
- "No detections returned" is not proof that a computer is malware-free.
- On some PCs, Defender cmdlets may be restricted by policy or another antivirus.
- Keep Windows and Defender updated.
- Logs are written to DefenderHealthLog.txt beside the app/executable.
