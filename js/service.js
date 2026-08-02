/*----------------------------------------初期設定----------------------------------------*/
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getProfile } from "./profile.js";
import { insertQueue } from "./database.js";
import { bootWorker } from "./worker.js";

export async function downloadReception(username) {
    const profile = await getProfile(username);
    if (!profile) {
        return;
    }

    if (profile.is_private) {
        return {
            id: null,
            profile: profile,
        };
    }

    const id = uuidv4();
    await insertQueue(id, username);
    bootWorker();
    return {
        id: id,
        profile: profile,
    };
}
