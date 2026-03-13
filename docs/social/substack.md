# Substack Post

## Title
Building Mission Control for My AI Agent Team

## Subtitle
How I built Tenshu — an anime-themed dashboard for monitoring autonomous AI agents running 24/7

## Body

I've been running a team of 5 AI agents autonomously on my RTX 5090 for the past week. They research, code, review each other's work, and improve in a loop. 174 cycles and counting.

The problem: monitoring them meant tailing log files and grepping through TSV results. I needed something better.

### Enter Tenshu

Tenshu (天守) is the main tower of a Japanese castle — the highest point from which the lord surveys everything below. It felt right for a mission control dashboard.

[Screenshot: war-room.png]

The War Room view shows all agents at their stations in a Japanese dojo, with cherry blossom particles drifting across the screen. Each agent has their own AI-generated anime portrait and shows their recent task history with quality scores.

[Screenshot: control-deck.png]

The Control Deck is the cyberpunk alternative — neon grids, CRT scan lines, a live terminal feed, and monitor stations for each agent. Same data, different vibe.

### The Agent Team

Five agents, each with a role:

- **Erwin** (Planner) — Creates briefs for each cycle
- **Senku** (Researcher) — Investigates the task, gathers context
- **Bulma** (Coder) — Writes the actual code
- **Vegeta** (QA) — Reviews and scores the work
- **Jet** (Comms) — Handles notifications

They run on various local models (Qwen 3.5, Qwen 2.5) via Ollama. The orchestrator picks tasks from a rotation (code review, test writing, tool building, research, etc.), delegates to each agent, and auto-reverts bad work. Only improvements survive.

### What Tenshu Monitors

[Screenshot: results.png]

The Results page tracks every cycle: task name, agent, score, keep/discard status, and description. You can see the score trend over time. This is based on the [Karpathy autoresearch pattern](https://github.com/karpathy/autoresearch) — a ratcheting mechanism where bad experiments get reverted.

[Screenshot: system.png]

The System page shows live GPU metrics (my RTX 5090 running at 98% VRAM), CPU load, RAM, disk, and which Ollama models are currently loaded.

### The Character Art

This was a fun detour. I used ComfyUI with Flux Schnell to generate anime character portraits for each agent — all running locally on the same GPU. A strategist with a fan, a scientist with goggles, an engineer in red armor, a guardian with a scouter, and a messenger with a scarf.

### What's Next

- Character picker so users can customize their team's look
- Real activity feed replacing the current placeholder terminal
- Score trend sparklines inline with each agent
- Anime-style sound effects on status changes

### Try It

Tenshu is open source: [github.com/JesseRWeigel/tenshu](https://github.com/JesseRWeigel/tenshu)

It requires [OpenClaw](https://github.com/openclaw) for the agent management layer. If you're running autonomous agent teams and want a better way to watch them work, give it a try.

---

*This is part of an ongoing project to build self-improving AI systems. More updates to come.*
