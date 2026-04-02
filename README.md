# Production Deployment Guide

## Step 1: System Requirements

    - Node.js (v18 or higher)
    - Git

## Step 2: Install Global Tools
```bash
npm install -g pnpm pm2
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