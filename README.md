# 天守 Tenshu

> **天守** (tenshu) — The main tower of a Japanese castle. The highest point from which the lord surveys and commands everything below. Literally "Protector of Heaven" (天 = heaven, 守 = protector/guardian).

Real-time dashboard for [OpenClaw](https://github.com/openclaw) AI agent teams.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Features

- **Agent Dashboard** — Live status, current tasks, model info for all agents. Real-time activity feed via WebSocket.
- **3D Office** — Interactive voxel office with agent desks, status-colored monitors, and moving avatars. Click desks to view agent details.
- **Session Viewer** — Active Claude Code sessions with token counts, model, duration, and cost tracking.
- **Cron Manager** — View, toggle, and manually trigger scheduled tasks.
- **Results Log** — Experiment results from orchestrator cycles with score trends, keep/discard status, and success rate stats. Reads from `results.tsv` (Karpathy autoresearch pattern).
- **System Monitor** — Real-time GPU temperature, utilization, VRAM, CPU, RAM, disk usage, and loaded Ollama models. Know when your hardware is under stress.

## Prerequisites

- Node.js 22+
- [OpenClaw](https://github.com/openclaw) installed and configured (`~/.openclaw/openclaw.json`)

## Quick Start

```bash
git clone https://github.com/JesseRWeigel/tenshu.git
cd tenshu
npm install
npm run dev
```

This starts both the API server (port 3001) and the client dev server (port 5173). Open http://localhost:5173.

## Configuration

Create `tenshu.config.ts` in the project root to customize:

```ts
export default {
  openclawDir: "~/.openclaw",  // Path to OpenClaw config
  port: 3001,                   // API server port
  clientPort: 5173,             // Client dev server port
  theme: "dark",                // dark | light | system
  accentColor: "#ff6b35",       // UI accent color
};
```

Environment variables:
- `OPENCLAW_DIR` — Override config directory (default: `~/.openclaw`)
- `TENSHU_PORT` — Override server port (default: `3001`)
- `RESULTS_TSV` — Override results.tsv path (default: `~/clawd/team/knowledge/results.tsv`)

## Architecture

```
tenshu/
├── shared/     # TypeScript types and constants
├── server/     # Hono API server + WebSocket + file watchers
└── client/     # Vite + React SPA + Shadcn/ui + Three.js
```

**Data flow:** Server reads `openclaw.json` as single source of truth → polls `openclaw sessions` CLI for live sessions → watches agent workspaces for file changes → reads `nvidia-smi` and `/proc` for system metrics → broadcasts updates via WebSocket → client renders in real-time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Client | Vite, React, Tailwind CSS, Shadcn/ui |
| 3D | React Three Fiber, drei |
| Server | Hono, WebSocket, chokidar |
| Real-time | WebSocket (bidirectional) |
| Monorepo | npm workspaces |

## License

MIT
