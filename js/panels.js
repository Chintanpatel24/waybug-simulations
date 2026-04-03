window.WAUBUG_DEFAULT_STATE = {
  sessionId: window.WAUBUG_STORAGE.resolveSessionId(),
  operator: "GHOST-7",
  operatorCustomized: false,
  target: "relay-ops",
  mission: window.WAUBUG_MISSIONS[0],
  stealth: 94,
  score: 0,
  exfilPreventedGb: 0.0,
  incidentsClosed: 0,
  commandHistory: [],
  missionProgress: 0,
  completedMissionIds: [],
  virtualVictim: {
    hostname: "vault-phone-13",
    lockoutThreshold: 5,
    status: "AT RISK",
    auditRuns: 0,
    authFindings: 0,
    lastResult: "Case unopened",
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
  game: {
    connectedNode: "relay-ops",
    cwd: "/",
    discoveredPaths: [],
    currentFile: "",
    hintsUsed: 0,
    quarantined: [],
    decoded: {
      alpha: "",
      beta: "",
      finalKey: "",
    },
    victimName: "",
    completedObjectives: [],
    submissions: {
      victim: false,
      key: false,
    },
  },
};

window.WAUBUG_STATE = window.WAUBUG_STORAGE.loadState(window.WAUBUG_DEFAULT_STATE);

window.WAUBUG_CASE = {
  getObjectiveStatuses(state) {
    const discovered = new Set(state.game.discoveredPaths || []);
    const quarantined = new Set(state.game.quarantined || []);
    const targets = window.WAUBUG_SCENARIO.caseTargets;

    return [
      {
        id: "workstation-node",
        label: "Connect to finance-ws17",
        done: state.game.connectedNode === "finance-ws17" || discovered.has("node:finance-ws17"),
      },
      {
        id: "ransomware-folder",
        label: "Locate invoice-lock ransomware folder",
        done: discovered.has(`artifact:${targets.ransomwarePath}`),
      },
      {
        id: "alpha-fragment",
        label: "Decode alpha fragment",
        done: state.game.decoded.alpha === targets.alpha,
      },
      {
        id: "phone-node",
        label: "Connect to vault-phone-13",
        done: state.game.connectedNode === "vault-phone-13" || discovered.has("node:vault-phone-13"),
      },
      {
        id: "spyware-folder",
        label: "Locate lensync spyware folder",
        done: discovered.has(`artifact:${targets.spywarePath}`),
      },
      {
        id: "beta-fragment",
        label: "Decode beta fragment",
        done: state.game.decoded.beta === targets.beta,
      },
      {
        id: "victim",
        label: "Identify the victim",
        done: state.game.victimName === targets.victimName || state.game.submissions.victim,
      },
      {
        id: "ransomware-quarantine",
        label: "Quarantine invoice-lock",
        done: quarantined.has("invoice-lock"),
      },
      {
        id: "spyware-quarantine",
        label: "Quarantine lensync",
        done: quarantined.has("lensync"),
      },
      {
        id: "key",
        label: "Submit final unlock token",
        done: state.game.submissions.key,
      },
    ];
  },

  syncCaseState(state) {
    const objectives = this.getObjectiveStatuses(state);
    const completedIds = objectives.filter((item) => item.done).map((item) => item.id);
    const progress = Math.round((completedIds.length / objectives.length) * 100);
    state.game.completedObjectives = completedIds;
    state.missionProgress = progress;

    if (progress < 35) {
      state.mission = window.WAUBUG_MISSIONS[0];
    } else if (progress < 75) {
      state.mission = window.WAUBUG_MISSIONS[1];
    } else {
      state.mission = window.WAUBUG_MISSIONS[2];
    }

    const node = window.WAUBUG_SCENARIO.nodes[state.game.connectedNode];
    state.target = node ? node.label : state.game.connectedNode;

    if (state.game.submissions.key && completedIds.includes("ransomware-quarantine") && completedIds.includes("spyware-quarantine")) {
      state.virtualVictim.status = "RECOVERED";
      state.virtualVictim.lastResult = "Both payloads quarantined. Victim recovered.";
      state.incidentsClosed = 1;
    } else if (completedIds.includes("ransomware-folder") || completedIds.includes("spyware-folder")) {
      state.virtualVictim.status = "COMPROMISED";
    } else {
      state.virtualVictim.status = "AT RISK";
    }

    if (progress === 100) {
      state.completedMissionIds = [...new Set([...state.completedMissionIds, state.mission.id])];
    }

    return objectives;
  },
};

window.updatePanels = function updatePanels() {
  const map = document.getElementById("target-map-panel");
  const process = document.getElementById("process-panel");
  const sniff = document.getElementById("sniffer-panel");
  const event = document.getElementById("event-panel");
  const mission = document.getElementById("mission-panel");
  const objectives = window.WAUBUG_CASE.syncCaseState(window.WAUBUG_STATE);
  const events = window.WAUBUG_STORAGE.getEvents().slice(0, 8);
  const nodeList = window.WAUBUG_SCENARIO.availableNodes;
  const currentNode = window.WAUBUG_SCENARIO.nodes[window.WAUBUG_STATE.game.connectedNode];
  const discovered = new Set(window.WAUBUG_STATE.game.discoveredPaths || []);
  const ransomwareToken = [...discovered].find((item) => item === `artifact:${window.WAUBUG_SCENARIO.caseTargets.ransomwarePath}`);
  const spywareToken = [...discovered].find((item) => item === `artifact:${window.WAUBUG_SCENARIO.caseTargets.spywarePath}`);
  const discoveredRows = [...window.WAUBUG_STATE.game.discoveredPaths]
    .slice(-6)
    .map((item) => `- ${item.replace(/^artifact:/, "").replace(/^node:/, "node ")}`);

  map.textContent = [
    "[NODE GRAPH]",
    "",
    ...nodeList.map((node) => {
      const active = node.id === window.WAUBUG_STATE.game.connectedNode ? "ACTIVE" : discovered.has(`node:${node.id}`) ? "SEEN" : "DARK";
      return `${node.label.padEnd(16, " ")} ${active}`;
    }),
    "",
    `Current Node: ${currentNode?.label || "UNKNOWN"}`,
    `Current Path: ${window.WAUBUG_STATE.game.cwd}`,
    `Hint Debt: ${window.WAUBUG_STATE.game.hintsUsed}`,
  ].join("\n");

  process.textContent = [
    "[EVIDENCE LOCKER]",
    "",
    `Ransomware Folder: ${ransomwareToken ? ransomwareToken.replace("artifact:", "") : "UNSEEN"}`,
    `Spyware Folder: ${spywareToken ? spywareToken.replace("artifact:", "") : "UNSEEN"}`,
    `Victim: ${window.WAUBUG_STATE.game.victimName || "UNKNOWN"}`,
    `Alpha: ${window.WAUBUG_STATE.game.decoded.alpha || "UNDECODED"}`,
    `Beta: ${window.WAUBUG_STATE.game.decoded.beta || "UNDECODED"}`,
    `Final Key: ${window.WAUBUG_STATE.game.decoded.finalKey || "UNBUILT"}`,
    `Quarantined: ${window.WAUBUG_STATE.game.quarantined.join(", ") || "NONE"}`,
  ].join("\n");

  sniff.textContent = [
    "[DIRECTORY WATCH]",
    "",
    `Node: ${currentNode?.label || "UNKNOWN"}`,
    `Path: ${window.WAUBUG_STATE.game.cwd}`,
    `Last File: ${window.WAUBUG_STATE.game.currentFile || "NONE"}`,
    "",
    "Recent Discoveries:",
    ...(discoveredRows.length ? discoveredRows : ["- none"]),
  ].join("\n");

  event.textContent = `[THREAT FEED]\n\n${events.map((entry) => `[${entry.createdAt.slice(11, 19)}] ${entry.message}`).join("\n") || "[No activity yet]"}`;

  mission.textContent = [
    `[CASE: ${window.WAUBUG_STATE.mission.name}]`,
    "",
    `Objective: ${window.WAUBUG_STATE.mission.objective}`,
    "",
    ...objectives.map((item) => `${item.done ? "[✓]" : "[ ]"} ${item.label}`),
    "",
    `Score: ${window.WAUBUG_STATE.score}`,
    `Progress: ${window.WAUBUG_STATE.missionProgress}%`,
    `Victim Status: ${window.WAUBUG_STATE.virtualVictim.status}`,
    `Last Result: ${window.WAUBUG_STATE.virtualVictim.lastResult}`,
  ].join("\n");

  document.getElementById("status-user").textContent = window.WAUBUG_STATE.operator;
  document.getElementById("status-target").textContent = currentNode?.label || window.WAUBUG_STATE.target;
  document.getElementById("status-mission").textContent = window.WAUBUG_STATE.mission.name.split(" // ")[0];
  document.getElementById("status-anon").textContent = "BLACK";

  window.WAUBUG_STORAGE.saveState(window.WAUBUG_STATE);
};
