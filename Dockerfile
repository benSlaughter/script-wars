# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build deps for native addons (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN BUILDING=true npm run build

# Bundle seed script so we don't need tsx in production
RUN npx tsx --compile scripts/seed-npcs.ts 2>/dev/null || \
    npx esbuild scripts/seed-npcs.ts --bundle --platform=node --outfile=scripts/seed-npcs.mjs --format=esm --external:better-sqlite3

RUN npm prune --production

# Stage 2: Production
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/seed-npcs.mjs ./scripts/seed-npcs.mjs
COPY --from=builder /app/scripts/migrate.mjs ./scripts/migrate.mjs

# Create data directory for SQLite
RUN mkdir -p /app/data

# Fix adapter-node static asset path: the server chunk expects client/
# and prerendered/ next to itself, but Rollup nests it in server/chunks/
RUN ln -s /app/build/client /app/build/server/chunks/client \
 && ln -s /app/build/prerendered /app/build/server/chunks/prerendered 2>/dev/null || true

# Volume for persistent SQLite database
VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DATABASE_URL=/app/data/script-wars.db
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
