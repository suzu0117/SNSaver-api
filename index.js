import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./js/router.js";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/profileimage", express.static("profileimage"));
app.use("/temp", express.static("temp"));
app.use("/api", router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

await r2.send(
    new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: "profileimage/athome_meraru.jpg",
        Body: fs.createReadStream("./profileimage/athome_meraru.jpg"),
        ContentType: "image/jpeg",
    })
);