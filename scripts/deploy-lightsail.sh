#!/usr/bin/env bash
set -Eeuo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

COMPOSE=(
  sudo docker compose
  --env-file .env.production
  -f compose.backend.yaml
)

echo "=== 1. Checking deployment ==="

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production"
  exit 1
fi

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Tracked files contain uncommitted changes."
  echo "Commit or restore them before deploying."
  exit 1
fi

echo "=== 2. Updating from GitHub ==="

git pull --ff-only origin sprint-three

# Read deployment settings, including SITE_DOMAIN.
set -a
source .env.production
set +a

: "${SITE_DOMAIN:?SITE_DOMAIN must be configured}"

echo "=== 3. Building Expo web frontend ==="

sudo docker run --rm \
  -v "$ROOT:/workspace" \
  -w /workspace/app/mobile \
  -e EXPO_PUBLIC_API_URL="https://${SITE_DOMAIN}" \
  node:24-slim \
  bash -euc '
    cd ../shared
    npm ci
    npm run build

    cd ../mobile
    npm ci
    npx expo export --platform web
  '

if [[ ! -f app/mobile/dist/index.html ]]; then
  echo "Expo build failed: index.html not found."
  exit 1
fi

echo "=== 4. Publishing frontend ==="

mkdir -p web-dist
cp -a app/mobile/dist/. web-dist/

echo "=== 5. Validating Docker configuration ==="

"${COMPOSE[@]}" config --quiet

echo "=== 6. Updating Docker services ==="

"${COMPOSE[@]}" up -d --build --remove-orphans

echo "=== 7. Deployment status ==="

"${COMPOSE[@]}" ps

echo ""
echo "Deployment complete."
echo "Website: https://${SITE_DOMAIN}"
