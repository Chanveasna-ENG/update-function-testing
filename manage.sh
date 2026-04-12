#!/bin/bash

APP_NAME="update-function-testing"
BRANCH="main"

echo "--- Starting Build & Restart: $(date) ---"

# 1. We assume Node has already verified an update exists.
echo "Hard pulling latest code..."
git reset --hard origin/$BRANCH
git pull origin $BRANCH

echo "Installing dependencies..."
pnpm install

pnpm run db:push

echo "Building application..."
if pnpm run build; then
    echo "Build successful."
else
    echo "Build failed! Aborting restart."
    exit 1
fi

echo "Refreshing application process..."
pm2 restart $APP_NAME || pm2 start build/index.js --name "$APP_NAME" -- --port 3000
pm2 save

echo "--- Process Complete ---"