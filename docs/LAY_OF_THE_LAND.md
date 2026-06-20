# Script Wars — Lay of the Land

A complete guide for newcomers to understand how the project is structured, how data flows, and where to find things.

---

## What Is This?

Script Wars is a tournament platform where players write **Lua scripts** that battle each other automatically. You write a bot, enter it into the arena, and it fights other players' bots in scheduled tournaments. Think of it like a programming puzzle meets competitive gaming.

Currently live at: **https://script-wars.benslaughter.com**

---

## The Big Picture

```
┌────────────────────────────────────────────────────────────────────┐
│                         BROWSER                                     │
│  Svelte pages + CodeMirror editor + Turnstile CAPTCHA              │
└────────────────┬───────────────────────────────────────────────────┘
                 │ HTTPS
┌────────────────▼───────────────────────────────────────────────────┐
│  nginx (SSL termination, reverse proxy → localhost:3004)            │
└────────────────┬───────────────────────────────────────────────────┘
                 │ HTTP
┌────────────────▼───────────────────────────────────────────────────┐
│  Docker Container (Node.js + SvelteKit adapter-node, port 3000)    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  hooks.server.ts                                             │   │
│  │  ┌──────────┐  ┌─────────────┐  ┌───────────────────────┐  │   │
│  │  │   Auth   │  │ Rate Limiter│  │ Tournament Scheduler  │  │   │
│  │  └──────────┘  └─────────────┘  └───────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Routes (Pages + API)                                        │   │
│  │  /games, /scripts, /leaderboard, /api/match, etc.           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐    │
│  │  Game Plugins     │  │  Match Engine                        │    │
│  │  • RPS            │  │  • Lua Sandbox (wasmoon/WASM)       │    │
│  │  • Prisoner's D.  │  │  • Match Runner (N rounds)          │    │
│  │  • (add more!)    │  │  • Tournament Runner (round-robin)  │    │
│  └──────────────────┘  └─────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SQLite Database (Drizzle ORM)                               │   │
│  │  /app/data/script-wars.db (Docker volume)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Directory Map

```
script-wars/
│
├── src/
│   ├── hooks.server.ts          ← THE ENTRY POINT for every request
│   │                              (auth, rate-limiting, scheduler boot)
│   │
│   ├── lib/
│   │   ├── server/              ← All backend logic lives here
│   │   │   ├── games/           ← 🎮 GAME PLUGINS (the fun part)
│   │   │   │   ├── types.ts    ←   GamePlugin interface definition
│   │   │   │   ├── index.ts    ←   Game registry (add new games here)
│   │   │   │   ├── rps.ts      ←   Rock Paper Scissors
│   │   │   │   └── prisoners-dilemma.ts  ← Prisoner's Dilemma
│   │   │   │
│   │   │   ├── engine/          ← ⚙️ MATCH ENGINE
│   │   │   │   ├── sandbox.ts  ←   Lua VM (wasmoon) with safety limits
│   │   │   │   ├── match-runner.ts ← Runs N rounds between 2 scripts
│   │   │   │   └── index.ts    ←   Re-exports
│   │   │   │
│   │   │   ├── schema.ts       ← 📊 Database tables (Drizzle schema)
│   │   │   ├── db.ts           ← Database connection setup
│   │   │   ├── auth.ts         ← 🔐 Better Auth config
│   │   │   ├── tournament.ts   ← 🏆 Round-robin tournament logic
│   │   │   ├── scheduler.ts    ← ⏰ Cron-like hourly scheduler
│   │   │   └── rate-limit.ts   ← 🛡️ In-memory rate limiter
│   │   │
│   │   ├── auth-client.ts      ← Client-side auth helpers
│   │   ├── validation.ts       ← Shared validation (script names, etc.)
│   │   └── components/
│   │       └── CodeEditor.svelte ← CodeMirror 6 Lua editor component
│   │
│   └── routes/                  ← 🌐 PAGES & API
│       ├── +layout.svelte       ← App shell (nav, footer)
│       ├── +page.svelte         ← Homepage
│       │
│       ├── games/
│       │   ├── +page.svelte     ← Games list (all available games)
│       │   └── [gameId]/        ← Per-game pages (dynamic route)
│       │       ├── docs/        ←   Game rules & strategy tips
│       │       ├── friendly/    ←   Play a friendly match vs NPC
│       │       ├── leaderboard/ ←   Game-specific rankings
│       │       └── scripts/     ←   Your scripts for this game
│       │           ├── new/     ←     Create a new script
│       │           ├── [id]/edit/ ←   Edit existing script
│       │           └── stats/   ←     Script performance stats
│       │
│       ├── scripts/             ← Scripts hub (all games)
│       ├── leaderboard/         ← Global leaderboard (game picker)
│       ├── login/               ← Login page
│       ├── register/            ← Signup page
│       ├── player/[id]/         ← Public player profile
│       ├── docs/                ← General docs/how-to-play
│       │
│       └── api/                 ← 🔌 REST API
│           ├── match/           ←   Manual match trigger (admin)
│           ├── tournament/      ←   Manual tournament trigger (admin)
│           └── games/[gameId]/
│               ├── scripts/     ←   CRUD scripts
│               ├── scripts/activate/ ← Set active tournament entry
│               ├── scripts/test/ ←   Test a script (run it once)
│               └── friendly-match/ ← Fight an NPC
│
├── drizzle/                     ← SQL migration files
│   ├── 0000_reflective_apocalypse.sql
│   ├── 0001_add_game_id.sql
│   ├── 0002_add_match_type.sql
│   ├── 0003_add_match_scores.sql
│   └── 0004_add_indexes.sql
│
├── scripts/                     ← CLI utilities
│   ├── migrate.mjs             ← Run migrations (used by Docker)
│   ├── seed-npcs.ts            ← Create NPC bot accounts
│   ├── audit-security.sh       ← Security checklist
│   └── audit-quality.sh        ← Code quality checklist
│
├── tests/                       ← Vitest test suite
│
├── .github/workflows/
│   ├── ci.yml                  ← Test + type-check on PR
│   └── publish.yml             ← Build + push Docker image on merge
│
├── Dockerfile                   ← Multi-stage production build
├── docker-entrypoint.sh         ← Startup: migrate → seed → serve
├── docker-compose.yml           ← Production container config
├── deploy.sh                    ← Pull + restart on server
├── nginx-script-wars.conf       ← nginx reverse proxy config
│
├── .env.example                 ← Environment variable template
├── svelte.config.js             ← SvelteKit config (adapter-node)
├── vite.config.ts               ← Vite config
├── drizzle.config.ts            ← Drizzle ORM config
└── package.json                 ← Scripts & dependencies
```

---

## How a Request Flows

Every single request hits `src/hooks.server.ts` first. Here's what happens:

```
Request arrives
     │
     ▼
