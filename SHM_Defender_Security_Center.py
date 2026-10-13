import os
import sys
import ctypes
import subprocess
import threading
import queue
import datetime
import tkinter as tk
from tkinter import messagebox
from tkinter.scrolledtext import ScrolledText

APP_NAME = "SHM Defender Security Center"
BASE_DIR = os.path.dirname(os.path.abspath(sys.executable if getattr(sys, "frozen", False) else __file__))
LOG_FILE = os.path.join(BASE_DIR, "DefenderHealthLog.txt")

BG = "#0b1220"
PANEL = "#111c2e"
PANEL2 = "#17243a"
TEXT = "#edf4ff"
MUTED = "#a7b6cc"
BLUE = "#3b82f6"
GREEN = "#22c55e"
AMBER = "#f59e0b"
RED = "#ef4444"

def is_admin():
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False

def ps_quote_path(path):
    return path.replace("'", "''")

class DefenderApp:
    def __init__(self, root):
        self.root = root
        self.root.title(APP_NAME)
        self.root.geometry("940x690")
        self.root.minsize(820, 620)
        self.root.configure(bg=BG)
        self.events = queue.Queue()
        self.busy = False
        self.status_values = {}
        self._build_ui()
        self.root.after(150, self._poll_queue)
        self.refresh_status()

    def _build_ui(self):
        header = tk.Frame(self.root, bg=BG)
        header.pack(fill="x", padx=24, pady=(20, 12))
        tk.Label(header, text="SHM", font=("Segoe UI", 25, "bold"), fg=BLUE, bg=BG).pack(side="left")
        titlebox = tk.Frame(header, bg=BG)
        titlebox.pack(side="left", padx=(12, 0))
        tk.Label(titlebox, text="Defender Security Center", font=("Segoe UI", 20, "bold"),
                 fg=TEXT, bg=BG).pack(anchor="w")
        tk.Label(titlebox, text="Microsoft Defender • Health, updates and scans",
                 font=("Segoe UI", 10), fg=MUTED, bg=BG).pack(anchor="w", pady=(2, 0))
        self.admin_label = tk.Label(header, text=("ADMINISTRATOR" if is_admin() else "STANDARD USER"),
                                    font=("Segoe UI", 9, "bold"),
                                    fg=GREEN if is_admin() else AMBER, bg=PANEL, padx=12, pady=8)
        self.admin_label.pack(side="right", anchor="n")

        self.banner = tk.Label(self.root, text="Checking Microsoft Defender status…",
                               font=("Segoe UI", 10), fg=TEXT, bg=PANEL2, anchor="w", padx=14, pady=11)
        self.banner.pack(fill="x", padx=24, pady=(0, 14))

        cards = tk.Frame(self.root, bg=BG)
        cards.pack(fill="x", padx=24)
        self.card_values = {}
        card_specs = [
            ("antivirus", "ANTIVIRUS", "Checking…"),
            ("realtime", "REAL-TIME PROTECTION", "Checking…"),
            ("definitions", "SECURITY INTELLIGENCE", "Checking…"),
            ("lastscan", "LAST SCAN", "Checking…"),
        ]
        for i, (key, label, value) in enumerate(card_specs):
            card = tk.Frame(cards, bg=PANEL, padx=14, pady=13)
            card.grid(row=0, column=i, sticky="nsew", padx=(0 if i == 0 else 8, 0))
            cards.grid_columnconfigure(i, weight=1, uniform="cards")
            tk.Label(card, text=label, font=("Segoe UI", 8, "bold"), fg=MUTED, bg=PANEL,
                     wraplength=170, justify="left").pack(anchor="w")
            val = tk.Label(card, text=value, font=("Segoe UI", 12, "bold"), fg=TEXT, bg=PANEL,
                           wraplength=180, justify="left")
            val.pack(anchor="w", pady=(10, 0))
            self.card_values[key] = val

        section = tk.Label(self.root, text="SECURITY ACTIONS", font=("Segoe UI", 10, "bold"),
                           fg=MUTED, bg=BG)
        section.pack(anchor="w", padx=24, pady=(20, 8))

        actions = tk.Frame(self.root, bg=BG)
        actions.pack(fill="x", padx=24)
        for col in range(3):
            actions.grid_columnconfigure(col, weight=1, uniform="actions")
        self._button(actions, "⟳  Check Protection Status", self.refresh_status, BLUE, 0, 0)
        self._button(actions, "⬇  Update Security Intelligence", self.update_defender, "#2563eb", 0, 1)
        self._button(actions, "⚡  Start Quick Scan", self.quick_scan, "#15803d", 0, 2)
        self._button(actions, "▣  Start Full Scan", self.full_scan, "#b45309", 1, 0)
        self._button(actions, "◉  Protection History", self.show_history, "#475569", 1, 1)
        self._button(actions, "⚙  Open Windows Security", self.open_security, "#475569", 1, 2)

        status_frame = tk.Frame(self.root, bg=PANEL, padx=14, pady=12)
        status_frame.pack(fill="both", expand=True, padx=24, pady=(18, 10))
        tk.Label(status_frame, text="ACTIVITY & REPORT", font=("Segoe UI", 10, "bold"),
                 fg=TEXT, bg=PANEL).pack(anchor="w")
        self.output = ScrolledText(status_frame, height=8, wrap="word", font=("Consolas", 9),
                                   bg="#08101d", fg="#d8e5f7", insertbackground=TEXT,
                                   relief="flat", padx=10, pady=10)
        self.output.pack(fill="both", expand=True, pady=(9, 0))
        self.output.configure(state="disabled")

        footer = tk.Frame(self.root, bg=BG)
        footer.pack(fill="x", padx=24, pady=(0, 14))
        self.progress_text = tk.Label(footer, text="Ready", font=("Segoe UI", 9), fg=MUTED, bg=BG)
        self.progress_text.pack(side="left")
        tk.Label(footer, text="Use only with authorized Windows security settings",
                 font=("Segoe UI", 8), fg=MUTED, bg=BG).pack(side="right")

    def _button(self, parent, text, command, color, row, col):
        btn = tk.Button(parent, text=text, command=command, font=("Segoe UI", 10, "bold"),
                        fg="white", bg=color, activebackground=color, activeforeground="white",
                        relief="flat", bd=0, padx=8, pady=14, cursor="hand2")
        btn.grid(row=row, column=col, sticky="ew", padx=(0 if col == 0 else 8, 0),
                 pady=(0, 8))
        return btn

    def log(self, message):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        line = f"[{timestamp}] {message}"
        self.output.configure(state="normal")
        self.output.insert("end", line + "\n")
        self.output.see("end")
        self.output.configure(state="disabled")
        try:
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(line + "\n")
        except Exception:
            pass

    def set_banner(self, text, color=TEXT):
        self.banner.config(text=text, fg=color)

    def run_ps(self, script, success_message=None):
        if self.busy:
            messagebox.showinfo("Please wait", "Another security operation is already running.")
            return
        self.busy = True
        self.progress_text.config(text="Working… please wait")
        self.set_banner("Security operation in progress…", AMBER)

        def worker():
            try:
                result = subprocess.run(
                    ["powershell.exe", "-NoLogo", "-NoProfile", "-NonInteractive",
                     "-ExecutionPolicy", "RemoteSigned", "-Command", script],
                    capture_output=True, text=True, encoding="utf-8", errors="replace",
                    timeout=60*60
                )
                out = (result.stdout or "").strip()
                err = (result.stderr or "").strip()
                self.events.put(("done", result.returncode, out, err, success_message))
            except subprocess.TimeoutExpired:
                self.events.put(("done", 1, "", "The operation timed out. Check Windows Security for status.", None))
            except Exception as e:
                self.events.put(("done", 1, "", str(e), None))
        threading.Thread(target=worker, daemon=True).start()

    def refresh_status(self):
        script = r"""
        $ErrorActionPreference='Stop'
        try {
          $s=Get-MpComputerStatus
          $mode=[string]$s.AMRunningMode
          $av=[string]$s.AntivirusEnabled
          $rt=[string]$s.RealTimeProtectionEnabled
          $sig='Unknown'
          if ($s.AntivirusSignatureLastUpdated) { $sig=$s.AntivirusSignatureLastUpdated.ToString('yyyy-MM-dd HH:mm') + ' (age: ' + $s.AntivirusSignatureAge + ' day(s))' }
          $last='Not reported'
          if ($s.QuickScanEndTime) { $last='Quick scan: ' + $s.QuickScanEndTime.ToString('yyyy-MM-dd HH:mm') }
          if ($s.FullScanEndTime -and (!$s.QuickScanEndTime -or $s.FullScanEndTime -gt $s.QuickScanEndTime)) { $last='Full scan: ' + $s.FullScanEndTime.ToString('yyyy-MM-dd HH:mm') }
          Write-Output ('AV=' + $av)
          Write-Output ('RT=' + $rt)
          Write-Output ('SIG=' + $sig)
          Write-Output ('LAST=' + $last)
          Write-Output ('MODE=' + $mode)
          Write-Output ('SERVICE=' + [string]$s.AMServiceEnabled)
          Write-Output ('BEHAVIOR=' + [string]$s.BehaviorMonitorEnabled)
          Write-Output ('IOAV=' + [string]$s.IoavProtectionEnabled)
        } catch { Write-Error $_; exit 1 }
        """
        self.run_ps(script, "Protection status check completed.")

    def update_defender(self):
        if not messagebox.askyesno("Update Security Intelligence",
                                   "Try to update Microsoft Defender security intelligence now?\nInternet access may be required."):
            return
        script = r"""
        $ErrorActionPreference='Stop'
        Update-MpSignature
        $s=Get-MpComputerStatus
        Write-Output ('Update command completed.')
        Write-Output ('Signature version: ' + $s.AntivirusSignatureVersion)
        Write-Output ('Last updated: ' + $s.AntivirusSignatureLastUpdated)
        """
        self.run_ps(script, "Security intelligence update command completed.")

    def quick_scan(self):
        if not messagebox.askyesno("Quick Scan", "Start a Microsoft Defender Quick Scan now?"):
            return
        script = r"""
        $ErrorActionPreference='Stop'
        Start-MpScan -ScanType QuickScan
        Write-Output 'Quick scan command submitted. Scan progress/results may appear in Windows Security.'
        """
        self.run_ps(script, "Quick scan request submitted.")

    def full_scan(self):
        if not messagebox.askyesno("Full System Scan",
                                   "A full scan can take a long time and use system resources.\nStart the scan?"):
            return
        script = r"""
        $ErrorActionPreference='Stop'
        Start-MpScan -ScanType FullScan
        Write-Output 'Full scan command submitted. Scan progress/results may appear in Windows Security.'
        """
        self.run_ps(script, "Full scan request submitted.")

    def show_history(self):
        script = r"""
        $ErrorActionPreference='Stop'
        $items=Get-MpThreatDetection
        if (!$items) { Write-Output 'No threat detections were returned by Get-MpThreatDetection.' }
        else {
          $items | Select-Object -First 30 InitialDetectionTime,ThreatID,ActionSuccess,Resources |
          Format-List | Out-String -Width 180
        }
        """
        self.run_ps(script, "Threat history query completed.")

    def open_security(self):
        try:
            os.startfile("windowsdefender:")
        except Exception:
            try:
                subprocess.Popen(["cmd", "/c", "start", "", "windowsdefender:"], shell=False)
            except Exception as e:
                messagebox.showerror("Cannot open Windows Security", str(e))

    def _poll_queue(self):
        try:
            while True:
                item = self.events.get_nowait()
                if item[0] == "done":
                    _, code, out, err, success_message = item
                    self.busy = False
                    self.progress_text.config(text="Ready")
                    if out:
                        for line in out.splitlines():
                            self.log(line)
                    if err:
                        self.log("ERROR: " + err.replace("\n", " | "))
                    if code == 0:
                        self.set_banner(success_message or "Operation completed. Check the report below.", GREEN)
                    else:
                        self.set_banner("Operation failed or needs attention. See the report below.", RED)
                    if out.startswith("AV="):
                        self._parse_status(out)
                    elif "AV=" in out:
                        self._parse_status(out[out.find("AV="):])
        except queue.Empty:
            pass
        self.root.after(150, self._poll_queue)

    def _parse_status(self, out):
        data = {}
        for line in out.splitlines():
            if "=" in line:
                k, v = line.split("=", 1)
                data[k.strip()] = v.strip()
        av = data.get("AV", "Unknown")
        rt = data.get("RT", "Unknown")
        sig = data.get("SIG", "Unknown")
        last = data.get("LAST", "Unknown")
        mode = data.get("MODE", "Unknown")
        self.card_values["antivirus"].config(text="Enabled" if av.lower() == "true" else av,
                                               fg=GREEN if av.lower() == "true" else RED)
        self.card_values["realtime"].config(text="Protected" if rt.lower() == "true" else rt,
                                              fg=GREEN if rt.lower() == "true" else RED)
        self.card_values["definitions"].config(text=sig, fg=TEXT)
        self.card_values["lastscan"].config(text=last, fg=TEXT)
        if av.lower() == "true" and rt.lower() == "true":
            self.set_banner("Microsoft Defender reports antivirus and real-time protection enabled. This is not a guarantee that the PC is malware-free.", GREEN)
        else:
            self.set_banner("Defender may be inactive or real-time protection may be disabled. Review Windows Security.", AMBER)
        self.log("Defender mode: " + mode)
        self.log("Service enabled: " + data.get("SERVICE", "Unknown"))
        self.log("Behavior monitoring: " + data.get("BEHAVIOR", "Unknown"))
        self.log("IOAV protection: " + data.get("IOAV", "Unknown"))

def main():
    if os.name != "nt":
        print("This application requires Microsoft Windows.")
        return
    root = tk.Tk()
    app = DefenderApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
