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

const publicApi = "https://snsaver-render-api.onrender.com";

async function keepPublicApiRunning(publicApi) {
    try {
        const response = await fetch(`${publicApi}/health`);
        console.log(`Render health check: ${response.status}`);
    } catch (error) {
        console.error("Render health check failed:", error);
    }
}

keepPublicApiRunning(publicApi);
setInterval(() => keepPublicApiRunning(publicApi), 5 * 60 * 1000);
