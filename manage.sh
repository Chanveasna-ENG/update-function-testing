#!/bin/bash

# Configuration
APP_NAME="update-function-testing"
BRANCH="main"

echo "--- Starting Process: $(date) ---"
if ! command -v node &> /dev/null; then
    echo "node not found. Installing..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 24
    node -v # Should print "v24.14.1".
    npm -v # Should print "11.11.0".
fi
if ! command -v git &> /dev/null; then
    echo "git not found. Installing..."
    apt-get update
    apt-get install -y git
fi
if ! command -v pnpm &> /dev/null; then
    echo "pnpm not found. Installing..."
    npm install -g pnpm
fi
if ! command -v pm2 &> /dev/null; then
    echo "pm2 not found. Installing..."
    npm install -g pm2
fi

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