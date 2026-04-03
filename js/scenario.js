(function () {
  function dir(children = {}, meta = {}) {
    return { type: "dir", children, meta };
  }

  function file(content, meta = {}) {
    return { type: "file", content, meta };
  }

  const nodes = {
    "relay-ops": {
      label: "RELAY-OPS",
      description: "Incident relay with case notes, mail alerts, and staff intel.",
      root: dir({
        brief: dir({
          "operations.md": file(
            [
              "CASE: NIGHTGLASS // BLACK VAULT",
              "SCENARIO: Fictional megacorp breach simulation.",
              "",
              "Known compromise surface:",
              "- finance-ws17 emitted a locker process from a hidden document cache.",
              "- vault-phone-13 beaconed to an external collector from a hidden media path.",
              "",
              "Recovery logic:",
              "- Alpha fragment lives on the workstation and is base64 encoded.",
              "- Beta fragment lives on the phone node and is hex encoded.",
              "- Append the victim's extension to the combined decoded phrase.",
              "",
              "Containment goal:",
              "- Locate both malicious folders.",
              "- Identify the victim tied to both endpoints.",
              "- Quarantine both payloads.",
              "- Submit the final unlock token.",
            ].join("\n")
          ),
          "rules.txt": file(
            [
              "RULES OF PLAY",
              "",
              "This is a contained forensic puzzle.",
              "Investigate only fictional virtual systems.",
              "No real targets exist in this scenario.",
              "Use the terminal to explore, decode, identify, and contain.",
            ].join("\n")
          ),
        }),
        intel: dir({
          "staff.csv": file(
            [
              "alias,name,team,paired_asset,extension",
              "MCHEN,Maya Chen,Finance Strategy,vault-phone-13,47",
              "JPARK,Jae Park,Revenue Ops,vault-phone-07,61",
              "LORTIZ,Lina Ortiz,Cloud Platform,vault-phone-22,18",
            ].join("\n")
          ),
          "packet.trace": file(
            [
              "00:14:12 relay notice -> finance-ws17 unusual file writes under /Users/*/Documents/**/.*",
              "00:14:55 mdm beacon -> vault-phone-13 POST /collect/.lensync/bootstrap",
              "00:15:06 dns anomaly -> delta.umbra.invalid <- vault-phone-13",
              "00:15:28 smb event -> invoice-lock attempted share encryption from finance-ws17",
            ].join("\n")
          ),
          "responders.note": file(
            [
              "Lead note:",
              "- Start on relay-ops.",
              "- Pivot to the workstation for the alpha fragment.",
              "- Pivot to the phone for the beta fragment.",
              "- Hidden dot-folders are part of the puzzle.",
            ].join("\n")
          ),
        }),
        mail: dir({
          "alerts.log": file(
            [
              "[critical] finance-ws17: locker note dropped from hidden user document cache",
              "[critical] paired asset vault-phone-13 beaconed from a hidden photo cache",
              "[hint] extension belongs to the victim, not the device",
            ].join("\n")
          ),
        }),
        hosts: dir({
          "finance-ws17.link": file("Use `connect finance-ws17` to inspect the compromised workstation."),
          "vault-phone-13.link": file("Use `connect vault-phone-13` to inspect the paired mobile backup."),
        }),
      }),
    },
    "finance-ws17": {
      label: "FINANCE-WS17",
      description: "Finance strategy workstation with the locker dropper.",
      root: dir({
        Users: dir({
          "maya.chen": dir({
            Desktop: dir({
              "todo.txt": file(
                [
                  "Quarter close reminders:",
                  "- remove old hidden invoice cache before audit",
                  "- alpha fragment = base64:TklHSFQ=",
                  "- if the paired phone also lights up, the owner extension completes the token",
                ].join("\n")
              ),
            }),
            Documents: dir({
              Q4: dir({
                "board-notes.txt": file(
                  [
                    "Revenue board prep:",
                    "- finance vault mirror",
                    "- draft investor packet",
                    "- move stale files out of hidden invoice cache",
                  ].join("\n")
                ),
                ".invoices": dir({
                  cache: dir({
                    "invoice-lock": dir(
                      {
                        "README.txt": file(
                          [
                            "invoice-lock // locker note",
                            "",
                            "Your finance workspace has been sealed.",
                            "This payload targets planning and forecast files.",
                            "Acquire the full unlock token to begin reversal.",
                          ].join("\n")
                        ),
                        "locker.cfg": file(
                          [
                            "name=invoice-lock",
                            "mode=ransomware",
                            "scope=finance-docs",
                            "shadow_copy=destroyed",
                          ].join("\n")
                        ),
                        "targets.lst": file(
                          [
                            "/Users/maya.chen/Documents/Q4",
                            "/Users/maya.chen/Desktop",
                          ].join("\n")
                        ),
                      },
                      { artifact: "invoice-lock", kind: "ransomware" }
                    ),
                  }),
                }),
              }),
            }),
          }),
        }),
        ProgramData: dir({
          "scanner.log": file(
            [
              "engine: local-edr",
              "result: unsigned locker process observed under /Users/maya.chen/Documents/Q4/.invoices/cache/invoice-lock",
            ].join("\n")
          ),
        }),
        Temp: dir({
          "case-note.txt": file(
            [
              "Cross-reference the paired phone asset.",
              "If phone ownership matches the desktop owner, the same victim is hit twice.",
            ].join("\n")
          ),
        }),
      }),
    },
    "vault-phone-13": {
      label: "VAULT-PHONE-13",
      description: "Mobile backup image tied to the same victim.",
      root: dir({
        config: dir({
          "owner.txt": file(
            [
              "asset=vault-phone-13",
              "user=Maya Chen",
              "team=Finance Strategy",
              "extension=47",
            ].join("\n")
          ),
        }),
        messages: dir({
          "drafts.log": file(
            [
              "IR draft:",
              "combine alpha + beta, then append the owner extension",
              "beta is still hex encoded in the hidden collector folder",
            ].join("\n")
          ),
        }),
        sdcard: dir({
          DCIM: dir({
            ".thumbcache": dir({
              system: dir({
                ".lensync": dir(
                  {
                    "agent.json": file(
                      JSON.stringify(
                        {
                          name: "lensync",
                          mode: "spyware",
                          uplink: "delta.umbra.invalid",
                          owner: "MCHEN",
                          beta: "474c415353",
                        },
                        null,
                        2
                      )
                    ),
                    "stills.idx": file(
                      [
                        "queued capture: finance_war_room.jpg",
                        "queued capture: password_reset_sms.png",
                        "queued capture: board_notes.jpeg",
                      ].join("\n")
                    ),
                  },
                  { artifact: "lensync", kind: "spyware" }
                ),
              }),
            }),
          }),
        }),
      }),
    },
  };

  const caseTargets = {
    ransomwareNode: "finance-ws17",
    ransomwarePath: "/Users/maya.chen/Documents/Q4/.invoices/cache/invoice-lock",
    spywareNode: "vault-phone-13",
    spywarePath: "/sdcard/DCIM/.thumbcache/system/.lensync",
    victimName: "Maya Chen",
    victimAlias: "MCHEN",
    finalKey: "NIGHTGLASS-47",
    alpha: "NIGHT",
    beta: "GLASS",
  };

  const hints = [
    "The relay case file tells you which two nodes matter first.",
    "The locker folder on the workstation is inside a hidden dot-folder under Q4.",
    "The phone beacon path itself leaks the hidden spyware directory name.",
    "Alpha is base64 on the workstation. Beta is hex on the phone.",
    "The victim extension is the numeric suffix on the final unlock token.",
  ];

  function normalizePath(inputPath, cwd = "/") {
    const raw = typeof inputPath === "string" && inputPath.trim() ? inputPath.trim() : ".";
    const absolute = raw.startsWith("/") ? raw : `${cwd.replace(/\/+$/, "")}/${raw}`;
    const parts = absolute.split("/").filter(Boolean);
    const normalized = [];

    parts.forEach((part) => {
      if (part === ".") return;
      if (part === "..") {
        normalized.pop();
        return;
      }
      normalized.push(part);
    });

    return `/${normalized.join("/")}`.replace(/\/+/g, "/") || "/";
  }

  function traverse(nodeId, inputPath = "/", cwd = "/") {
    const node = nodes[nodeId];
    if (!node) return { error: `Unknown node: ${nodeId}` };

    const normalizedPath = normalizePath(inputPath, cwd);
    const parts = normalizedPath.split("/").filter(Boolean);
    let entry = node.root;

    for (const part of parts) {
      if (entry.type !== "dir") {
        return { error: `Not a directory: ${normalizedPath}` };
      }

      entry = entry.children[part];
      if (!entry) {
        return { error: `Path not found: ${normalizedPath}` };
      }
    }

    return { entry, path: normalizedPath, node };
  }

  function list(nodeId, inputPath = ".", cwd = "/", options = {}) {
    const found = traverse(nodeId, inputPath, cwd);
    if (found.error) return found;
    if (found.entry.type !== "dir") return { error: `Not a directory: ${found.path}` };

    const entries = Object.entries(found.entry.children)
      .filter(([name]) => options.all || !name.startsWith("."))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, value]) => ({
        name,
        type: value.type,
      }));

    return { path: found.path, entries };
  }

  function cat(nodeId, inputPath = ".", cwd = "/") {
    const found = traverse(nodeId, inputPath, cwd);
    if (found.error) return found;
    if (found.entry.type !== "file") return { error: `Not a file: ${found.path}` };
    return { path: found.path, content: found.entry.content, meta: found.entry.meta || {} };
  }

  function renderTree(nodeId, inputPath = ".", cwd = "/", options = {}) {
    const found = traverse(nodeId, inputPath, cwd);
    if (found.error) return found;
    if (found.entry.type !== "dir") return { error: `Not a directory: ${found.path}` };

    const lines = [found.path];

    function walk(entry, prefix) {
      const names = Object.keys(entry.children)
        .filter((name) => options.all || !name.startsWith("."))
        .sort((left, right) => left.localeCompare(right));

      names.forEach((name, index) => {
        const child = entry.children[name];
        const isLast = index === names.length - 1;
        const branch = isLast ? "└─ " : "├─ ";
        lines.push(`${prefix}${branch}${name}${child.type === "dir" ? "/" : ""}`);
        if (child.type === "dir") {
          walk(child, `${prefix}${isLast ? "   " : "│  "}`);
        }
      });
    }

    walk(found.entry, "");
    return { path: found.path, lines };
  }

  function searchNames(nodeId, term, cwd = "/") {
    const query = String(term || "").trim().toLowerCase();
    if (!query) return { results: [] };

    const matches = [];

    function walk(entry, currentPath) {
      if (entry.type !== "dir") return;

      Object.entries(entry.children).forEach(([name, child]) => {
        const nextPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
        if (name.toLowerCase().includes(query)) {
          matches.push({
            path: nextPath,
            type: child.type,
          });
        }
        if (child.type === "dir") walk(child, nextPath);
      });
    }

    const found = traverse(nodeId, ".", cwd);
    if (found.error) return found;
    walk(found.entry, found.path);
    return { results: matches };
  }

  function grepContents(nodeId, needle, inputPath = ".", cwd = "/") {
    const query = String(needle || "").trim().toLowerCase();
    if (!query) return { matches: [] };

    const found = traverse(nodeId, inputPath, cwd);
    if (found.error) return found;

    const matches = [];

    function walk(entry, currentPath) {
      if (entry.type === "file") {
        const lines = String(entry.content).split("\n");
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            matches.push(`${currentPath}:${index + 1}: ${line}`);
          }
        });
        return;
      }

      Object.entries(entry.children).forEach(([name, child]) => {
        const nextPath = currentPath === "/" ? `/${name}` : `${currentPath}/${name}`;
        walk(child, nextPath);
      });
    }

    walk(found.entry, found.path);
    return { matches };
  }

  window.WAUBUG_SCENARIO = {
    caseName: "NIGHTGLASS // BLACK VAULT",
    caseTargets,
    hints,
    nodes,
    normalizePath,
    traverse,
    list,
    cat,
    renderTree,
    searchNames,
    grepContents,
    availableNodes: Object.entries(nodes).map(([id, node]) => ({
      id,
      label: node.label,
      description: node.description,
    })),
  };
})();
