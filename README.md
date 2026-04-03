# NIGHTGLASS // BLACK VAULT

Static browser CTF-style incident response game built with HTML, CSS, and JavaScript.

## What It Is

- A black-theme forensic puzzle
- A fictional breach case across a workstation and a paired phone backup
- Hidden folders, encoded clues, victim identification, and containment steps
- Fully browser-local with `localStorage`

## Core Loop

1. Open the case on `relay-ops`
2. Pivot into the simulated nodes
3. Find the hidden ransomware and spyware folders
4. Decode alpha and beta fragments
5. Identify the victim
6. Quarantine both payloads
7. Submit the final unlock token

## Main Commands

- `brief`
- `triage`
- `connect [node]`
- `ls -a`
- `tree -a`
- `cat [file]`
- `find [term]`
- `grep [term] [path]`
- `decode [base64|hex] [value]`
- `quarantine [artifact]`
- `submit victim [name]`
- `submit key [token]`

## Safety

This is a fictional defensive investigation game.

- No real companies
- No real victims
- No real phone or company hacking
- No live network activity

## Run

Open `index.html` in a browser or deploy the folder as static files.
