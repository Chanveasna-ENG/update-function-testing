import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.resolve('updater-settings.json');
const STATE_FILE = path.resolve('updater-state.json');

// Default settings
let settings = {
    scheduledTime: "03:00", // When to apply the update
    autoUpdate: true,
    checkFrequencyMinutes: 60 // How often to check GitHub
};

// Internal state to remember if an update was found during a check
let state = {
    isUpdatePending: false,
    lastChecked: null as Date | null,
    pendingMessage: ""
};

// Load settings on startup
if (fs.existsSync(SETTINGS_FILE)) {
    settings = { ...settings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')) };
}

export function saveSettings(newSettings: Partial<typeof settings>) {
    settings = { ...settings, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return settings;
}

export function getSettings() {
    return settings;
}

export function getState() {
    return state;
}

// 1. Just checks GitHub, doesn't run the bash script
export function pollGitHub() {
    try {
        state.lastChecked = new Date();
        execSync('git fetch origin main');
        
        const localHash = execSync('git rev-parse HEAD').toString().trim();
        const remoteHash = execSync('git rev-parse origin/main').toString().trim();
        
        if (localHash !== remoteHash) {
            state.isUpdatePending = true;
            state.pendingMessage = execSync('git log -1 --pretty=%B origin/main').toString().trim();
            return { updateAvailable: true, message: state.pendingMessage };
        }
        
        state.isUpdatePending = false;
        return { updateAvailable: false };
    } catch (error) {
        console.error("Failed to check GitHub:", error);
        return { updateAvailable: false, error: "Check failed" };
    }
}

// 2. Actually triggers the restart
export function triggerBashUpdate() {
    console.log("[Updater] Triggering manage.sh...");
    const child = spawn("./manage.sh", [], {
        detached: true,
        stdio: "inherit"
    });
    child.unref();
    
    // Reset state after triggering
    state.isUpdatePending = false;
    state.pendingMessage = "";
}