# Tenshu Improvements Plan — 2026-03-13

## Status: ALL PHASES COMPLETE (1-8)

## Phase 1 — Theme-Specific Styling on All Pages (DONE)

### 1.1 Themed Page Headers with Kanji
- [x] Create a `ThemedPageHeader` component with kanji titles per page
- [x] Page kanji mapping:
  - Dashboard: 総覧 OVERVIEW
  - Sessions: 通信 SESSIONS
  - Results: 戦績 BATTLE RECORD
  - Activity: 作戦記録 ACTIVITY LOG
  - Cron: 定時任務 SCHEDULED OPS
  - System: 計器 INSTRUMENTS
- [x] Use theme-appropriate accent colors and gradient lines (like Command views)

### 1.2 Themed Card Styling
- [x] Create a `ThemedCard` component that replaces plain zinc cards
- [x] War Room: warm brown borders, subtle amber glow on hover
- [x] Control Deck: cyan neon border, CRT scanline overlay
- [x] Zen Garden: frosted glass (backdrop-blur), pink tint, soft borders
- [x] Apply to Dashboard, Sessions, Results, Cron, System pages

### 1.3 Themed Charts/Bars
- [x] Results page score bars use theme accent colors
- [x] System page usage bars use theme accent colors
- [x] Sessions page cost display uses theme colors

### 1.4 Subtle Background Particles on All Pages
- [x] Add low-intensity AnimatedCanvas behind ThemedMain content area
- [x] Much lower particle count than Command views (ambient only)

## Phase 2 — Agent Power Levels & XP (DONE)

### 2.1 Power Level Calculation
- [x] Create `usePowerLevel` hook
- [x] Composite score from: avg quality score, tasks completed, success rate
- [x] Display as "PL:XXXX" on agent cards
- [x] XP bar with level-colored fill

### 2.2 XP Bar & Level System
- [x] Each agent gets XP from completed tasks (score * 100)
- [x] Levels: Genin (0), Chunin (500), Jonin (2000), Kage (5000), Hokage (10000)
- [x] Visual XP progress bar on agent cards
- [x] Level badge next to agent name (color-coded per tier)

## Phase 3 — Enhanced Results Page (DONE)

### 3.1 Per-Agent Filtering
- [x] Add agent filter tabs to Results page header
- [x] Show all agents, not just coder
- [x] Stats cards update based on filter selection

### 3.2 Score Ratchet Visualization
- [x] SVG line chart with score trend + dashed ratchet floor line
- [x] Color-coded dots (green=8+, accent=6+, amber=4+, red=low)
- [x] Legend for score line vs ratchet floor

### 3.3 Task Type Breakdown
- [x] Horizontal bar chart showing average score per task type
- [x] Sorted by avg score, color-coded bars, count indicator

## Phase 4 — Achievement System (DONE)

### 4.1 Achievement Definitions
- [x] Create achievement registry with 10 unlock conditions:
  - "First Blood" — first completed task
  - "Perfect Score" — score 10.0
  - "Hat Trick" — 3 keeps in a row
  - "On Fire" — 5 keeps in a row
  - "Untouchable" — 10 keeps in a row
  - "Night Owl" — task completed after midnight
  - "Renaissance" — 4+ distinct task types completed
  - "Comeback Kid" — keep after a discard
  - "Consistency" — 5 cycles with score > 7
  - "Centurion" — 100 cycles completed

### 4.2 Achievement UI
- [x] Achievement wall on Dashboard with unlocked count
- [x] Theme-colored badges for unlocked achievements
- [x] Dimmed badges for locked achievements with hover descriptions

## Phase 5 — Session Timeline/Waterfall (DONE)

### 5.1 Timeline Component
- [x] Horizontal bar chart showing cycle stages (5 recent cycles)
- [x] Planner → Researcher → Coder → QA as sequential bars
- [x] Color-coded by role with legend, width proportional to duration
- [x] Shown on Activity page between current cycle and log/artifacts
- [x] Total duration labels, hover tooltips with agent name + duration

## Phase 6 — Agent Interaction Map (DONE)

### 6.1 Force-Directed Graph
- [x] Agents as nodes, delegations as edges
- [x] Animated message flow along edges (Canvas particles)
- [x] Canvas-based with force simulation (no external deps)
- [x] New /interactions page with stats, legend, delegation details table
- [x] Server endpoint /api/interactions parses results.tsv for delegation flow
- [x] Demo mode with 5 simulated agents

## Phase 7 — Agent Memory Browser (DONE)

### 7.1 Knowledge Base Viewer
- [x] New API endpoint: `/api/knowledge` — list/search artifacts with filtering
- [x] `/api/knowledge/stats` — aggregate counts by type and agent
- [x] `/api/knowledge/artifact/:name` — full content viewer
- [x] Searchable artifact list with previews and type filter tabs
- [x] Click-to-expand artifact detail viewer (raw content)
- [x] New /knowledge page with stats row, search, 2-column grid
- [x] Demo mode with 30 simulated artifacts

## Phase 8 — Notification Center (DONE)

### 8.1 In-Dashboard Notifications
- [x] Notification bell in sidebar with unread count badge
- [x] History of events (errors, high scores, timeouts, cycle completions)
- [x] Server scans results.tsv and orchestrator log for events
- [x] localStorage persistence for last-seen timestamp

## Execution Order
1. Phase 1 (themed styling) — foundation for everything else
2. Phase 2 (power levels) — quick wow factor
3. Phase 3 (results enhancements) — practical value
4. Phase 4 (achievements) — engagement
5. Phase 5 (timeline) — debugging value
6. Phase 6+ — if time permits
