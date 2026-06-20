# Contributing to Script Wars

Thanks for wanting to help! This guide covers everything you need to get started.

## Prerequisites

- **Node.js** 22+
- **npm** 10+
- Git

## Getting Started

```bash
# Clone the repo
git clone https://github.com/benSlaughter/script-wars.git
cd script-wars

# Install dependencies
npm install

# Set up environment (test Turnstile keys work out of the box)
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed NPC bots (optional but recommended)
npm run seed:npcs

# Start the dev server
npm run dev
```

The site will be running at `http://localhost:5173`.

## Project Structure

```
script-wars/
├── src/
│   ├── lib/server/
│   │   ├── games/           # Game plugins (RPS, Prisoner's Dilemma, etc.)
│   │   ├── engine/          # Match runner + Lua sandbox
│   │   ├── schema.ts        # Database schema (Drizzle ORM)
│   │   ├── db.ts            # Database connection
│   │   ├── auth.ts          # Authentication (Better Auth)
│   │   ├── tournament.ts    # Tournament runner
│   │   └── rate-limit.ts    # Rate limiting
│   ├── routes/              # SvelteKit pages and API routes
│   └── hooks.server.ts      # Request hooks (auth, rate limits, cron)
├── drizzle/                 # SQL migration files
├── scripts/                 # CLI scripts (migrate, seed, audit)
├── tests/                   # Vitest test suite
├── docker-compose.yml       # Production Docker config
├── Dockerfile               # Multi-stage Docker build
└── deploy.sh                # Deployment script
```

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint check |
| `npm run format` | Auto-format with Prettier |
| `npm run check` | TypeScript type checking |
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |
| `npm run seed:npcs` | Seed NPC bot accounts |

## Development Workflow

1. Create a branch for your feature
2. Make your changes
3. Run `npm test` and `npm run check` to verify
4. Submit a PR to `main`

CI will automatically run tests and type-checking.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | SvelteKit (TypeScript) |
| Code Editor | CodeMirror 6 |
| Script Engine | Luau via wasmoon (sandboxed Lua 5.4) |
| Database | SQLite with Drizzle ORM |
| Auth | Better Auth (email + magic link) |
| Email | Resend |
| CAPTCHA | Cloudflare Turnstile |
| Deployment | Docker → GHCR → Azure VPS + nginx |

## How the Match Engine Works

1. Two Lua scripts face off over **100 rounds**
2. Each round, both scripts execute in a sandboxed Lua VM (wasmoon)
3. Scripts receive context: `round_number`, `my_history`, `opponent_history`
4. Scripts return a move (game-specific, e.g. `"rock"` or `"share"`)
5. Invalid moves or errors = forfeit that round
6. After all rounds, the winner is determined by game rules

The sandbox enforces:
- **100,000 instruction limit** (prevents infinite loops)
- **1MB memory limit**
- **No dangerous globals** (io, os, require, etc. are removed)

## Tournaments

Tournaments run automatically on a schedule (every 10 minutes). Each game runs a separate tournament where every active script plays against every other active script in that game. Results update the leaderboard.

## Adding a New Game

See [Creating a Game Plugin](./CREATING_A_GAME.md) — it's designed to be super simple.

## Deployment

The app is deployed as a Docker container behind nginx with SSL:

```bash
# On the server
./deploy.sh
```

This pulls the latest image from GHCR and restarts the container.

## Environment Variables

See `.env.example` for all available options. For local dev, the defaults (including Cloudflare test keys) work out of the box.

## Questions?

Open an issue or check the existing ones for context.
