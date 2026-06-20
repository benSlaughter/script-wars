# Script Wars ⚔️

A tournament website where players write Lua scripts that battle each other. Create a bot, enter it into the arena, and watch it fight!

**Live at:** https://script-wars.benslaughter.com

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run seed:npcs
npm run dev
```

Open http://localhost:5173 — you're ready to play!

## Documentation

| Doc | Description |
|-----|-------------|
| [Lay of the Land](./docs/LAY_OF_THE_LAND.md) | Full project overview — start here |
| [Contributing](./docs/CONTRIBUTING.md) | Setup, workflow, and tech stack |
| [Creating a Game](./docs/CREATING_A_GAME.md) | Add a new game in one file |
| [Architecture](./docs/ARCHITECTURE.md) | System design and components |

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run check` | TypeScript type-check |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:migrate` | Apply DB migrations |
| `npm run db:studio` | Drizzle Studio (DB browser) |
| `npm run seed:npcs` | Seed NPC bot accounts |

## Tech Stack

- **Framework:** SvelteKit (TypeScript)
- **Editor:** CodeMirror 6
- **Script Engine:** Lua 5.4 (wasmoon, sandboxed WASM)
- **Database:** SQLite (Drizzle ORM)
- **Auth:** Better Auth + Cloudflare Turnstile
- **Deployment:** Docker → GHCR → nginx + certbot
