# Script Wars ⚔️

A tournament website where players write Lua scripts that battle each other. Create a bot, enter it into the arena, and watch it fight!

## Quick Start

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run db:generate` | Generate DB migrations |
| `npm run db:migrate` | Apply DB migrations |
| `npm run db:studio` | Drizzle Studio (DB browser) |
| `npm run audit:security` | Security audit |
| `npm run audit:quality` | Code quality audit |

## Tech Stack

- **Framework:** SvelteKit (TypeScript)
- **Editor:** CodeMirror 6
- **Script Engine:** Luau (sandboxed Lua)
- **Database:** SQLite (Drizzle ORM)
- **Auth:** Better Auth
