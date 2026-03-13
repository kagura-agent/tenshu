# Hacker News — Show HN

## Title (max 80 chars)
Show HN: Tenshu – Anime-themed mission control for autonomous AI agent teams

## URL
https://github.com/JesseRWeigel/tenshu

## Comment (post immediately after submission)

Hi HN! I built Tenshu to monitor a team of 5 AI agents running autonomously on local models (RTX 5090, various Qwen models via Ollama).

The agents operate in a loop: plan → research → code → QA review → score. Bad work gets auto-reverted (ratcheting, inspired by Karpathy's autoresearch). 174 cycles so far, ~82% success rate.

The dashboard has:
- Two command center views (Japanese War Room, cyberpunk Control Deck)
- AI-generated anime character portraits (Flux Schnell, generated locally)
- Real-time WebSocket updates for agent status and task history
- Experiment tracking with score trends
- GPU/CPU/VRAM monitoring

Stack: React 19 + Vite + Hono + WebSocket. Monorepo with npm workspaces.

Requires OpenClaw (https://github.com/openclaw) for the agent management layer.

Happy to answer questions about the architecture or the autonomous agent setup.
