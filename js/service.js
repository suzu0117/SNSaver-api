/*----------------------------------------初期設定----------------------------------------*/
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { getProfile, downloadProfileImage } from "./profile.js";
import { insertQueue } from "./database.js";
import { bootWorker } from "./worker.js";
import { uploadFileToR2, createSignedUrl } from "./R2manager.js";
/*----------------------------------------関数----------------------------------------*/
export async function downloadReception(username) {
    const response = await getProfile(username);

    if (response.status !== 200) {
        console.log(response.status);
        return {
            status: response.status,
            data: {
                id: null,
                profile: null,
                url: null,
            },
        };
    }
    const profile = response.profile;

    const filePath = await downloadProfileImage(
        profile.username,
        profile.profile_pic_url_hd,
    );
    const objectKey = `profileimage/${profile.username}.jpg`;
    await uploadFileToR2(filePath, objectKey, "image/jpeg");
    const url = await createSignedUrl(objectKey);

    if (profile.is_private) {
        return {
            status: profile.status,
            data: {
                id: null,
                profile: profile,
                url: url,
            },
        };
    }

    const id = uuidv4();
    await insertQueue(id, username);
    bootWorker();
    return {
        status: profile.status,
        data: {
            id: id,
            profile: profile,
            url: url,
        },
    };
}