┌─ hooks.server.ts ─────────────────────────────────┐
│  1. Start tournament scheduler (once, first req)   │
│  2. Auth: resolve session from cookie              │
│  3. Rate limit check                               │
│  4. Turnstile verification (for write endpoints)   │
│  5. Forward to matching route handler              │
└────────────────────────────────────────────────────┘
     │
     ▼
Route handler (page or API)
     │
     ▼
Response back to browser
```

---

## How a Match Works

This is the core game loop — what happens when two scripts fight:

```
┌─────────────────────────────────────────────────────┐
│  match-runner.ts: runMatch(codeA, codeB, 100, game) │
├─────────────────────────────────────────────────────┤
│                                                      │
│  for round = 1 to 100:                              │
│    │                                                 │
│    ├─ game.buildContext(round, histories)            │
│    │   → Creates Lua globals for this round         │
│    │                                                 │
│    ├─ sandbox.executeLuaScript(codeA, contextA)     │
│    ├─ sandbox.executeLuaScript(codeB, contextB)     │
│    │   → Each runs in isolated Lua VM               │
│    │   → 100K instruction limit, 1MB memory         │
│    │   → Returns a move string or error             │
│    │                                                 │
│    ├─ game.isValidMove(move) — validate outputs     │
│    ├─ game.resolveRound(moveA, moveB) — who won?    │
│    └─ game.getPoints(moveA, moveB) — score update   │
│                                                      │
│  After 100 rounds:                                   │
│    pointBased? highest total score wins              │
│    roundBased? most rounds won wins                  │
│                                                      │
│  Return: { winner, scoreA, scoreB, winsA, ... }     │
└─────────────────────────────────────────────────────┘
```

### What Scripts See (Lua Context)

Every round, each script gets these variables injected:

| Variable | Type | Description |
|----------|------|-------------|
| `round_number` | number | Current round (1-based) |
| `my_history` | table | Your previous moves (strings) |
| `opponent_history` | table | Their previous moves (strings) |

Games can add extra context via `buildContext()`.

### The Sandbox

Scripts run in a **Lua 5.4 VM** (wasmoon, compiled to WASM). Safety measures:
- ⏱️ **100,000 instructions max** — prevents infinite loops
- 💾 **1MB memory max** — prevents memory bombs
- 🚫 **Dangerous globals removed** — no `io`, `os`, `require`, `dofile`, `loadfile`, `debug` (except sethook)
- 🎲 **RNG re-seeded each execution** — deterministic within a run but unpredictable across runs

---

## How Tournaments Work

```
Every hour (triggered by scheduler.ts):
     │
     ▼
For each registered game:
     │
     ├─ Find all active scripts for this game
     │   (scripts where isActiveEntry = true)
     │
     ├─ If < 2 scripts → skip
     │
     ├─ Create tournament record (status: running)
     │
     ├─ Round-robin: every script vs every other script
     │   │
     │   └─ runMatch() for each pair
     │       └─ Save match result to DB
     │
     └─ Mark tournament complete
