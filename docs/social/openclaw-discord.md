# OpenClaw Discord Post

## Channel: #showcase (or #general)

Hey everyone! Built an open-source dashboard for monitoring OpenClaw agent teams called **Tenshu**.

**What it does:**
- Real-time agent status via WebSocket (no polling needed)
- Two command center views with anime character portraits
- Per-agent task history with quality scores
- Session viewer for active Claude Code sessions
- Cron job management
- Results log with ratcheting (autoresearch pattern)
- GPU/CPU/VRAM monitoring

Reads from `~/.openclaw/openclaw.json` and talks to the `openclaw` CLI for session data.

**GitHub:** https://github.com/JesseRWeigel/tenshu

```bash
git clone https://github.com/JesseRWeigel/tenshu.git
cd tenshu && npm install && npm run dev
```

Would love feedback! What monitoring features would be most useful for your agent setups?

[attach: command-center.png, control-deck.png]
