# Reddit r/ClaudeAI Post

## Title
Built an anime-themed mission control dashboard for OpenClaw agent teams

## Body

I've been using OpenClaw to run a team of AI agents autonomously and built a dashboard called **Tenshu** (天守 — Japanese castle tower) to monitor everything in real-time.

**Screenshots:** [war-room.png, control-deck.png, dashboard.png, results.png]

**Features:**
- Two command center themes with anime character portraits (AI-generated locally with Flux Schnell)
- Real-time agent status, current tasks, and model info via WebSocket
- Per-agent task history with quality scores and keep/discard tracking
- Experiment results log with ratcheting (Karpathy autoresearch pattern)
- System monitoring (GPU, CPU, RAM, VRAM, loaded models)
- Session viewer for active Claude Code sessions
- Cron job management

The agents run autonomously in a loop — researching, coding, reviewing, and scoring their own work. Tenshu gives me visibility into the whole process without having to tail log files.

**Stack:** React 19, Vite, Hono, WebSocket, Tailwind, Shadcn/ui

**GitHub:** https://github.com/JesseRWeigel/tenshu (MIT)

Works with any OpenClaw setup. Would love feedback on what monitoring features would be most useful for your agent workflows.
