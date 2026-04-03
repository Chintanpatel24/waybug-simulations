(function () {
  const SCENARIO = window.WAUBUG_SCENARIO;
  const TARGETS = SCENARIO.caseTargets;

  const bootScreen = document.getElementById("boot-screen");
  const legalScreen = document.getElementById("legal-screen");
  const legalInput = document.getElementById("legal-input");
  const workspace = document.getElementById("workspace");
  const bootText = document.getElementById("boot-text");
  const actionBar = document.querySelector(".action-bar");

  const output = document.getElementById("terminal-output");
  const input = document.getElementById("terminal-input");
  const prompt = document.querySelector(".terminal-input-row span");

  let autosaveId = null;

  function persistState() {
    window.WAUBUG_STORAGE.saveState(window.WAUBUG_STATE);
  }

  function currentNodeId() {
    return window.WAUBUG_STATE.game.connectedNode;
  }

  function currentNode() {
    return SCENARIO.nodes[currentNodeId()];
  }

  function currentPath() {
    return window.WAUBUG_STATE.game.cwd;
  }

  function promptPrefix() {
    return `analyst@${currentNodeId()}:${currentPath()}#`;
  }

  function updatePrompt() {
    if (prompt) prompt.textContent = promptPrefix();
  }

  function setCaseResult(message) {
    window.WAUBUG_STATE.virtualVictim.lastResult = message;
  }

  function track(type, message, details = {}) {
    window.WAUBUG_STORAGE.trackEvent(type, message, details);
  }

  function addScore(points) {
    window.WAUBUG_STATE.score += points;
    window.WAUBUG_STATE.score = Math.max(0, window.WAUBUG_STATE.score);
  }

  function normalizeName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function discover(token, message, points = 0) {
    const discovered = window.WAUBUG_STATE.game.discoveredPaths;
    if (discovered.includes(token)) return false;
    discovered.push(token);
    if (points) addScore(points);
    track("discovery", message, { token });
    return true;
  }

  function observePath(nodeId, path) {
    if (!path) return;

    if (path === TARGETS.ransomwarePath || path.startsWith(`${TARGETS.ransomwarePath}/`)) {
      if (discover(`artifact:${TARGETS.ransomwarePath}`, "Located invoice-lock ransomware folder", 350)) {
        setCaseResult("Ransomware folder exposed on finance-ws17");
        alertFlash();
      }
    }

    if (path === TARGETS.spywarePath || path.startsWith(`${TARGETS.spywarePath}/`)) {
      if (discover(`artifact:${TARGETS.spywarePath}`, "Located lensync spyware folder", 350)) {
        setCaseResult("Spyware collector exposed on vault-phone-13");
        alertFlash();
      }
    }

    if (nodeId === TARGETS.ransomwareNode) {
      discover(`node:${TARGETS.ransomwareNode}`, "Pivoted into finance-ws17", 120);
    }

    if (nodeId === TARGETS.spywareNode) {
      discover(`node:${TARGETS.spywareNode}`, "Pivoted into vault-phone-13", 120);
    }
  }

  function observeFile(path, content) {
    window.WAUBUG_STATE.game.currentFile = path;

    if (path.endsWith("/todo.txt") && String(content).includes("TklHSFQ=")) {
      track("clue", "Observed alpha fragment on workstation", { path });
    }

    if (path.endsWith("/agent.json") && String(content).includes("474c415353")) {
      track("clue", "Observed beta fragment inside spyware config", { path });
    }

    if (path.endsWith("/owner.txt") && String(content).toLowerCase().includes("maya chen")) {
      window.WAUBUG_STATE.game.victimName = TARGETS.victimName;
      track("clue", "Recovered victim identity from phone owner record", { victim: TARGETS.victimName });
      setCaseResult("Victim identity linked to both endpoints");
    }
  }

  function refreshPanels() {
    updatePrompt();
    updatePanels();
  }

  function startAutosave() {
    if (autosaveId) clearInterval(autosaveId);
    autosaveId = setInterval(() => {
      persistState();
    }, 15000);
  }

  function markSessionOffline() {
    track("session", "Nightglass session closed", {
      operator: window.WAUBUG_STATE.operator,
      score: window.WAUBUG_STATE.score,
    });
    persistState();
  }

  async function savepoint(reason = "manual") {
    window.WAUBUG_STATE.toolkit.savepoints += 1;
    const snapshot = window.WAUBUG_STORAGE.saveSnapshot(window.WAUBUG_STATE, reason);
    await typeLines([
      `[+] Savepoint stored for ${snapshot.missionName}`,
      `[*] Current node: ${snapshot.currentNode || currentNodeId()}`,
      `[*] Score preserved at ${snapshot.score}`,
    ]);
    refreshPanels();
  }

  async function exportReport() {
    window.WAUBUG_STATE.reportMeta.exports += 1;
    window.WAUBUG_STATE.reportMeta.lastExportAt = new Date().toISOString();
    persistState();
    window.WAUBUG_STORAGE.downloadReport(window.WAUBUG_STATE);
    track("report", "Exported Nightglass report", {
      exports: window.WAUBUG_STATE.reportMeta.exports,
    });
    await typeLines([
      "[+] Nightglass report exported",
      `[*] Reports exported: ${window.WAUBUG_STATE.reportMeta.exports}`,
      "[+] JSON snapshot downloaded locally",
    ]);
    refreshPanels();
  }

  async function openBoard() {
    window.open("admin.html", "_blank", "noopener");
    await typeLines([
      "[+] Evidence Board opened in a new tab",
      "[*] Review snapshots, reports, and the local hall of fame there",
    ]);
  }

  function getObjectiveStatuses() {
    return window.WAUBUG_CASE.syncCaseState(window.WAUBUG_STATE);
  }

  async function showBriefing() {
    window.WAUBUG_STATE.toolkit.briefingsReviewed += 1;
    track("briefing", "Reviewed Nightglass briefing", { missionId: window.WAUBUG_STATE.mission.id });
    const briefing = SCENARIO.cat("relay-ops", "/brief/operations.md", "/");
    await typeLines([`[${SCENARIO.caseName}]`, "", ...(briefing.content || "").split("\n")]);
    refreshPanels();
  }

  async function showMissions() {
    await typeLines([
      "[CASE ARC]",
      ...window.WAUBUG_MISSIONS.map((mission, index) => `${index + 1}. ${mission.name} - ${mission.objective}`),
    ]);
  }

  async function showVictims() {
    const roster = SCENARIO.cat("relay-ops", "/intel/staff.csv", "/");
    await typeLines(["[VIRTUAL VICTIM ROSTER]", "", ...(roster.content || "").split("\n")]);
  }

  async function showTriage() {
    const objectives = getObjectiveStatuses();
    await typeLines([
      "[TRIAGE]",
      `Node: ${currentNode().label}`,
      `Path: ${currentPath()}`,
      `Hints Used: ${window.WAUBUG_STATE.game.hintsUsed}`,
      `Quarantined: ${window.WAUBUG_STATE.game.quarantined.join(", ") || "NONE"}`,
      "",
      ...objectives.map((item) => `${item.done ? "[✓]" : "[ ]"} ${item.label}`),
    ]);
    refreshPanels();
  }

  async function showIntel() {
    const discovered = new Set(window.WAUBUG_STATE.game.discoveredPaths);
    let recommendation = "Read /brief/operations.md on relay-ops, then inspect the host links.";

    if (!discovered.has(`artifact:${TARGETS.ransomwarePath}`)) {
      recommendation = "The workstation clue chain lives under Maya Chen's Q4 document tree. Hidden folders matter.";
    } else if (!discovered.has(`artifact:${TARGETS.spywarePath}`)) {
      recommendation = "The phone node contains a hidden collector path under a media cache.";
    } else if (!window.WAUBUG_STATE.game.submissions.victim) {
      recommendation = "Owner records and the staff roster will tell you who matches both endpoints.";
    } else if (!window.WAUBUG_STATE.game.decoded.alpha || !window.WAUBUG_STATE.game.decoded.beta) {
      recommendation = "Decode the alpha and beta fragments before attempting the final token.";
    } else if (window.WAUBUG_STATE.game.quarantined.length < 2) {
      recommendation = "Both malicious folders must be quarantined before the case is closed.";
    } else if (!window.WAUBUG_STATE.game.submissions.key) {
      recommendation = "Submit the combined token with the victim extension appended.";
    }

    await typeLines([
      "[TACTICAL INTEL]",
      `Current Node: ${currentNode().label}`,
      `Current Path: ${currentPath()}`,
      `Recommendation: ${recommendation}`,
    ]);
  }

  async function revealHint() {
    const index = window.WAUBUG_STATE.game.hintsUsed;
    const hint = SCENARIO.hints[index];
    if (!hint) {
      await typeLine("[ERROR] No further hints available", "line-error");
      return;
    }

    window.WAUBUG_STATE.game.hintsUsed += 1;
    addScore(-90);
    track("hint", `Hint ${index + 1} used`, { hint });
    await typeLines([
      `[HINT ${index + 1}]`,
      hint,
      "[WARNING] Hint penalty applied",
    ]);
    refreshPanels();
  }

  async function showStatus() {
    const objectives = getObjectiveStatuses();
    await typeLines([
      "[CASE STATUS]",
      `Case: ${SCENARIO.caseName}`,
      `Operator: ${window.WAUBUG_STATE.operator}`,
      `Node: ${currentNode().label}`,
      `Path: ${currentPath()}`,
      `Progress: ${window.WAUBUG_STATE.missionProgress}%`,
      `Completed Objectives: ${objectives.filter((item) => item.done).length}/${objectives.length}`,
      `Victim Status: ${window.WAUBUG_STATE.virtualVictim.status}`,
      `Last Result: ${window.WAUBUG_STATE.virtualVictim.lastResult}`,
    ]);
    refreshPanels();
  }

  function decodeBase64(value) {
    return window.atob(value);
  }

  function decodeHex(value) {
    const clean = value.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) {
      throw new Error("Invalid hex input");
    }

    let result = "";
    for (let i = 0; i < clean.length; i += 2) {
      result += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
    }
    return result;
  }

  function parseOptionArgs(args) {
    const flags = new Set();
    const rest = [];
    args.forEach((arg) => {
      if (arg.startsWith("-")) {
        arg.slice(1).split("").forEach((char) => flags.add(char));
        return;
      }
      rest.push(arg);
    });
    return { flags, rest };
  }

  const bootLines = [
    "[NIGHTGLASS // BLACK VAULT]",
    "Mounting isolated case memory...",
    "Loading node topology... OK",
    "Indexing hidden paths... OK",
    "Decryptor sandbox... READY",
    "Quarantine pipeline... READY",
    "",
    "This is a fictional breach investigation challenge.",
    "Expect hidden folders, encoded clues, and cross-node evidence.",
    "",
    "Type 'start' to begin the case",
    "Type 'help' for commands",
    "Type 'brief' for the file",
    "",
    "analyst@nightglass:~#",
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

    for (let index = 0; index < line.length; index += 1) {
      node.textContent += line[index];
      await sleep(8);
    }

    output.scrollTop = output.scrollHeight;
  }

  async function typeLines(lines) {
    for (const line of lines) {
      const cls = line.includes("ERROR")
        ? "line-error"
        : line.includes("WARNING")
          ? "line-warn"
          : line.includes("[+]")
            ? "line-success"
            : "";
      await typeLine(line, cls);
    }
  }

  function clearOutput() {
    output.innerHTML = "";
  }

  async function handleConnect(target) {
    if (!target) {
      await typeLines([
        "[AVAILABLE NODES]",
        ...SCENARIO.availableNodes.map((node) => `${node.id}   ${node.description}`),
      ]);
      return;
    }

    const node = SCENARIO.nodes[target];
    if (!node) {
      await typeLine("[ERROR] Unknown node id", "line-error");
      return;
    }

    window.WAUBUG_STATE.game.connectedNode = target;
    window.WAUBUG_STATE.game.cwd = "/";
    observePath(target, "/");
    setCaseResult(`Pivoted into ${node.label}`);
    await typeLines([
      `[+] Connected to ${node.label}`,
      `[*] ${node.description}`,
    ]);
    refreshPanels();
  }

  async function handleList(args) {
    const { flags, rest } = parseOptionArgs(args);
    const pathArg = rest[0] || ".";
    const listing = SCENARIO.list(currentNodeId(), pathArg, currentPath(), { all: flags.has("a") });
    if (listing.error) {
      await typeLine(`[ERROR] ${listing.error}`, "line-error");
      return;
    }

    observePath(currentNodeId(), listing.path);
    const rows = listing.entries.length
      ? listing.entries.map((entry) => `${entry.type === "dir" ? "dir " : "file"} ${entry.name}${entry.type === "dir" ? "/" : ""}`)
      : ["[empty]"];

    await typeLines([`[LS ${listing.path}]`, ...rows]);
    refreshPanels();
  }

  async function handleCd(target) {
    const pathArg = target || "/";
    const found = SCENARIO.traverse(currentNodeId(), pathArg, currentPath());
    if (found.error) {
      await typeLine(`[ERROR] ${found.error}`, "line-error");
      return;
    }
    if (found.entry.type !== "dir") {
      await typeLine("[ERROR] Target is not a directory", "line-error");
      return;
    }

    window.WAUBUG_STATE.game.cwd = found.path;
    observePath(currentNodeId(), found.path);
    refreshPanels();
    await typeLine(`[+] cwd => ${found.path}`, "line-success");
  }

  async function handleCat(target) {
    if (!target) {
      await typeLine("[ERROR] cat requires a file path", "line-error");
      return;
    }

    const result = SCENARIO.cat(currentNodeId(), target, currentPath());
    if (result.error) {
      await typeLine(`[ERROR] ${result.error}`, "line-error");
      return;
    }

    observePath(currentNodeId(), result.path);
    observeFile(result.path, result.content);
    await typeLines([`[CAT ${result.path}]`, "", ...String(result.content).split("\n")]);
    refreshPanels();
  }

  async function handleTree(args) {
    const { flags, rest } = parseOptionArgs(args);
    const target = rest[0] || ".";
    const result = SCENARIO.renderTree(currentNodeId(), target, currentPath(), { all: flags.has("a") });
    if (result.error) {
      await typeLine(`[ERROR] ${result.error}`, "line-error");
      return;
    }

    observePath(currentNodeId(), result.path);
    await typeLines(result.lines);
    refreshPanels();
  }

  async function handleFind(term) {
    if (!term) {
      await typeLine("[ERROR] find requires a search term", "line-error");
      return;
    }

    const result = SCENARIO.searchNames(currentNodeId(), term, currentPath());
    if (result.error) {
      await typeLine(`[ERROR] ${result.error}`, "line-error");
      return;
    }

    result.results.forEach((entry) => observePath(currentNodeId(), entry.path));
    await typeLines([
      `[FIND ${term}]`,
      ...(result.results.length
        ? result.results.map((entry) => `${entry.type === "dir" ? "dir " : "file"} ${entry.path}`)
        : ["[no matches]"]),
    ]);
    refreshPanels();
  }

  async function handleGrep(needle, targetPath) {
    if (!needle) {
      await typeLine("[ERROR] grep requires a search term", "line-error");
      return;
    }

    const result = SCENARIO.grepContents(currentNodeId(), needle, targetPath || ".", currentPath());
    if (result.error) {
      await typeLine(`[ERROR] ${result.error}`, "line-error");
      return;
    }

    await typeLines([
      `[GREP ${needle}]`,
      ...(result.matches.length ? result.matches : ["[no matches]"]),
    ]);
  }

  async function handleDecode(mode, value) {
    if (!mode || !value) {
      await typeLine("[ERROR] decode requires a mode and a string", "line-error");
      return;
    }

    try {
      let decoded = "";
      if (mode === "base64") decoded = decodeBase64(value);
      else if (mode === "hex") decoded = decodeHex(value);
      else {
        await typeLine("[ERROR] Supported modes: base64, hex", "line-error");
        return;
      }

      if (decoded === TARGETS.alpha && !window.WAUBUG_STATE.game.decoded.alpha) {
        window.WAUBUG_STATE.game.decoded.alpha = decoded;
        addScore(280);
        track("decode", "Decoded alpha fragment", { value: decoded });
      }

      if (decoded === TARGETS.beta && !window.WAUBUG_STATE.game.decoded.beta) {
        window.WAUBUG_STATE.game.decoded.beta = decoded;
        addScore(280);
        track("decode", "Decoded beta fragment", { value: decoded });
      }

      await typeLines([
        `[DECODE ${mode}]`,
        decoded,
      ]);
      refreshPanels();
    } catch (error) {
      await typeLine(`[ERROR] ${error.message}`, "line-error");
    }
  }

  async function handleQuarantine(target) {
    const artifact = String(target || "").toLowerCase();
    if (!artifact) {
      await typeLine("[ERROR] quarantine requires an artifact id", "line-error");
      return;
    }

    const map = {
      "invoice-lock": {
        node: TARGETS.ransomwareNode,
        path: TARGETS.ransomwarePath,
      },
      lensync: {
        node: TARGETS.spywareNode,
        path: TARGETS.spywarePath,
      },
    };

    const resolved = map[artifact] || Object.values(map).find((item) => item.path === target);
    if (!resolved) {
      await typeLine("[ERROR] Unknown artifact. Use invoice-lock or lensync.", "line-error");
      return;
    }

    if (currentNodeId() !== resolved.node) {
      await typeLine(`[ERROR] Connect to ${resolved.node} before quarantining this artifact`, "line-error");
      return;
    }

    if (!window.WAUBUG_STATE.game.discoveredPaths.includes(`artifact:${resolved.path}`)) {
      await typeLine("[ERROR] Artifact not yet located", "line-error");
      return;
    }

    if (window.WAUBUG_STATE.game.quarantined.includes(artifact)) {
      await typeLine("[ERROR] Artifact already quarantined", "line-error");
      return;
    }

    window.WAUBUG_STATE.game.quarantined.push(artifact);
    addScore(420);
    if (artifact === "invoice-lock") {
      window.WAUBUG_STATE.exfilPreventedGb += 1.6;
    }
    if (artifact === "lensync") {
      window.WAUBUG_STATE.exfilPreventedGb += 0.8;
    }
    track("containment", `Quarantined ${artifact}`, { artifact });
    setCaseResult(`${artifact} quarantined`);
    await typeLines([
      `[+] ${artifact} moved to quarantine`,
      "[*] Persistence cut off inside the simulation",
    ]);
    refreshPanels();
  }

  async function handleSubmit(kind, value) {
    if (!kind || !value) {
      await typeLine("[ERROR] submit requires a type and value", "line-error");
      return;
    }

    if (kind === "victim") {
      const inputName = normalizeName(value);
      if (inputName !== normalizeName(TARGETS.victimName) && inputName !== normalizeName(TARGETS.victimAlias)) {
        await typeLine("[ERROR] Victim identity rejected", "line-error");
        return;
      }

      if (!window.WAUBUG_STATE.game.submissions.victim) {
        window.WAUBUG_STATE.game.submissions.victim = true;
        window.WAUBUG_STATE.game.victimName = TARGETS.victimName;
        addScore(360);
        track("submission", "Submitted correct victim identity", { victim: TARGETS.victimName });
      }

      setCaseResult("Victim identity confirmed");
      await typeLines([
        `[+] Victim confirmed: ${TARGETS.victimName}`,
        "[*] Extension 47 linked to both compromised endpoints",
      ]);
      refreshPanels();
      return;
    }

    if (kind === "key") {
      const candidate = String(value).trim().toUpperCase();
      if (candidate !== TARGETS.finalKey) {
        await typeLine("[ERROR] Unlock token rejected", "line-error");
        return;
      }

      if (!window.WAUBUG_STATE.game.quarantined.includes("invoice-lock") || !window.WAUBUG_STATE.game.quarantined.includes("lensync")) {
        await typeLine("[ERROR] Quarantine both artifacts before closing the key submission", "line-error");
        return;
      }

      window.WAUBUG_STATE.game.submissions.key = true;
      window.WAUBUG_STATE.game.decoded.finalKey = TARGETS.finalKey;
      addScore(500);
      track("submission", "Submitted final unlock token", { key: TARGETS.finalKey });
      setCaseResult("Unlock token accepted. Case closed.");
      await typeLines([
        `[+] Unlock token accepted: ${TARGETS.finalKey}`,
        "[+] NIGHTGLASS case closed in the lab",
      ]);
      refreshPanels();
      return;
    }

    await typeLine("[ERROR] submit supports: victim, key", "line-error");
  }

  async function showLeaderboard() {
    const leaderboard = window.WAUBUG_STORAGE.getLeaderboard(window.WAUBUG_STATE);
    await typeLines([
      "[LOCAL HALL OF FAME]",
      ...leaderboard.map((entry, index) => `${index + 1}. ${entry.operator || "UNKNOWN"}   ${entry.score || 0}   ${entry.missionName || entry.missionId}`),
    ]);
  }

  async function processCommand(raw) {
    const line = raw.trim();
    if (!line) return;

    window.WAUBUG_STATE.commandHistory.push(line);
    window.WAUBUG_STATE.commandHistory = window.WAUBUG_STATE.commandHistory.slice(-40);

    await typeLine(`${promptPrefix()} ${line}`, "line-highlight");
    track("command", `Executed command: ${line}`, { command: line });
    await sleep(120 + Math.floor(Math.random() * 420));

    const [cmdRaw, ...rest] = line.split(/\s+/);
    const cmd = cmdRaw.toLowerCase();
    const arg = rest.join(" ");

    if (cmd === "clear") {
      clearOutput();
      refreshPanels();
      return;
    }

    if (cmd === "help") {
      await typeLines(window.WAUBUG_HELP);
      return;
    }

    if (cmd === "start") {
      await typeLines([
        "[NIGHTGLASS CASE OPENED]",
        "Begin on relay-ops.",
        "Use brief, ls, cat, connect, tree -a, and decode to progress.",
      ]);
      refreshPanels();
      return;
    }

    if (cmd === "brief") {
      await showBriefing();
      return;
    }

    if (cmd === "triage") {
      await showTriage();
      return;
    }

    if (cmd === "hint") {
      await revealHint();
      return;
    }

    if (cmd === "intel") {
      await showIntel();
      return;
    }

    if (cmd === "missions") {
      await showMissions();
      return;
    }

    if (cmd === "victims") {
      await showVictims();
      return;
    }

    if (cmd === "status") {
      await showStatus();
      return;
    }

    if (cmd === "whoami") {
      if (arg) {
        window.WAUBUG_STATE.operator = arg.toUpperCase();
        window.WAUBUG_STATE.operatorCustomized = true;
        track("identity", `Operator set to ${window.WAUBUG_STATE.operator}`, { operator: window.WAUBUG_STATE.operator });
      }
      await typeLines([
        `Operator: ${window.WAUBUG_STATE.operator}`,
        `Node: ${currentNode().label}`,
        `Score: ${window.WAUBUG_STATE.score}`,
      ]);
      refreshPanels();
      return;
    }

    if (cmd === "pwd") {
      await typeLine(currentPath());
      return;
    }

    if (cmd === "connect") {
      await handleConnect(rest[0]);
      return;
    }

    if (cmd === "ls") {
      await handleList(rest);
      return;
    }

    if (cmd === "cd") {
      await handleCd(arg);
      return;
    }

    if (cmd === "cat") {
      await handleCat(arg);
      return;
    }

    if (cmd === "tree") {
      await handleTree(rest);
      return;
    }

    if (cmd === "find") {
      await handleFind(arg);
      return;
    }

    if (cmd === "grep") {
      const [needle, maybePath] = rest;
      await handleGrep(needle, maybePath);
      return;
    }

    if (cmd === "decode") {
      const [mode, ...valueParts] = rest;
      await handleDecode(mode, valueParts.join(" "));
      return;
    }

    if (cmd === "quarantine") {
      await handleQuarantine(arg);
      return;
    }

    if (cmd === "submit") {
      const [kind, ...valueParts] = rest;
      await handleSubmit(kind, valueParts.join(" "));
      return;
    }

    if (cmd === "leaderboard") {
      await showLeaderboard();
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

    if (cmd === "history") {
      const list = window.WAUBUG_STATE.commandHistory.slice(-20);
      await typeLines(list.length ? list : ["[No command history]"]);
      return;
    }

    if (cmd === "matrix") {
      await typeLine("[+] Noise layer intensified", "line-success");
      document.getElementById("matrix-rain").style.opacity = "0.12";
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
      setCaseResult("Case reset");
      clearOutput();
      await typeLines([
        "[+] Nightglass reset",
        "[+] Fresh case state loaded",
      ]);
      refreshPanels();
      return;
    }

    if (cmd === "exit") {
      await typeLine("Session ended. Refresh to restart.");
      markSessionOffline();
      input.disabled = true;
      return;
    }

    await typeLine(`[ERROR] Command not found: ${cmd}`, "line-error");
  }

  async function runBootSequence() {
    for (const line of bootLines) {
      bootText.textContent += `${line}\n`;
      await sleep(80);
    }
    await sleep(450);
    bootScreen.classList.remove("active");
    bootScreen.classList.add("hidden");
    legalScreen.classList.remove("hidden");
    legalInput.focus();
  }

  legalInput.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    const value = legalInput.value.trim().toLowerCase();

    if (value === "accept") {
      legalScreen.classList.add("hidden");
      workspace.classList.remove("hidden");
      input.focus();
      startEffects();
      tickClock();
      setInterval(tickClock, 1000);
      discover("node:relay-ops", "Opened Nightglass relay node", 80);
      startAutosave();
      updatePrompt();
      refreshPanels();
      track("session", "Nightglass session started", { operator: window.WAUBUG_STATE.operator });
      typeLines([
        "[NIGHTGLASS ONLINE]",
        "Fictional breach investigation challenge loaded",
        "Use brief to open the case file",
        "Use triage to view objectives",
      ]);
      return;
    }

    if (value === "exit") {
      window.location.href = "about:blank";
      return;
    }

    legalInput.value = "";
  });

  input.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    const command = input.value;
    input.value = "";
    input.disabled = true;
    await processCommand(command);
    input.disabled = false;
    input.focus();
  });

  actionBar?.addEventListener("click", async (event) => {
    const action = event.target?.dataset?.action;
    if (!action) return;

    if (action === "brief") await showBriefing();
    if (action === "triage") await showTriage();
    if (action === "hint") await revealHint();
  });

  window.addEventListener("pagehide", markSessionOffline);
  window.addEventListener("beforeunload", markSessionOffline);

  runBootSequence();
})();
