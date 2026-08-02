import axios from "axios";
import fs from "fs";

export async function downloadFiles(posts, tempFolder) {
    await Promise.all(posts.map((post) => downloadFile(post, tempFolder)));
    console.log("downloaded");
}

async function downloadFile(post, tempFolder) {
    const date = new Date(post.taken_at * 1000);
    const formatted = date
        .toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" })
        .replace(/[- :]/g, "");

    const postFolder = `${tempFolder}/${formatted}_${post.pk}`;

    fs.mkdirSync(postFolder, { recursive: true });

    await Promise.all(
        post.media.map(async (url) => {
            const parse = new URL(url);
            const filename = parse.pathname.split("/").pop();
            const filePath = `${postFolder}/${filename}`;

            for (let i = 0; i < 3; i++) {
                try {
                    const response = await axios.get(url, {
                        responseType: "stream",
                        headers: {
                            "User-Agent":
                                "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                            Accept: "text/html",
                        },
                    });

                    await new Promise((resolve, reject) => {
                        const file = fs.createWriteStream(filePath);

                        response.data.pipe(file);

                        file.on("finish", resolve);
                        file.on("error", reject);
                        response.data.on("error", reject);
                    });

                    break;
                } catch (error) {
                    if (i === 2) {
                        throw error;
                    }
                }
            }
        }),
    );
}
