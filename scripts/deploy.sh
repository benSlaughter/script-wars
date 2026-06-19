#!/usr/bin/env bash
set -euo pipefail

# Script Wars — Deploy/Update Script
# Usage: ./scripts/deploy.sh [image_tag]
#
# This script:
# 1. Pulls the latest image (or builds locally)
# 2. Stops the old container gracefully
# 3. Starts the new container with the same persistent volume
#
# The SQLite database lives in a Docker named volume (script-wars-data)
# and persists across container restarts and image updates.

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONTAINER_NAME="script-wars"
VOLUME_NAME="script-wars-data"
IMAGE_NAME="${SCRIPT_WARS_IMAGE:-script-wars:latest}"
PORT="${SCRIPT_WARS_PORT:-3000}"

echo -e "${YELLOW}⚔️  Script Wars — Deploy${NC}"
echo ""

# Check for required env
if [ -z "${BETTER_AUTH_SECRET:-}" ]; then
    if [ -f .env ]; then
        echo -e "  ${GREEN}✓${NC} Loading .env file"
        export $(grep -v '^#' .env | xargs)
    fi
fi

if [ -z "${BETTER_AUTH_SECRET:-}" ]; then
    echo -e "  ${RED}✗${NC} BETTER_AUTH_SECRET not set!"
    echo "    Set it in .env or export it before running this script."
    echo "    Generate one with: openssl rand -base64 32"
    exit 1
fi

# Step 1: Build or pull image
echo -e "\n${YELLOW}[1/4] Building image...${NC}"
if [ "${1:-build}" = "pull" ]; then
    docker pull "$IMAGE_NAME"
else
    docker build -t "$IMAGE_NAME" .
fi
echo -e "  ${GREEN}✓${NC} Image ready: $IMAGE_NAME"

# Step 2: Stop old container (graceful)
echo -e "\n${YELLOW}[2/4] Stopping old container...${NC}"
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    echo -e "  ${GREEN}✓${NC} Old container stopped"
else
    echo -e "  ⏭️  No running container found"
fi

# Step 3: Ensure volume exists
echo -e "\n${YELLOW}[3/4] Checking data volume...${NC}"
if docker volume inspect "$VOLUME_NAME" &>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Volume '$VOLUME_NAME' exists (data preserved)"
else
    docker volume create "$VOLUME_NAME"
    echo -e "  ${GREEN}✓${NC} Volume '$VOLUME_NAME' created (fresh database)"
fi

# Step 4: Start new container
echo -e "\n${YELLOW}[4/4] Starting new container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "${PORT}:3000" \
    -v "${VOLUME_NAME}:/app/data" \
    -e "NODE_ENV=production" \
    -e "BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}" \
    -e "BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:${PORT}}" \
    -e "DATABASE_URL=/app/data/script-wars.db" \
    -e "PORT=3000" \
    -e "HOST=0.0.0.0" \
    "$IMAGE_NAME"

echo -e "  ${GREEN}✓${NC} Container started"

# Wait for it to be healthy
echo -e "\n${YELLOW}Waiting for server...${NC}"
for i in $(seq 1 15); do
    if curl -sf "http://localhost:${PORT}" > /dev/null 2>&1; then
        echo -e "\n${GREEN}✅ Script Wars is live at http://localhost:${PORT}${NC}"
        echo ""
        echo "Useful commands:"
        echo "  docker logs -f $CONTAINER_NAME    # View logs"
        echo "  docker stop $CONTAINER_NAME       # Stop server"
        echo "  docker volume inspect $VOLUME_NAME # Check data volume"
        exit 0
    fi
    sleep 1
    printf "."
done

echo -e "\n${RED}⚠️  Server didn't respond within 15s — check logs:${NC}"
echo "  docker logs $CONTAINER_NAME"
exit 1
