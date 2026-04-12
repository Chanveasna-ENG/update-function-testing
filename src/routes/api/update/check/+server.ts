import { json } from "@sveltejs/kit";
import { pollGitHub, getSettings, getState, saveSettings } from "$lib/server/updater";

export async function GET() {
    // Return the current state (is an update pending?) and the saved settings
    return json({ 
        state: getState(), 
        settings: getSettings() 
    });
}

// Optional: You can make a separate endpoint to force a manual Git check
export async function PUT() {
    const result = pollGitHub();
    return json(result);
}

export async function POST({ request }) {
    const body = await request.json();
    const newSettings = saveSettings({
        scheduledTime: body.scheduledTime,
        autoUpdate: body.autoUpdate,
        checkFrequencyMinutes: Number(body.checkFrequencyMinutes)
    });
    return json({ success: true, settings: newSettings });
}