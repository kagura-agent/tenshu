# X/Twitter Posts

## Main Launch Post
Attach: war-room.png + control-deck.png (as carousel)

```
I built a mission control dashboard for my autonomous AI agent team.

It has:
- Anime character portraits (AI-generated locally with Flux)
- Two command center themes (War Room + Control Deck)
- Real-time task history with quality scores
- Live GPU/CPU/VRAM monitoring
- Experiment tracking with ratcheting (bad work gets auto-reverted)

The agents run 24/7 on local models (RTX 5090), and Tenshu lets me watch them work.

Open source: github.com/JesseRWeigel/tenshu
```

## Follow-up Thread (post as reply)

```
Some context: I'm running a team of 5 AI agents (planner, researcher, coder, QA, comms) that autonomously:

- Pick tasks from a rotation
- Research → code → review → score
- Auto-revert bad work (ratcheting)
- Keep improving in a loop

174 cycles and counting. Tenshu is how I monitor it all.
```

```
The character art is generated locally using ComfyUI + Flux Schnell on the same RTX 5090 that runs the agents.

Each agent has their own anime portrait. Planning to add a character picker so users can customize their team's look.
```

```
Stack: React 19 + Vite + Hono + WebSocket + Tailwind + Shadcn/ui

No cloud, no API costs for monitoring. Everything runs on localhost.

MIT licensed if you want to try it with your own OpenClaw setup.
```

## Alt shorter post (if you prefer punchy)
Attach: control-deck.png

```
Built an anime-themed mission control for my autonomous AI agent team.

5 agents, 174 cycles, running 24/7 on local models.

Open source: github.com/JesseRWeigel/tenshu
```
