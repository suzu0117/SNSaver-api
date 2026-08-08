import "dotenv/config";
import { Pool } from "pg";
import { connectCloudFlareTunnel } from "./cloudFlareTunnel.js";

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

export async function initialize(publicApi) {
    await initializeJobManager();
    const cloudFlareTunnel = await connectCloudFlareTunnel();
    let publicApiLaunched = false;
    while (!publicApiLaunched) {
        publicApiLaunched = await launchPublicApi(publicApi);
    }
    await sendCloudFlareTunnel(publicApi, cloudFlareTunnel);
    console.log(cloudFlareTunnel);
}

async function initializeJobManager() {
    await pool.query(
        `
        DELETE FROM
            "JOB_MANAGER"
        WHERE
            "STATUS" IN('QUEUED','COMPLETED','RUNNING') 
        `,
    );
}

export async function launchPublicApi(publicApi) {
    try {
        const response = await fetch(`${publicApi}/api/health`);
        console.log(`Render health check: ${response.status}`);
        return true;
    } catch (error) {
        console.error("Render health check failed:", error);
        return false;
    }
}

async function sendCloudFlareTunnel(publicApi, cloudFlareTunnel) {
    await fetch(`${publicApi}/api/receiveCloudFlareTunnel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cloudFlareTunnel }),
    });
}
