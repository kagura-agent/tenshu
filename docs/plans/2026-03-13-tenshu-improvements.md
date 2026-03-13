# Tenshu Improvements Plan — 2026-03-13

## Status: IN PROGRESS — Phase 1 COMPLETE

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

## Phase 4 — Achievement System (Medium Effort, High Wow)

### 4.1 Achievement Definitions
- [ ] Create achievement registry with unlock conditions:
  - "First Blood" — first completed task
  - "Perfect Score" — score 10.0
  - "Hat Trick" — 3 keeps in a row
  - "On Fire" — 5 keeps in a row
  - "Untouchable" — 10 keeps in a row
  - "Speed Demon" — cycle under 2 minutes
  - "Night Owl" — task completed after midnight
  - "Renaissance" — every task type completed at least once
  - "Comeback Kid" — keep after a discard
  - "Consistency" — 5 cycles with score > 7

### 4.2 Achievement UI
- [ ] Toast notification with theme sound on unlock
- [ ] Achievement badges on agent cards
- [ ] Achievement wall section on Dashboard or separate page

## Phase 5 — Session Timeline/Waterfall (Medium Effort, High Impact)

### 5.1 Timeline Component
- [ ] Horizontal bar chart showing cycle stages
- [ ] Planner → Researcher → Coder → QA as sequential bars
- [ ] Color-coded by agent, width = duration
- [ ] Show on Activity page

## Phase 6 — Agent Interaction Map (Medium-High Effort)

### 6.1 Force-Directed Graph
- [ ] Agents as nodes, delegations as edges
- [ ] Animated message flow along edges
- [ ] Canvas or SVG based
- [ ] Show on new page or within Command view

## Phase 7 — Agent Memory Browser (Medium Effort)

### 7.1 Knowledge Base Viewer
- [ ] New API endpoint: `/api/knowledge` — list artifacts
- [ ] Searchable artifact list with previews
- [ ] Markdown rendering
- [ ] New page or section within Activity

## Phase 8 — Notification Center (Low Effort)

### 8.1 In-Dashboard Notifications
- [ ] Notification bell in sidebar with unread count
- [ ] History of events (errors, high scores, cycle completions)
- [ ] Configurable thresholds

## Execution Order
1. Phase 1 (themed styling) — foundation for everything else
2. Phase 2 (power levels) — quick wow factor
3. Phase 3 (results enhancements) — practical value
4. Phase 4 (achievements) — engagement
5. Phase 5 (timeline) — debugging value
6. Phase 6+ — if time permits
