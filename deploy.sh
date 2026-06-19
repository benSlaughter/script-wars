#!/bin/bash
set -e

echo "⚔️  Script Wars — Deploy"
echo "========================"

# Check we're in the project root
if [ ! -f docker-compose.yml ]; then
    echo "❌ Run this script from the project root (where docker-compose.yml is)"
    exit 1
fi

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ Missing .env file. Copy .env.example and fill in your values:"
    echo "   cp .env.example .env && nano .env"
    exit 1
fi

# Pull latest image
echo "📦 Pulling latest image..."
docker pull ghcr.io/benslaughter/script-wars:latest

# Stop any existing container
echo "🛑 Stopping existing container..."
docker stop script-wars 2>/dev/null || true
docker rm script-wars 2>/dev/null || true

# Start the container
echo "🚀 Starting container..."
docker compose up -d

echo ""
echo "✅ Script Wars is running!"
echo "   Status: $(docker ps --filter name=script-wars --format '{{.Status}}')"
echo "   Local:  http://127.0.0.1:3004"
