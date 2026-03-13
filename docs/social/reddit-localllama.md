# Reddit r/LocalLLaMA Post

## Title
Show-off: Built an anime-themed mission control for my local AI agent team (RTX 5090)

## Body

I've been running a team of 5 autonomous AI agents on my RTX 5090 (Ollama + qwen3.5/qwen2.5 models) and needed a way to actually monitor what they're doing. So I built **Tenshu** — a real-time dashboard with a Japanese castle theme.

**What it looks like:**
[screenshots attached — war-room.png, control-deck.png, results.png, system.png]

**What it does:**
- **Command Center** with two themes — a Japanese War Room (dojo background, cherry blossom particles) and a cyberpunk Control Deck (neon grid, CRT scan lines)
- **AI-generated anime character portraits** for each agent (generated locally with Flux Schnell via ComfyUI on the same GPU)
- **Per-agent task history** — each agent shows what THEY specifically did (researcher: "Researched: code review", coder: "Built: write skill", QA: "Approved/Rejected")
- **Real-time system monitoring** — GPU temp, VRAM, power draw, CPU, RAM, loaded Ollama models
- **Experiment tracking** with ratcheting — bad work gets auto-reverted via git, only improvements are kept
- **Live WebSocket updates** — status changes appear instantly

**The agent setup:**
- 5 agents: Planner (Erwin), Researcher (Senku), Coder (Bulma), QA (Vegeta), Comms (Jet)
- Running on various local models (qwen3.5:9b, qwen2.5:32b, qwen3-coder:30b)
- 174+ autonomous cycles so far, ~82% success rate
- Using the [Karpathy autoresearch](https://github.com/karpathy/autoresearch) pattern for ratcheting

**Tech stack:**
- React 19, Vite, Tailwind v4, Shadcn/ui (client)
- Hono, WebSocket, chokidar (server)
- npm workspaces monorepo
- ComfyUI + Flux Schnell for art generation

**GitHub:** https://github.com/JesseRWeigel/tenshu (MIT licensed)

Requires [OpenClaw](https://github.com/openclaw) for the agent management layer. Happy to answer questions about the setup!
