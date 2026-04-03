(function () {
  const STORAGE_KEYS = {
    state: "waubug-state-v4",
    events: "waubug-events-v4",
    snapshots: "waubug-snapshots-v4",
    session: "waubug-session-id",
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch (_err) {
      return clone(fallback);
    }
  }

  function writeJson(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  function resolveSessionId() {
    const existing = window.sessionStorage.getItem(STORAGE_KEYS.session);
    if (existing) return existing;

    const generated =
      typeof window.crypto?.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `waubug-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    window.sessionStorage.setItem(STORAGE_KEYS.session, generated);
    return generated;
  }

  function mergeState(baseState, savedState) {
    return {
      ...baseState,
      ...savedState,
      sessionId: resolveSessionId(),
      commandHistory: Array.isArray(savedState?.commandHistory)
        ? savedState.commandHistory.slice(-40)
        : baseState.commandHistory,
      completedMissionIds: Array.isArray(savedState?.completedMissionIds)
        ? [...new Set(savedState.completedMissionIds)]
        : baseState.completedMissionIds,
      virtualVictim: {
        ...baseState.virtualVictim,
        ...(savedState?.virtualVictim || {}),
      },
      toolkit: {
        ...baseState.toolkit,
        ...(savedState?.toolkit || {}),
      },
      reportMeta: {
        ...baseState.reportMeta,
        ...(savedState?.reportMeta || {}),
      },
      game: {
        ...baseState.game,
        ...(savedState?.game || {}),
        discoveredPaths: Array.isArray(savedState?.game?.discoveredPaths)
          ? [...new Set(savedState.game.discoveredPaths)]
          : [...(baseState.game?.discoveredPaths || [])],
        quarantined: Array.isArray(savedState?.game?.quarantined)
          ? [...new Set(savedState.game.quarantined)]
          : [...(baseState.game?.quarantined || [])],
        completedObjectives: Array.isArray(savedState?.game?.completedObjectives)
          ? [...new Set(savedState.game.completedObjectives)]
          : [...(baseState.game?.completedObjectives || [])],
        decoded: {
          ...(baseState.game?.decoded || {}),
          ...(savedState?.game?.decoded || {}),
        },
        submissions: {
          ...(baseState.game?.submissions || {}),
          ...(savedState?.game?.submissions || {}),
        },
      },
    };
  }

  function sanitizeState(state) {
    return {
      sessionId: resolveSessionId(),
      operator: state.operator,
      operatorCustomized: Boolean(state.operatorCustomized),
      target: state.target,
      mission: state.mission,
      stealth: state.stealth,
      score: state.score,
      exfilPreventedGb: state.exfilPreventedGb,
      incidentsClosed: state.incidentsClosed,
      commandHistory: (state.commandHistory || []).slice(-40),
      missionProgress: state.missionProgress,
      completedMissionIds: [...new Set(state.completedMissionIds || [])],
      virtualVictim: { ...state.virtualVictim },
      toolkit: { ...state.toolkit },
      reportMeta: { ...state.reportMeta },
      game: {
        ...state.game,
        discoveredPaths: [...new Set(state.game?.discoveredPaths || [])],
        quarantined: [...new Set(state.game?.quarantined || [])],
        completedObjectives: [...new Set(state.game?.completedObjectives || [])],
        decoded: { ...(state.game?.decoded || {}) },
        submissions: { ...(state.game?.submissions || {}) },
      },
      lastActiveAt: new Date().toISOString(),
    };
  }

  function loadState(baseState) {
    return mergeState(baseState, readJson(STORAGE_KEYS.state, {}));
  }

  function saveState(state) {
    writeJson(STORAGE_KEYS.state, sanitizeState(state));
  }

  function getEvents() {
    return readJson(STORAGE_KEYS.events, []);
  }

  function trackEvent(type, message, details = {}) {
    const events = getEvents();
    events.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      details,
      createdAt: new Date().toISOString(),
    });
    writeJson(STORAGE_KEYS.events, events.slice(0, 80));
  }

  function getSnapshots() {
    return readJson(STORAGE_KEYS.snapshots, []);
  }

  function saveSnapshot(state, reason = "manual") {
    const snapshots = getSnapshots();
    const snapshot = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
      reason,
      operator: state.operator,
      missionId: state.mission.id,
      missionName: state.mission.name,
      score: state.score,
      stealth: state.stealth,
      progress: state.missionProgress,
      target: state.target,
      incidentsClosed: state.incidentsClosed,
      exfilPreventedGb: state.exfilPreventedGb,
      virtualVictim: { ...state.virtualVictim },
      commandCount: (state.commandHistory || []).length,
      currentNode: state.game?.connectedNode || "",
      currentPath: state.game?.cwd || "/",
      quarantined: [...(state.game?.quarantined || [])],
    };

    snapshots.unshift(snapshot);
    writeJson(STORAGE_KEYS.snapshots, snapshots.slice(0, 24));
    trackEvent("snapshot", `Saved ${reason} snapshot for ${state.mission.name}`, { reason, score: state.score });
    return snapshot;
  }

  function markMissionCompleted(state) {
    const completed = new Set(state.completedMissionIds || []);
    if (state.missionProgress < 100 || completed.has(state.mission.id)) return false;

    completed.add(state.mission.id);
    state.completedMissionIds = [...completed];
    saveSnapshot(state, "mission-complete");
    trackEvent("mission", `Mission completed: ${state.mission.name}`, {
      missionId: state.mission.id,
      score: state.score,
    });
    return true;
  }

  function getLeaderboard(currentState) {
    const entries = [...getSnapshots()];
    if (currentState?.operator && currentState?.mission?.id) {
      entries.unshift({
        id: "live-session",
        savedAt: new Date().toISOString(),
        reason: "live",
        operator: currentState.operator,
        missionId: currentState.mission.id,
        missionName: currentState.mission.name,
        score: currentState.score,
        stealth: currentState.stealth,
        progress: currentState.missionProgress,
        target: currentState.target,
      });
    }

    return entries
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return Date.parse(b.savedAt) - Date.parse(a.savedAt);
      })
      .slice(0, 5);
  }

  function getMetrics(currentState) {
    const snapshots = getSnapshots();
    const events = getEvents();
    const referenceState = currentState || readJson(STORAGE_KEYS.state, {});
    const bestScore = [referenceState?.score || 0, ...snapshots.map((snapshot) => snapshot.score || 0)].reduce(
      (max, value) => Math.max(max, value),
      0
    );

    return {
      currentOperator: referenceState?.operator || "UNASSIGNED",
      currentMission: referenceState?.mission?.name || "NONE",
      currentTarget: referenceState?.target || "training.local",
      totalScore: referenceState?.score || 0,
      bestScore,
      snapshotsSaved: snapshots.length,
      eventsLogged: events.length,
      missionsCompleted: (referenceState?.completedMissionIds || []).length,
      lastActiveAt: referenceState?.lastActiveAt || null,
      reportsExported: referenceState?.reportMeta?.exports || 0,
      lastExportAt: referenceState?.reportMeta?.lastExportAt || null,
    };
  }

  function buildReport(currentState) {
    const sourceState =
      currentState?.operator && currentState?.mission?.id ? currentState : readJson(STORAGE_KEYS.state, {});

    return {
      exportedAt: new Date().toISOString(),
      app: "WAUBUG SIMULATIONS",
      mode: "browser-local",
      currentState: sanitizeState(sourceState),
      metrics: getMetrics(sourceState),
      leaderboard: getLeaderboard(sourceState),
      snapshots: getSnapshots(),
      events: getEvents(),
    };
  }

  function downloadReport(currentState) {
    const report = buildReport(currentState);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `waubug-report-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(href);
    return report;
  }

  function resetLab() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    });
  }

  window.WAUBUG_STORAGE = {
    buildReport,
    downloadReport,
    getEvents,
    getLeaderboard,
    getMetrics,
    getSnapshots,
    loadState,
    markMissionCompleted,
    readCurrentState: () => readJson(STORAGE_KEYS.state, {}),
    resetLab,
    resolveSessionId,
    saveSnapshot,
    saveState,
    trackEvent,
  };
})();
