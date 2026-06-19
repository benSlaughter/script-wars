#!/bin/bash
set -e

echo "⚔️  Script Wars — Deployment"
echo "=============================="

# Check we're in the deploy directory
if [ ! -f docker-compose.yml ]; then
    echo "❌ Run this script from the deploy/ directory"
    exit 1
fi

# Check .env exists
if [ ! -f .env ]; then
    echo "❌ Missing .env file. Copy .env.example and fill in your values:"
    echo "   cp .env.example .env && nano .env"
    exit 1
fi

# Login to GHCR (uses gh CLI or docker login)
echo "📦 Pulling latest image..."
docker pull ghcr.io/benslaughter/script-wars:latest

# Stop any existing container (from manual docker run or previous deploy)
echo "🛑 Stopping existing container..."
docker stop script-wars 2>/dev/null || true
docker rm script-wars 2>/dev/null || true

# Start the container
echo "🚀 Starting container..."
docker compose up -d

# Show status
echo ""
echo "✅ Script Wars is running!"
echo "   Container: $(docker ps --filter name=script-wars --format '{{.Status}}')"
echo "   URL: http://127.0.0.1:3004"
echo ""
echo "Next steps:"
echo "  1. Copy nginx config:  sudo cp nginx-script-wars.conf /etc/nginx/sites-available/script-wars"
echo "  2. Enable site:        sudo ln -sf /etc/nginx/sites-available/script-wars /etc/nginx/sites-enabled/"
echo "  3. Test nginx:         sudo nginx -t"
echo "  4. Reload nginx:       sudo systemctl reload nginx"
echo "  5. SSL (certbot):      sudo certbot --nginx -d script-wars.benslaughter.com"
