#!/bin/bash

# Configuration
APP_NAME="update-function-testing"
BRANCH="main"

echo "--- Starting Process: $(date) ---"

if [ -d .git ]; then
    echo "Pulling latest code from GitHub..."
    git pull origin $BRANCH
else
    echo "Not a git repository. Skipping pull."
fi

echo "Installing dependencies..."
pnpm install

echo "Building application..."
if pnpm run build; then
    echo "Build successful."
else
    echo "Build failed! Check the logs for errors. The app was not restarted."
    exit 1
fi

echo "Refreshing application process..."
if pm2 describe $APP_NAME > /dev/null; then
    pm2 restart $APP_NAME
    echo "Application updated and restarted successfully."
else
    pm2 start build/index.js --name "$APP_NAME" -- --port 3000
    pm2 save
    echo "Application started for the first time."
fi

echo "--- Process Complete ---"