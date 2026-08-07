/*----------------------------------------初期設定----------------------------------------*/
import {
    getQueue,
    updateStatusToStarted,
    updateStatusToCompleted,
    updateStatusToFailed,
} from "./database.js";
import { getPosts } from "./posts.js";
import { downloadFiles } from "./download.js";
import { createTempFolder, createZipFile } from "./filemanager.js";
import { uploadFileToR2, createSignedUrl } from "./R2manager.js";
/*----------------------------------------処理開始----------------------------------------*/
let running = false;

export async function bootWorker() {
    if (running) {
        return;
    }
    running = true;
    try {
        while (running) {
            const queue = await getQueue();
            if (!queue) {
                break;
            }
            const id = queue.ID;
            const username = queue.USERNAME;
            await processJob(id, username);
        }
    } catch (error) {
        console.log(error);
    } finally {
        running = false;
    }
}

async function processJob(id, username) {
    try {
        updateStatusToStarted(id);

        let posts = [];
        posts = await getPosts(username);

        const tempFolder = createTempFolder(id, username);

        await downloadFiles(posts, tempFolder);
        const filePath = await createZipFile(tempFolder, id);
        const objectKey = `temp/${id}.zip`;
        await uploadFileToR2(filePath, objectKey, "application/zip");
        const url = await createSignedUrl(objectKey);
        updateStatusToCompleted(id, url);
    } catch (error) {
        console.log(error.message);
        updateStatusToFailed(id, error.message);
    }
}
