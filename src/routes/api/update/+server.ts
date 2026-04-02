import { json } from "@sveltejs/kit";
import { spawn } from "child_process";

export async function POST() {
    console.log("[/api/update] Update triggered at", new Date().toISOString());
    const child = spawn("./manage.sh", [], {
        detached: true,
        stdio: "inherit"
    });
    child.unref();

    return json({ success: true }, { status: 200 });
}