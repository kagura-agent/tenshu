# Contributing to Tenshu

Thanks for your interest in contributing to Tenshu! This guide will help you get set up and submit your first pull request.

## Prerequisites

- **Node.js 22+** (required)
- **npm** (comes with Node.js)
- **Docker** (optional — for containerized development via `docker-compose`)

## Project Structure

Tenshu is a TypeScript monorepo using npm workspaces:

```
tenshu/
├── client/    → @tenshu/client  — Vite + React dashboard UI
├── server/    → @tenshu/server  — Hono WebSocket API server
├── shared/    → @tenshu/shared  — Shared types, constants, and utilities
├── package.json               — Root workspace config
└── docker-compose.yml         — Docker setup
```

- **`shared/`** — Contains TypeScript types and constants used by both client and server. Changes here affect both packages.
- **`server/`** — Hono-based HTTP + WebSocket server that watches the filesystem and pushes real-time updates to the dashboard.
- **`client/`** — React SPA built with Vite, TanStack Query, and Tailwind CSS. Connects to the server via WebSocket.

## Getting Started

```bash
# Clone the repo
git clone https://github.com/JesseRWeigel/tenshu.git
cd tenshu

# Install all dependencies (workspaces are linked automatically)
npm install

# (Optional) Configure environment variables
cp .env.example .env
# Edit .env to match your setup — see .env.example for available variables

# Start both client and server in dev mode
npm run dev
```

### Other Commands

| Command                  | Description                        |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Start client + server concurrently |
| `npm run build`          | Build server then client           |
| `npm test`               | Run vitest across all workspaces   |
| `npm run format`         | Format all files with Prettier     |
| `npm run format:check`   | Check formatting (used in CI)      |
| `npm run lint -w client` | Lint the client workspace          |

### Docker

```bash
docker-compose up
```

## Making Changes

### 1. Create a Branch

Use the following naming convention:

- `feat/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `test/description` — Test additions or changes
- `refactor/description` — Code refactoring

### 2. Write Your Code

- Follow existing code style and patterns
- Add or update tests for any changed behavior
- Make sure `npm run build` and `npm test` pass before submitting

### 3. Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add agent status filter to dashboard
fix: prevent WebSocket reconnect loop on auth failure
docs: update setup instructions for Docker
test: add unit tests for shared message types
refactor: extract WebSocket handler into separate module
```

### 4. Submit a Pull Request

- Open a PR against `master`
- Fill in the PR template with a summary and test plan
- All CI checks must pass
- **@JesseRWeigel** is the sole reviewer — please be patient for review

## Development Tips

- The `shared` package is consumed directly via TypeScript path references (no build step needed for dev)
- The server uses `tsx watch` for hot-reload during development
- The client uses Vite's HMR

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Questions?

Open an issue or start a discussion — happy to help!
