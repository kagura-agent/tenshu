# 天守 Tenshu

> **天守** (tenshu) — The main tower of a Japanese castle. The highest point from which the lord surveys and commands everything below. Literally "Protector of Heaven" (天 = heaven, 守 = protector/guardian).

Real-time dashboard for [OpenClaw](https://github.com/openclaw) AI agent teams. Monitor your autonomous agents with anime-styled command centers, live activity feeds, experiment tracking, and system metrics.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Screenshots

### Command Center — War Room
AI-generated anime character portraits, per-agent task history with scores, cherry blossom particle effects, and a Japanese dojo background.

![War Room](docs/screenshots/war-room.png)

### Command Center — Control Deck
Cyberpunk-themed mission control with neon grid, CRT scan lines, live terminal feed, and agent monitor stations.

![Control Deck](docs/screenshots/control-deck.png)

### Dashboard
Live agent status cards with WebSocket connection indicator, model info, and real-time activity feed.

![Dashboard](docs/screenshots/dashboard.png)

### Results Log
Experiment results from orchestrator cycles — score trends, keep/discard ratcheting, success rate stats. Based on the [Karpathy autoresearch](https://github.com/karpathy/autoresearch) pattern.

![Results](docs/screenshots/results.png)

### Activity Feed
Real-time orchestrator output, per-agent logs with timestamps, and research artifact previews.

![Activity](docs/screenshots/activity.png)

### System Monitor
Live GPU/CPU/RAM/disk metrics, loaded Ollama models, and system uptime.

![System](docs/screenshots/system.png)

## Features

- **Command Center** — Two themed views (War Room + Control Deck) with AI-generated anime character portraits, per-agent task history, live cycle status, and particle effects
- **Agent Dashboard** — Live status, current tasks, model info for all agents with real-time WebSocket updates
- **Session Viewer** — Active Claude Code sessions with token counts, model, duration, and cost tracking
- **Cron Manager** — View, toggle, and manually trigger scheduled tasks
- **Results Log** — Experiment results with score trends, keep/discard ratcheting, and success rate stats
- **Activity Feed** — Real-time orchestrator output, agent logs, and research artifact previews
- **System Monitor** — GPU temperature, utilization, VRAM, CPU, RAM, disk usage, and loaded Ollama models

## Prerequisites

- Node.js 22+
- [OpenClaw](https://github.com/openclaw) installed and configured (`~/.openclaw/openclaw.json`)
- Linux with NVIDIA GPU (for system monitoring — dashboard works without it)

## Quick Start

```bash
git clone https://github.com/JesseRWeigel/tenshu.git
cd tenshu
npm install
npm run dev
```

This starts both the API server (port 3001) and the client dev server (port 5173). Open http://localhost:5173.

### Generating Character Art (Optional)

Tenshu includes AI-generated anime character portraits. To generate your own with different styles:

```bash
# Requires ComfyUI running locally with Flux Schnell model
pip install websocket-client requests Pillow
python scripts/generate-assets.py
```

Generated images are saved to `client/public/assets/characters/` and `client/public/assets/backgrounds/`.

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
├── client/     # Vite + React + Tailwind + Shadcn/ui
└── scripts/    # Asset generation (ComfyUI)
```

**Data flow:** Server reads `openclaw.json` as single source of truth → polls `openclaw sessions` CLI for live sessions → watches agent workspaces for file changes → reads `nvidia-smi` and `/proc` for system metrics → broadcasts updates via WebSocket → client renders in real-time.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Client | Vite, React 19, Tailwind CSS v4, Shadcn/ui |
| Command Views | HTML Canvas particles, AI-generated art (Flux Schnell) |
| Server | Hono, WebSocket, chokidar |
| Real-time | WebSocket (bidirectional) |
| Monorepo | npm workspaces |
| Art Generation | ComfyUI + Flux Schnell (local GPU) |

## License

MIT
