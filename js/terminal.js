(function () {
  const bootScreen = document.getElementById("boot-screen");
  const legalScreen = document.getElementById("legal-screen");
  const legalInput = document.getElementById("legal-input");
  const workspace = document.getElementById("workspace");
  const bootText = document.getElementById("boot-text");
  const actionBar = document.querySelector(".action-bar");

  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");

  let autosaveId = null;

  function persistState() {
    window.WAUBUG_STORAGE.saveState(window.WAUBUG_STATE);
  }

  function syncSession() {
    persistState();
  }

  function startHeartbeat() {
    if (autosaveId) clearInterval(autosaveId);
    autosaveId = setInterval(() => {
      persistState();
    }, 15000);
  }

  function pushMissionUpdate(note = "") {
    if (note) {
      window.WAUBUG_STORAGE.trackEvent("mission", note, {
        missionId: window.WAUBUG_STATE.mission.id,
        progress: window.WAUBUG_STATE.missionProgress,
      });
    }
    window.WAUBUG_STORAGE.markMissionCompleted(window.WAUBUG_STATE);
    persistState();
  }

  function pushCommandLog(command) {
    window.WAUBUG_STORAGE.trackEvent("command", `Executed command: ${command}`, { command });
    persistState();
  }

  function markSessionOffline() {
    window.WAUBUG_STORAGE.trackEvent("session", "Simulator session closed", {
      operator: window.WAUBUG_STATE.operator,
      score: window.WAUBUG_STATE.score,
    });
    persistState();
  }

  async function savepoint(reason = "manual") {
    window.WAUBUG_STATE.toolkit.savepoints += 1;
    const snapshot = window.WAUBUG_STORAGE.saveSnapshot(window.WAUBUG_STATE, reason);
    persistState();
    await typeLines([
      `[+] Savepoint stored for ${snapshot.missionName}`,
      `[*] Score preserved at ${snapshot.score}`,
      "[+] Open the Ops Board to review saved runs",
    ]);
    updatePanels();
  }

  async function exportReport() {
    window.WAUBUG_STATE.reportMeta.exports += 1;
    window.WAUBUG_STATE.reportMeta.lastExportAt = new Date().toISOString();
    persistState();
    window.WAUBUG_STORAGE.downloadReport(window.WAUBUG_STATE);
    window.WAUBUG_STORAGE.trackEvent("report", "Exported local training report", {
      exports: window.WAUBUG_STATE.reportMeta.exports,
    });
    await typeLines([
      "[+] Local training report exported",
      `[*] Reports exported: ${window.WAUBUG_STATE.reportMeta.exports}`,
      "[+] JSON snapshot downloaded to your browser",
    ]);
    updatePanels();
  }

  async function showBriefing() {
    const mission = window.WAUBUG_STATE.mission;
    window.WAUBUG_STATE.toolkit.briefingsReviewed += 1;
    window.WAUBUG_STORAGE.trackEvent("briefing", `Reviewed mission brief for ${mission.name}`, {
      missionId: mission.id,
    });
    await typeLines([
      `[MISSION BRIEF: ${mission.name}]`,
      `Objective: ${mission.objective}`,
      `Reward: ${mission.reward}`,
      ...mission.tasks.map((task, index) => `${index + 1}. ${task}`),
    ]);
    persistState();
    updatePanels();
  }

  async function showIntel() {
    const mission = window.WAUBUG_STATE.mission;
    const recommendations = [
      `Focus Host: ${window.WAUBUG_STATE.virtualVictim.hostname}`,
      `Recommended next step: ${mission.tasks[Math.min(3, Math.floor(window.WAUBUG_STATE.missionProgress / 25))]}`,
      `Defense posture: ${window.WAUBUG_STATE.stealth >= 80 ? "HARDENED" : "IMPROVE STEALTH HYGIENE"}`,
      `Snapshots saved: ${window.WAUBUG_STATE.toolkit.savepoints}`,
      `Completed missions: ${window.WAUBUG_STATE.completedMissionIds.length}`,
    ];
    await typeLines(["[TACTICAL INTEL]", ...recommendations]);
    updatePanels();
  }

  async function showModules() {
    const rows = ["[MODULE DIRECTORY]"];
    Object.entries(window.WAUBUG_MODULES).forEach(([group, commands]) => {
      rows.push(`${group}: ${commands.join(", ")}`);
    });
    await typeLines(rows);
    updatePanels();
  }

  async function showConfig() {
    await typeLines([
      "[LOCAL CONFIG]",
      "Mode: Browser-only",
      "Storage: localStorage + sessionStorage",
      `Operator Customized: ${window.WAUBUG_STATE.operatorCustomized ? "YES" : "NO"}`,
      `Reports Exported: ${window.WAUBUG_STATE.reportMeta.exports}`,
      `Mission Savepoints: ${window.WAUBUG_STATE.toolkit.savepoints}`,
    ]);
    updatePanels();
  }

  async function openBoard() {
    window.open("admin.html", "_blank", "noopener");
    await typeLines([
      "[+] Local Ops Board opened in a new tab",
      "[*] Review snapshots, reports, and event history there",
    ]);
  }

  async function runVirtualVictimAudit(targetName) {
    const victim = window.WAUBUG_STATE.virtualVictim;
    const target = (targetName || victim.hostname).trim() || victim.hostname;

    victim.hostname = target;
    victim.auditRuns += 1;
    victim.authFindings += 1;
    victim.status = "AUTH PRESSURE TESTED";
    victim.lastResult = "Weak lockout policy identified on decoy victim";

    await typeLines([
      `[+] Redirecting to decoy auth node: ${target}`,
      "[*] Running contained credential resilience drill",
      "[WARNING] Repeated failed logins reached the alert threshold",
      "[+] Weak password policy flagged in the virtual victim",
      "[+] Recommended remediations: MFA, lockout tuning, password policy reset",
    ]);

    window.WAUBUG_STATE.score += 120;
    window.WAUBUG_STATE.missionProgress = Math.min(100, window.WAUBUG_STATE.missionProgress + 26);
    window.WAUBUG_STATE.incidentsClosed += 1;
    window.WAUBUG_STATE.exfilPreventedGb += 0.4;

    pushMissionUpdate(`Mission pressure test advanced on ${target}`);
    updatePanels();
  }

  const bootLines = [
    "[WAUBUG SIMULATIONS v2.4.7]",
    "Initializing secure environment...",
    "Loading defensive frameworks... OK",
    "Establishing encrypted channels... OK",
    "Mounting virtual file system... OK",
    "Starting training infrastructure... OK",
    "",
    "WARNING: This is a controlled simulation environment",
    "All activities are monitored and logged",
    "No real systems will be harmed",
    "",
    "Type 'start' to begin your operation",
    "Type 'help' for available commands",
    "Type 'missions' to view objectives",
    "",
    "root@waubug:~#",
  ];

  function tickClock() {
    const now = new Date();
    document.getElementById("status-time").textContent = `${now.toISOString().split("T")[1].split(".")[0]} UTC`;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function typeLine(line, className = "") {
    const node = document.createElement("div");
    if (className) node.className = className;
    output.appendChild(node);

    for (let i = 0; i < line.length; i += 1) {
      node.textContent += line[i];
      await sleep(12);
    }

    output.scrollTop = output.scrollHeight;
  }

  async function typeLines(lines) {
    for (const line of lines) {
      const cls = line.includes("ERROR") ? "line-error" : line.includes("WARNING") ? "line-warn" : line.includes("[+]") ? "line-success" : "";
      await typeLine(line, cls);
    }
  }

  function clearOutput() {
    output.innerHTML = "";
  }

  function showMissions() {
    return [
      "Available Operations:",
      ...window.WAUBUG_MISSIONS.map((m, i) => `${i + 1}. ${m.name} - ${m.objective} (Reward: ${m.reward})`),
    ];
  }

  async function processCommand(raw) {
    const line = raw.trim();
    if (!line) return;

    window.WAUBUG_STATE.commandHistory.push(line);
    window.WAUBUG_STATE.commandHistory = window.WAUBUG_STATE.commandHistory.slice(-40);
    await typeLine(`root@waubug:~# ${line}`, "line-highlight");
    pushCommandLog(line);
    await sleep(200 + Math.floor(Math.random() * 1200));

    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(" ");

    if (cmd === "clear") {
      clearOutput();
      updatePanels();
      return;
    }

    if (cmd === "help") {
      await typeLines(window.WAUBUG_HELP);
      updatePanels();
      return;
    }

    if (cmd === "missions") {
      await typeLines(showMissions());
      updatePanels();
      return;
    }

    if (cmd === "select") {
      const idx = Number(arg) - 1;
      if (window.WAUBUG_MISSIONS[idx]) {
        window.WAUBUG_STATE.mission = window.WAUBUG_MISSIONS[idx];
        window.WAUBUG_STATE.missionProgress = 0;
        window.WAUBUG_STATE.target = [
          "203.0.113.42",
          "vault-gateway.sim",
          "restore-cluster.sim",
          "hunt-grid.sim",
          "ics-core.sim",
          "blue-command.sim",
        ][idx] || "training.local";
        syncSession();
        window.WAUBUG_STORAGE.trackEvent("mission", `Loaded mission ${window.WAUBUG_STATE.mission.name}`, {
          missionId: window.WAUBUG_STATE.mission.id,
        });
        await typeLines([
          `[MISSION LOADED: ${window.WAUBUG_STATE.mission.name}]`,
          `Objective: ${window.WAUBUG_STATE.mission.objective}`,
        ]);
      } else {
        await typeLine("[ERROR] Invalid mission index", "line-error");
      }
      updatePanels();
      return;
    }

    if (cmd === "status") {
      await typeLines([
        "[WAUBUG STATUS]",
        "Mode: Defensive Training",
        `Detection Confidence: ${Math.min(99, 82 + window.WAUBUG_STATE.virtualVictim.authFindings * 3)}%`,
        `Stealth Hygiene: ${window.WAUBUG_STATE.stealth}%`,
        `Virtual Victim: ${window.WAUBUG_STATE.virtualVictim.hostname}`,
        `Victim Status: ${window.WAUBUG_STATE.virtualVictim.status}`,
      ]);
      updatePanels();
      return;
    }

    if (cmd === "start") {
      await typeLines([
        "[WAUBUG SIMULATIONS]",
        "Select your codename with: whoami [name]",
        "Use brief to inspect the mission plan.",
        "Use missions to begin.",
      ]);
      updatePanels();
      return;
    }

    if (cmd === "whoami") {
      if (arg) {
        window.WAUBUG_STATE.operator = arg.toUpperCase();
        window.WAUBUG_STATE.operatorCustomized = true;
      }
      syncSession();
      window.WAUBUG_STORAGE.trackEvent("identity", `Operator set to ${window.WAUBUG_STATE.operator}`, {
        operator: window.WAUBUG_STATE.operator,
      });
      await typeLines([
        `Operator: ${window.WAUBUG_STATE.operator}`,
        `Mission: ${window.WAUBUG_STATE.mission.name}`,
        `Score: ${window.WAUBUG_STATE.score}`,
      ]);
      updatePanels();
      return;
    }

    if (cmd === "matrix") {
      await typeLine("[+] Matrix overlay intensified", "line-success");
      document.getElementById("matrix-rain").style.opacity = "0.2";
      updatePanels();
      return;
    }

    if (cmd === "ghost") {
      window.WAUBUG_STATE.stealth = Math.min(100, window.WAUBUG_STATE.stealth + 12);
      await typeLine("[+] Stealth hygiene increased", "line-success");
      window.WAUBUG_STORAGE.trackEvent("tuning", "Stealth hygiene increased", {
        stealth: window.WAUBUG_STATE.stealth,
      });
      syncSession();
      updatePanels();
      return;
    }

    if (cmd === "god") {
      window.WAUBUG_STATE.score += 250;
      window.WAUBUG_STATE.missionProgress = 100;
      await typeLines(["[+] Training override enabled", "[+] All missions unlocked in sandbox"]);
      pushMissionUpdate("Sandbox override marked the mission complete");
      updatePanels();
      return;
    }

    if (cmd === "history") {
      const list = window.WAUBUG_STATE.commandHistory.slice(-20);
      await typeLines(list.length ? list : ["[No command history]"]);
      updatePanels();
      return;
    }

    if (cmd === "leaderboard") {
      const leaderboard = window.WAUBUG_STORAGE.getLeaderboard(window.WAUBUG_STATE);
      const rows = ["LOCAL HALL OF FAME"];
      leaderboard.forEach((entry, idx) => {
        rows.push(`${idx + 1}. ${entry.operator || "UNKNOWN"}   ${entry.score || 0}   ${entry.missionName || entry.missionId}`);
      });
      rows.push(`Snapshots saved: ${window.WAUBUG_STORAGE.getSnapshots().length}`);
      await typeLines(rows);
      updatePanels();
      return;
    }

    if (cmd === "wallet") {
      await typeLines([
        "Training Credits: 0.742 BTC-SIM",
        "BTC/USD (sim): 63,402.50",
      ]);
      updatePanels();
      return;
    }

    if (cmd === "hack-the-planet" || cmd === "konami") {
      await typeLine("[+] Easter egg activated", "line-success");
      alertFlash();
      updatePanels();
      return;
    }

    if (cmd === "brief") {
      await showBriefing();
      return;
    }

    if (cmd === "intel") {
      await showIntel();
      return;
    }

    if (cmd === "modules") {
      await showModules();
      return;
    }

    if (cmd === "config") {
      await showConfig();
      return;
    }

    if (cmd === "savepoint") {
      await savepoint("manual");
      return;
    }

    if (cmd === "report") {
      await exportReport();
      return;
    }

    if (cmd === "board") {
      await openBoard();
      return;
    }

    if (cmd === "resetlab") {
      if (arg !== "confirm") {
        await typeLines([
          "[WARNING] resetlab requires confirmation",
          "[*] Run: resetlab confirm",
        ]);
        return;
      }

      window.WAUBUG_STORAGE.resetLab();
      window.WAUBUG_STATE = window.WAUBUG_STORAGE.loadState(window.WAUBUG_DEFAULT_STATE);
      await typeLines([
        "[+] Local simulator data cleared",
        "[+] Fresh browser-only workspace loaded",
      ]);
      updatePanels();
      return;
    }

    if (cmd === "victim-status") {
      const victim = window.WAUBUG_STATE.virtualVictim;
      await typeLines([
        "[VIRTUAL VICTIM STATUS]",
        `Hostname: ${victim.hostname}`,
        `Shield State: ${victim.status}`,
        `Lockout Threshold: ${victim.lockoutThreshold} failed attempts`,
        `Audit Runs: ${victim.auditRuns}`,
        `Last Result: ${victim.lastResult}`,
      ]);
      updatePanels();
      return;
    }

    if (cmd === "auth-audit" || cmd === "bruteforce-sim") {
      await runVirtualVictimAudit(arg);
      return;
    }

    if (cmd === "exit") {
      await typeLine("Session ended. Refresh to restart.");
      markSessionOffline();
      input.disabled = true;
      return;
    }

    if (window.WAUBUG_FAKE_RESPONSES[cmd]) {
      await typeLines(window.WAUBUG_FAKE_RESPONSES[cmd]);
      window.WAUBUG_STATE.score += 35;
      window.WAUBUG_STATE.missionProgress = Math.min(100, window.WAUBUG_STATE.missionProgress + 12);
      if (Math.random() < 0.18) {
        await typeLines([
          "[ERROR] Connection refused",
          "[*] Retrying with secure relay...",
          "[+] Connection established",
        ]);
      }
      pushMissionUpdate(`Progress updated by ${cmd}`);
      syncSession();
      updatePanels();
      return;
    }

    const allCommands = Object.values(window.WAUBUG_MODULES).flat();
    if (allCommands.includes(cmd)) {
      await typeLines([
        `[+] ${cmd} module loaded in simulation mode`,
        "[*] This command is restricted to defensive educational workflows",
      ]);
      window.WAUBUG_STATE.score += 15;
      window.WAUBUG_STATE.missionProgress = Math.min(100, window.WAUBUG_STATE.missionProgress + 6);
      pushMissionUpdate(`Utility module inspected: ${cmd}`);
      syncSession();
      updatePanels();
      return;
    }

    await typeLine(`[ERROR] Command not found: ${cmd}`, "line-error");
  }

  async function runBootSequence() {
    for (const line of bootLines) {
      bootText.textContent += `${line}\n`;
      await sleep(120);
    }
    await sleep(500);
    bootScreen.classList.remove("active");
    bootScreen.classList.add("hidden");
    legalScreen.classList.remove("hidden");
    legalInput.focus();
  }

  legalInput.addEventListener("keydown", async (ev) => {
    if (ev.key !== "Enter") return;
    const value = legalInput.value.trim().toLowerCase();
    if (value === "accept") {
      legalScreen.classList.add("hidden");
      workspace.classList.remove("hidden");
      input.focus();
      startEffects();
      tickClock();
      setInterval(tickClock, 1000);
      syncSession();
      startHeartbeat();
      updatePanels();
      typeLines([
        "[WAUBUG SIMULATIONS ONLINE]",
        "Browser-only training environment initialized",
        "Use auth-audit to test the virtual victim controls",
        "Use board to open the local ops board",
        "Type help to view commands",
      ]);
      window.WAUBUG_STORAGE.trackEvent("session", "Simulator session started", {
        operator: window.WAUBUG_STATE.operator,
      });
      return;
    }
    if (value === "exit") {
      window.location.href = "about:blank";
      return;
    }
    legalInput.value = "";
  });

  input.addEventListener("keydown", async (ev) => {
    if (ev.key !== "Enter") return;
    const cmd = input.value;
    input.value = "";
    input.disabled = true;
    await processCommand(cmd);
    input.disabled = false;
    input.focus();
  });

  actionBar?.addEventListener("click", async (event) => {
    const action = event.target?.dataset?.action;
    if (!action) return;

    if (action === "brief") await showBriefing();
    if (action === "savepoint") await savepoint("toolbar");
    if (action === "report") await exportReport();
  });

  window.addEventListener("pagehide", markSessionOffline);
  window.addEventListener("beforeunload", markSessionOffline);

  runBootSequence();
})();
