import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

export async function getQueue() {
    return (
        await pool.query(`
            SELECT
                "ID",
                "USERNAME",
                "STATUS",
                "QUEUED_AT"
            FROM
                "JOB_MANAGER"
            WHERE
                "STATUS" = 'QUEUED'
            ORDER BY
                "QUEUED_AT" ASC
            LIMIT 1
        `)
    ).rows[0];
}

export async function insertQueue(id, username) {
    await pool.query(
        `
        INSERT INTO "JOB_MANAGER"
        (
            "ID",
            "USERNAME",
            "STATUS"
        )
        VALUES
        (
            $1,
            $2,
            'QUEUED'
        )
        `,
        [id, username],
    );
}

export async function updateStatusToStarted(id) {
    await pool.query(
        `
        UPDATE "JOB_MANAGER"
        SET
            "STATUS" = 'RUNNING',
            "STARTED_AT" = CURRENT_TIMESTAMP
        WHERE
            "ID" = $1
        `,
        [id],
    );
}

export async function updateStatusToCompleted(id, url) {
    await pool.query(
        `
        UPDATE "JOB_MANAGER"
        SET
            "STATUS" = 'COMPLETED',
            "COMPLETED_AT" = CURRENT_TIMESTAMP,
            "URL" = $1
        WHERE
            "ID" = $2
        `,
        [url, id],
    );
}

export async function updateStatusToFailed(id, error) {
    await pool.query(
        `
        UPDATE "JOB_MANAGER"
        SET
            "STATUS" = 'FAILED',
            "FAILED_AT" = CURRENT_TIMESTAMP,
            "ERROR_MESSAGE" = $1
        WHERE
            "ID" = $2
        `,
        [error, id],
    );
}

export async function checkStatus(id) {
    return (
        await pool.query(
            `
            SELECT
                "STATUS",
                "URL"
            FROM
                "JOB_MANAGER"
            WHERE
                "ID" = $1
            `,
            [id],
        )
    ).rows[0];
}

export async function errorLogInsert(errorLog) {
    await pool.query(
        `
        INSERT INTO "ERROR_LOG"
        (
            "ERROR_LOG"
        )
        VALUES
        (
            $1
        )
        `,
        [errorLog],
    );
}
