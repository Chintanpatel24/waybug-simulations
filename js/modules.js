window.WAUBUG_MODULES = {
  reconnaissance: [
    "scan", "recon", "enumerate", "whois", "traceroute", "nslookup", "asset-map", "surface"
  ],
  initialAccessDefense: [
    "phish-audit", "exploit-check", "bruteforce-detect", "auth-audit", "victim-status", "webshell-detect"
  ],
  executionDefense: [
    "execute-safe", "powershell-audit", "macro-audit", "dll-check"
  ],
  persistenceDefense: [
    "persist-check", "backdoor-scan", "rootkit-scan", "schedule-audit"
  ],
  privilegeDefense: [
    "escalate-detect", "uac-monitor", "kernel-patch", "token-guard"
  ],
  credentialDefense: [
    "dump-protect", "mimikatz-detect", "keylog-detect", "hash-audit"
  ],
  discovery: [
    "discover", "netstat", "processes", "users", "services", "shares"
  ],
  lateralDefense: [
    "lateral-detect", "psexec-monitor", "wmi-monitor", "rdp-audit"
  ],
  collectionDefense: [
    "collect-evidence", "screenshot-log", "clipboard-guard", "webcam-guard"
  ],
  exfilDefense: [
    "exfil-detect", "upload-audit", "dns-tunnel-detect", "ftp-monitor"
  ],
  impactDefense: [
    "ransomware-drill", "encrypt-test", "wipe-sim", "ddos-sim"
  ],
  utilities: [
    "help", "clear", "status", "missions", "select", "modules", "config", "brief", "intel", "leaderboard", "savepoint", "report", "board", "resetlab", "wallet", "history", "whoami", "matrix", "ghost", "god", "konami", "hack-the-planet", "exit", "start", "accept"
  ],
};

window.WAUBUG_HELP = [
  "RECON:",
  "scan [range]                Simulated network visibility scan",
  "recon [target]              Gather synthetic OSINT",
  "enumerate [service]         Service audit",
  "whois [domain]              Domain intelligence",
  "traceroute [ip]             Route simulation",
  "nslookup [domain]           DNS simulation",
  "",
  "DETECTION & DEFENSE:",
  "phish-audit [target]        Phishing resilience check",
  "exploit-check [cve]         Validate exposure to CVEs",
  "bruteforce-detect [service] Brute-force detection exercise",
  "auth-audit [decoy-host]     Simulated credential resilience drill",
  "victim-status               Inspect the virtual victim defenses",
  "webshell-detect [path]      Web shell hunting simulation",
  "mimikatz-detect             Credential theft detection drill",
  "ransomware-drill            Ransomware containment tabletop",
  "exfil-detect                Data exfiltration detection",
  "",
  "SYSTEM:",
  "missions                    List missions",
  "select [1-6]                Select mission",
  "brief                       Show the current mission briefing",
  "intel                       Show next recommended actions",
  "status                      Show current operation status",
  "leaderboard                 Show top operators",
  "savepoint                   Save the current run in browser storage",
  "report                      Export a local JSON training report",
  "board                       Open the local ops board",
  "resetlab confirm            Clear local progress and reports",
  "history                     Command history",
  "help                        Show this menu",
];

window.WAUBUG_FAKE_RESPONSES = {
  scan: [
    "[+] Initiating defensive visibility sweep",
    "[+] 10.0.0.15 - ALERT - Unpatched SMB service",
    "[+] 10.0.0.23 - OK - Endpoint protected",
    "[+] 10.0.0.45 - ALERT - Legacy firmware",
    "[+] Scan complete. 2 high-priority findings."
  ],
  recon: [
    "[+] Pulling synthetic threat intel",
    "[+] Public exposure index: MEDIUM",
    "[+] Recommended controls queued"
  ],
  "phish-audit": [
    "[+] Launching phishing resilience exercise",
    "[*] 3 users clicked the decoy link",
    "[+] Mandatory awareness training scheduled"
  ],
  "exploit-check": [
    "[+] Matching CVE signatures against lab assets",
    "[*] Vulnerability found in patch window",
    "[+] Mitigation playbook generated"
  ],
  "bruteforce-detect": [
    "[+] Reviewing authentication telemetry",
    "[WARNING] Burst of failed logins from a decoy source",
    "[+] Lockout and MFA recommendation added to the queue"
  ],
  "webshell-detect": [
    "[+] Crawling decoy web roots for unauthorized loaders",
    "[WARNING] Suspicious PHP dropper isolated in sandbox",
    "[+] Removal checklist prepared"
  ],
  "ransomware-drill": [
    "[+] Running controlled ransomware response simulation",
    "[WARNING] Encryption activity detected on decoy hosts",
    "[+] Isolation and restore workflow triggered"
  ],
  "exfil-detect": [
    "[+] Monitoring egress channels",
    "[ERROR] Suspicious DNS tunneling pattern",
    "[*] Auto-block policy applied"
  ],
  status: [
    "[WAUBUG STATUS]",
    "Mode: Defensive Training",
    "Detection Confidence: 87%",
    "Stealth Hygiene: 72%"
  ],
};
