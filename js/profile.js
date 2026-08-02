import "dotenv/config";
import axios from "axios";
import fs from "fs";

export async function getProfile(username) {
    const response = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        {
            headers: {
                "x-ig-app-id": process.env.IG_APP_ID,
                cookie: process.env.IG_COOKIE,
                "user-agent": process.env.IG_USER_AGENT,
                referer: `https://www.instagram.com/${username}/`,
            },
        },
    );
    console.log({
    appId: process.env.IG_APP_ID,
    cookie: process.env.IG_COOKIE ? "exists" : "missing",
    userAgent: process.env.IG_USER_AGENT ? "exists" : "missing"
});
    console.log(response.status);
    console.log(response.data);
    if (!response.ok) {
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
        return null;
    }

    const json = await response.json();
    const user = json.data?.user;
    if (!user) {
        return;
    }
    const url = await profileImage(username, user.profile_pic_url_hd);
    return {
        username: user.username,
        full_name: user.full_name,
        id: user.id,
        count: user.edge_owner_to_timeline_media.count,
        is_private: user.is_private,
        url: url,
    };
}

async function profileImage(username, url) {
    fs.mkdirSync("./profileimage", { recursive: true });

    const filePath = `./profileimage/${username}.jpg`;

    const file = fs.createWriteStream(filePath);

    const response = await axios.get(url, {
        responseType: "stream",
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Accept: "image/*",
        },
    });

    response.data.pipe(file);

    await new Promise((resolve, reject) => {
        file.on("finish", resolve);
        file.on("error", reject);
    });

    const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
    return `${baseUrl}/profileimage/${username}.jpg`;
}
