import { json } from "@sveltejs/kit";
import { execSync } from "child_process";

export async function POST() {
    console.log("[/api/update] Update triggered at", new Date().toISOString());
    try {
        const update = execSync("./manage.sh", { encoding: "utf-8" });
        console.log("[/api/update] Script output:\n", update);
        return json({
            success: true,
            message: "Update successful. The app is restarting...",
            output: update
        }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[/api/update] Update failed:\n", message);
        return json({
            success: false,
            message: "Update failed. Check server logs for more information.",
            error: message
        }, { status: 500 });
    }
}