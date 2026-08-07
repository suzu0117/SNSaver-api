/*----------------------------------------初期設定----------------------------------------*/
import fs from "fs";
import { ZipArchive } from "archiver";

/*----------------------------------------関数----------------------------------------*/
export function createTempFolder(id, username) {
    const tempFolder = `./temp/${id}/${username}`;
    fs.mkdirSync(tempFolder, { recursive: true });
    return tempFolder;
}

export async function createZipFile(tempFolder, id) {
    console.log("ziped");
    const archive = new ZipArchive();
    const fileName = `./temp/${id}.zip`;
    const file = fs.createWriteStream(fileName);

    const finished = new Promise((resolve, reject) => {
        file.on("finish", resolve);
        file.on("error", reject);
        archive.on("error", reject);
    });

    archive.pipe(file);
    archive.directory(`./temp/${id}`, false);
    archive.finalize();

    await finished;

    const baseUrl = process.env.BASE_URL ?? "http://localhost:3001";
    return `${baseUrl}/temp/${id}.zip`;
}
