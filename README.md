# Production Deployment Guide

## Step 1: System Requirements

### Install node
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 24
node -v # Should print "v24.14.1".
npm -v # Should print "11.11.0".
```

### Install GIT
```bash
sudo apt-get update
sudo apt-get install -y git
```

## Step 2: Install Global Tools
```bash
sudo npm install -g pnpm pm2
```

## Step 3: Clone and Initial Setup
```bash
# Clone the project
git clone https://github.com/Chanveasna-ENG/update-function-testing.git
cd update-function-testing

# Create your environment variables (Important!)
# cp .env.example .env
# nano .env

# Make the management script executable
chmod +x manage.sh

# Run the initial setup
./manage.sh
```

## Step 4: Updates

    - Manual: Run ./manage.sh in the terminal.
    - Admin UI: Log into the app as an admin and click the "Update App" button.