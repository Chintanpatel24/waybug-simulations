window.WAUBUG_MISSIONS = [
  {
    id: "NG-01",
    name: "NIGHTGLASS // ENTRY TRACE",
    objective: "Locate the hidden ransomware folder on the workstation and correlate it to the paired mobile node.",
    reward: 2500,
    tasks: [
      "Connect to finance-ws17 and inspect the user tree",
      "Locate the hidden invoice-lock folder",
      "Read the alpha fragment from the workstation",
      "Pivot to the paired phone asset",
    ],
  },
  {
    id: "NG-02",
    name: "NIGHTGLASS // SHADOW PHONE",
    objective: "Find the spyware folder, identify the victim, and recover the beta fragment.",
    reward: 3000,
    tasks: [
      "Locate the hidden lensync folder on vault-phone-13",
      "Extract the beta fragment from the spyware config",
      "Confirm the victim identity",
      "Determine the victim extension",
    ],
  },
  {
    id: "NG-03",
    name: "NIGHTGLASS // BLACKOUT REVERSAL",
    objective: "Decode the final token, quarantine both payloads, and close the case.",
    reward: 4000,
    tasks: [
      "Decode alpha and beta into a single phrase",
      "Quarantine invoice-lock",
      "Quarantine lensync",
      "Submit the final unlock token",
    ],
  },
];