```

Players can have **one active script per game**. That script auto-enters all future tournaments.

---

## Database Schema

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  users   │──────<│  scripts │──────<│   matches    │
│          │  1:N  │          │  N:M  │              │
│ id       │       │ id       │       │ id           │
│ name     │       │ userId   │       │ gameId       │
│ email    │       │ gameId   │       │ scriptAId    │
│ verified │       │ name     │       │ scriptBId    │
└──────────┘       │ code     │       │ winnerId     │
                   │ isActive │       │ scoreA/B     │
                   └──────────┘       │ matchType    │
                                      │ tournamentId │
                                      └──────┬───────┘
                                             │ N:1
                                      ┌──────▼───────┐
                                      │ tournaments  │
                                      │ id           │
                                      │ gameId       │
                                      │ status       │
                                      └──────────────┘
```

Plus Better Auth managed tables: `sessions`, `accounts`, `verifications`.

---

## The Game Plugin System

This is the heart of extensibility. Each game is a single file implementing `GamePlugin`:

```
src/lib/server/games/
├── types.ts              ← Interface definition
├── index.ts              ← Registry (Map<id, GamePlugin>)
├── rps.ts                ← Rock Paper Scissors
└── prisoners-dilemma.ts  ← Prisoner's Dilemma
```

**Everything else is game-agnostic.** The match runner, tournament system, API routes, and UI pages all work with any game through the `GamePlugin` interface. To add a new game, you only touch this directory.

Key design decisions:
- Games define their own NPCs, docs, scoring, and validation
- The `pointBased` flag switches between "most rounds won" and "highest score" win conditions
- `buildContext()` controls what Lua variables scripts can access
- `getEditorDocs()` powers the sidebar in the code editor

See [Creating a Game Plugin](./CREATING_A_GAME.md) for the full walkthrough.

---

## CI/CD Pipeline

```
Developer pushes to main
         │
         ├─► ci.yml: npm test + svelte-check (must pass)
         │
         └─► publish.yml: Build Docker → Push to GHCR
                                              │
                                              ▼
                          ghcr.io/benslaughter/script-wars:latest
```

On the server, `./deploy.sh` pulls the latest image and restarts.

---

## Key Technologies

| What | Why |
|------|-----|
| **SvelteKit** | Full-stack framework, SSR + API routes in one |
| **adapter-node** | Runs as a standalone Node.js server in Docker |
| **wasmoon** | Lua 5.4 compiled to WASM — safe sandboxed execution |
| **Drizzle ORM** | Type-safe SQL, lightweight, great DX |
| **SQLite** | Single-file DB, zero config, fast for this scale |
| **Better Auth** | Modern auth library (sessions, email verify, CAPTCHA) |
| **CodeMirror 6** | Best-in-class code editor component |
| **Resend** | Transactional email (verification links) |
| **Cloudflare Turnstile** | Bot protection on signup/login |
| **Docker + GHCR** | Reproducible builds and deployment |
| **nginx + certbot** | Reverse proxy with auto-renewing SSL |

---

## Common Patterns

### Adding a page that needs auth
```typescript
// +page.server.ts
export const load = async ({ locals }) => {
  if (!locals.user) redirect(302, '/login');
  // ... load data
};
```

### Adding an API endpoint
```typescript
// src/routes/api/something/+server.ts
export async function POST({ request, locals }) {
  if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
  // ... handle request
}
```

### Running a match programmatically
```typescript
import { runMatch } from '$lib/server/engine/match-runner.js';
import { getGame } from '$lib/server/games/index.js';

const game = getGame('rps');
const result = await runMatch(scriptA.code, scriptB.code, game.maxRounds, game);
// result.winner === 'a' | 'b' | 'draw'
```

---

## Quick Reference: What's Where

| I want to... | Look at... |
|---|---|
| Add a new game | `src/lib/server/games/` → [guide](./CREATING_A_GAME.md) |
| Change match logic | `src/lib/server/engine/match-runner.ts` |
| Modify the Lua sandbox | `src/lib/server/engine/sandbox.ts` |
| Add a new page | `src/routes/your-page/+page.svelte` |
| Add an API endpoint | `src/routes/api/your-endpoint/+server.ts` |
| Change the DB schema | `src/lib/server/schema.ts` → run `npm run db:generate` |
| Update auth config | `src/lib/server/auth.ts` |
| Change tournament schedule | `src/lib/server/scheduler.ts` |
| Add rate limiting | `src/lib/server/rate-limit.ts` + `hooks.server.ts` |
| Run the site locally | `npm install && npm run dev` |
| Deploy | Push to main (auto-builds) → `./deploy.sh` on server |
