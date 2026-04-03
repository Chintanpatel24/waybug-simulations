window.WAUBUG_DEFAULT_STATE = {
  sessionId: window.WAUBUG_STORAGE.resolveSessionId(),
  operator: "GHOST-7",
  operatorCustomized: false,
  target: "203.0.113.42",
  mission: window.WAUBUG_MISSIONS[0],
  stealth: 70,
  score: 0,
  exfilPreventedGb: 2.3,
  incidentsClosed: 14,
  commandHistory: [],
  missionProgress: 12,
  completedMissionIds: [],
  virtualVictim: {
    hostname: "vault-gateway.sim",
    lockoutThreshold: 5,
    status: "MONITORED",
    auditRuns: 0,
    authFindings: 0,
    lastResult: "No credential pressure test executed",
  },
  toolkit: {
    localMode: true,
    briefingsReviewed: 0,
    savepoints: 0,
  },
  reportMeta: {
    exports: 0,
    lastExportAt: null,
  },
};

window.WAUBUG_STATE = window.WAUBUG_STORAGE.loadState(window.WAUBUG_DEFAULT_STATE);

window.updatePanels = function updatePanels() {
  const map = document.getElementById("target-map-panel");
  const process = document.getElementById("process-panel");
  const sniff = document.getElementById("sniffer-panel");
  const event = document.getElementById("event-panel");
  const mission = document.getElementById("mission-panel");
  const metrics = window.WAUBUG_STORAGE.getMetrics(window.WAUBUG_STATE);
  const events = window.WAUBUG_STORAGE.getEvents().slice(0, 8);

  map.textContent = `               [GLOBAL OPERATIONS MAP]\n\n     USA [████████░░] 8 protected hosts\n     EUR [█████░░░░░] 5 protected hosts\n     ASIA[██████░░░░] 6 protected hosts\n\n     Current Target: ${window.WAUBUG_STATE.target}\n     Virtual Victim: ${window.WAUBUG_STATE.virtualVictim.hostname}\n     Status: ${window.WAUBUG_STATE.virtualVictim.status}\n     Mode: BROWSER-LOCAL\n     Risk Level: ██████░░░░ MODERATE`;

  process.textContent = `[ACTIVE MODULES]\n\nPID   MODULE                CPU   STATUS\n1337  edr-agent             3%    RUNNING\n1448  memory-guard          5%    ANALYZING\n1521  siem-correlator      22%    INDEXING\n1602  exfil-blocker         9%    FILTERING\n1703  backup-validator      1%    READY\n\nIncidents Closed: ${window.WAUBUG_STATE.incidentsClosed}\nExfil Prevented: ${window.WAUBUG_STATE.exfilPreventedGb.toFixed(1)} GB\nCredentials Secured: 247\nVictim Lockout: ${window.WAUBUG_STATE.virtualVictim.lockoutThreshold} tries\nSavepoints: ${window.WAUBUG_STATE.toolkit.savepoints}\nBest Score: ${metrics.bestScore}`;

  const now = new Date();
  const t = now.toUTCString().split(" ")[4];

  sniff.textContent = `[PACKET CAPTURE - eth0]\n\n${t} TCP 10.0.0.15:445 > 10.0.0.1:4444 [SYN]\n${t} ALERT suspicious SMB handshake\n${t} HTTP POST ${window.WAUBUG_STATE.virtualVictim.hostname}/login [sim]\n${t} AUTH decoy credential spray intercepted\n${t} DNS query anomaly blocked\n${t} DATA egress to C2 prevented`;

  const lines = events.map((entry) => `[${entry.createdAt.slice(11, 19)}] ${entry.message}`);
  event.textContent = `[OPERATION LOG]\n\n${lines.join("\n") || "[No activity yet]"}`;

  const m = window.WAUBUG_STATE.mission;
  const checks = m.tasks
    .map((task, i) => (i < Math.floor(window.WAUBUG_STATE.missionProgress / 25) ? `[✓] ${task}` : `[ ] ${task}`))
    .join("\n");

  mission.textContent = `[OPERATION: ${m.name}]\n\nOBJECTIVES:\n${checks}\n\nSCORE: ${window.WAUBUG_STATE.score}\nPROGRESS: ${window.WAUBUG_STATE.missionProgress}%\nSTEALTH: ${"█".repeat(Math.max(1, Math.floor(window.WAUBUG_STATE.stealth / 10)))}${"░".repeat(10 - Math.max(1, Math.floor(window.WAUBUG_STATE.stealth / 10)))}\nAUTH FINDINGS: ${window.WAUBUG_STATE.virtualVictim.authFindings}\nMISSIONS COMPLETED: ${window.WAUBUG_STATE.completedMissionIds.length}\nLAST VICTIM RESULT: ${window.WAUBUG_STATE.virtualVictim.lastResult}`;

  document.getElementById("status-user").textContent = window.WAUBUG_STATE.operator;
  document.getElementById("status-target").textContent = window.WAUBUG_STATE.target;
  document.getElementById("status-mission").textContent = m.name;
  document.getElementById("status-anon").textContent = "LOCAL";

  window.WAUBUG_STORAGE.saveState(window.WAUBUG_STATE);
};
