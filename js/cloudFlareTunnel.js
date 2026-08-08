import { spawn } from "node:child_process";

export async function connectCloudFlareTunnel() {
    return await new Promise((resolve, reject) => {
        const cloudflared = spawn("cloudflared", [
            "tunnel",
            "--url",
            "localhost:3001",
        ]);

        cloudflared.stdout.on("data", (data) => {
            console.log(data);
        });

        cloudflared.stderr.on("data", (data) => {
            const text = data.toString();
            const match = text.match(
                /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/,
            );
            const url = match?.[0];
            if (url) {
                resolve(url);
            }
        });

        cloudflared.on("error", (error) => {
            reject(error);
        });

        cloudflared.on("close", (code) => {
            if (code !== 0) {
                reject(code);
            }
        });
    });
}
