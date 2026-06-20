# Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────┐
│                    SvelteKit App                      │
├──────────────┬──────────────────┬───────────────────┤
│   Pages      │   API Routes     │   Hooks           │
│  (Svelte)    │  (/api/*)        │  (auth, rate-limit│
│              │                  │   cron scheduler) │
├──────────────┴──────────────────┴───────────────────┤
│                  Server Library                       │
├───────────┬────────────┬────────────┬───────────────┤
│  Games    │  Engine    │  Auth      │  Tournament   │
│  (plugins)│  (sandbox) │  (Better   │  (scheduler)  │
│           │  (runner)  │   Auth)    │               │
├───────────┴────────────┴────────────┴───────────────┤
│              SQLite (Drizzle ORM)                     │
└─────────────────────────────────────────────────────┘
```

## Key Components

### Game Plugin System (`src/lib/server/games/`)

Games are self-contained plugins implementing the `GamePlugin` interface. The platform is fully game-agnostic — adding a new game requires zero changes to the match engine, API, UI, or tournament system.

See [Creating a Game Plugin](./CREATING_A_GAME.md).

### Match Engine (`src/lib/server/engine/`)

- **`sandbox.ts`** — Lua VM (wasmoon/WASM) with instruction limits, memory limits, and stripped globals
- **`match-runner.ts`** — Orchestrates a full match: runs both scripts for N rounds, collects results

The engine accepts a `GameFunctions` interface (subset of `GamePlugin`), making it easy to test in isolation.

### Tournament System (`src/lib/server/tournament.ts`)

Runs round-robin tournaments per game. Triggered on a schedule (every 10 minutes) via the cron hook in `hooks.server.ts`. Each active script plays against every other active script in its game.

### Authentication (`src/lib/server/auth.ts`)

Better Auth with:
- Email + password signup
- Email verification via Resend
- Cloudflare Turnstile CAPTCHA on signup/login
- Session cookies

### Database (`src/lib/server/schema.ts`)

SQLite with Drizzle ORM. Key tables:
- `user`, `session`, `account` — Better Auth managed
- `script` — User scripts (Lua code, game ID, active flag)
- `match` — Match results with round details
- `tournament`, `tournament_match` — Tournament tracking

### Rate Limiting (`src/lib/server/rate-limit.ts`)

In-memory sliding window rate limiter. Applied per-route in `hooks.server.ts`.

## Request Flow

```
Browser → nginx (SSL) → Docker container (port 3000)
                              │
                         hooks.server.ts
                              │
                    ┌─────────┼─────────┐
                    │         │         │
               Auth check  Rate limit  Route
                    │         │         │
                    └─────────┼─────────┘
                              │
                    Page or API handler
```

## Deployment

```
GitHub Push → GitHub Actions (CI + publish.yml)
                    │
              Build Docker image
                    │
              Push to GHCR
                    │
         Server: ./deploy.sh
                    │
         docker pull + docker compose up
                    │
         nginx reverse proxy (SSL via certbot)
```

## Data Flow: A Match

1. User clicks "Fight" or tournament triggers
2. API loads both scripts from DB
3. `runMatch(codeA, codeB, rounds, gameFns)` called
4. For each round:
   - `buildContext()` creates Lua globals
   - `executeLuaScript()` runs each script in sandboxed VM
   - `isValidMove()` validates output
   - `resolveRound()` + `getPoints()` determine result
5. Match result saved to DB
6. Leaderboard/stats updated

## File Conventions

- Server-only code lives in `src/lib/server/`
- Game plugins are self-contained single files
- API routes follow REST conventions under `src/routes/api/`
- Database migrations are SQL files in `drizzle/`
- NPC emails use `@script-wars.local` domain
