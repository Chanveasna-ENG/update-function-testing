import { pollGitHub, getSettings, getState, triggerBashUpdate } from '$lib/server/updater';

const globalAny: any = global;

if (!globalAny.__updaterStarted) {
    globalAny.__updaterStarted = true;

    // --- Job 1: The Poller (Checks GitHub based on user frequency) ---
    const runPoller = () => {
        console.log("[Cron] Polling GitHub for new commits...");
        pollGitHub();
        
        // Reschedule itself based on current settings
        const currentFreq = getSettings().checkFrequencyMinutes;
        setTimeout(runPoller, currentFreq * 60 * 1000);
    };
    
    // Start the first poll
    runPoller();

    // --- Job 2: The Executor (Checks the clock every 1 minute) ---
    setInterval(() => {
        const settings = getSettings();
        const state = getState();
        
        if (!settings.autoUpdate || !state.isUpdatePending) return;

        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMinute = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHour}:${currentMinute}`;

        if (currentTime === settings.scheduledTime) {
            console.log("[Cron] Scheduled time reached. Executing pending update...");
            triggerBashUpdate();
        }
    }, 60000);
}