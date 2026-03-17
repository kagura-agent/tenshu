# Tenshu Remaining Features Plan — 2026-03-13

## Status: COMPLETE

## 1. Zen Garden Theme (枯山水)

- [x] Generate zen garden background image with ComfyUI (or placeholder)
- [x] Add "garden" to ThemeMode union in useTheme.tsx
- [x] Add garden palette: pink (#ffb7c5) accent, stone gray backgrounds
- [x] Add garden particle type: sakura petals (bring back the petal code, they fit outdoor zen garden)
- [x] Add garden button to sidebar theme toggle (3 options now)
- [x] Add garden styles to ThemedMain, Sidebar, WarRoom-equivalent garden view
- [x] Create GardenView component for Command page (zen rock garden with agents)
- [x] Update Office.tsx to handle 3 themes

## 2. Anime-Style Sound Effects

- [x] Find/generate free sound effects (or use Web Audio API synthesis):
  - War Room: taiko drum hit, bamboo water fountain "thock", paper sliding
  - Control Deck: synth beep, digital whoosh, data chirp
  - Zen Garden: wind chime, water droplet, soft bell
- [x] Create SoundManager hook (useSound.ts) with volume control
- [x] Play sounds on: agent status change (idle→working, working→idle, error), cycle completion, theme switch
- [x] Add mute/volume toggle to sidebar
- [x] Respect theme — play theme-appropriate sounds

## 3. Score Trend Sparklines

- [x] Create Sparkline component (tiny SVG line chart, ~60x16px)
- [x] Wire into MiniHistory in both WarRoom and ControlDeck
- [x] Show last 8 scores as a trend line per agent
- [x] Color: green trending up, red trending down, gray flat

## 4. Error State UI

- [x] Design error state card treatment (red glow border, error icon, shake animation)
- [x] Show error message text when agent.state.status === "error"
- [x] Add error count badge if agent has had multiple errors
- [x] Apply to both WarRoom and ControlDeck agent cards

## 5. Verify Character Image Selector

- [x] Restart dev server to pick up avatar routes
- [x] Test avatar picker modal (click pencil on agent portrait)
- [x] Test image upload flow
- [x] Verify cross-component avatar updates via react-query cache
- [x] Fix any issues found

## 6. Update README & Screenshots

- [x] Take fresh screenshots of all pages with new themes
- [x] Update README.md feature list to reflect:
  - 3 themes (War Room, Control Deck, Zen Garden)
  - Global theme toggle
  - Sound effects
  - Score sparklines
  - Error state UI
  - Avatar picker
- [x] Update screenshot gallery
- [x] Commit and push

## Execution Order

1. Sparklines (quick win, pure UI)
2. Error state UI (quick win, pure UI)
3. Sound effects (medium, needs audio files/synthesis)
4. Zen Garden theme (largest — new view, particles, background, palette)
5. Verify character selector
6. Screenshots + README update

## Notes

- Commit after each feature
- Use Playwright to verify visually
- Stop bots if GPU needed for ComfyUI image generation
- Old orchestrator config backed up at ~/clawd/team/orchestrator.py.bak-selfimprove
