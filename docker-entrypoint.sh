#!/bin/sh
set -e

echo "⚔️  Script Wars — starting up..."

# Run database migrations
echo "📦 Running database migrations..."
node scripts/migrate.mjs 2>&1 || echo "⚠️  Migration failed (may already be up to date)"

# Seed NPCs (idempotent — skips if already exist)
echo "🤖 Seeding NPC bots..."
node scripts/seed-npcs.mjs 2>&1 || echo "⚠️  NPC seeding skipped"

# Start the app
echo "🚀 Starting server on port ${PORT:-3000}..."
exec node build/index.js
