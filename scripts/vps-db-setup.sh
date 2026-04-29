#!/usr/bin/env sh
# Run on the VPS from the project root (same directory as package.json).
# Requires: DATABASE_URL in the environment, Node/npm, dependencies installed.
set -e
cd "$(dirname "$0")/.."
npx prisma migrate deploy
npx prisma db seed
echo "DB migrations + seed finished."
