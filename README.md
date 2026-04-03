# WAUBUG SIMULATIONS

WAUBUG is now a pure web app. It runs entirely in the browser with HTML, CSS, JavaScript, and `localStorage`.

## What Changed

- Removed the backend, database, env-based auth, and server-side analytics
- Removed Docker and platform runtime files
- Replaced API calls with browser-local savepoints, reports, and event history
- Turned the old admin screen into a local Ops Board
- Kept the simulator fully synthetic and defensive

## Browser-Only Features

- Persistent local progress in `localStorage`
- Local hall of fame and savepoints
- Exportable JSON training reports
- Mission briefings and tactical intel commands
- Local Ops Board at `admin.html`

## Run It

Open `index.html` directly in a browser, or deploy the folder as static files.

No install, no server, no environment variables.

## Static Deploy

This repo is now ready for static hosting:

- GitHub Pages
- Vercel static deploy
- Netlify
- Cloudflare Pages

## Useful Commands

- `brief`
- `intel`
- `auth-audit`
- `victim-status`
- `savepoint`
- `report`
- `board`
- `resetlab confirm`

## Safety Note

Everything in this project is simulated for defensive training.

- No real exploitation
- No real target contact
- No system data collection
- No backend telemetry
