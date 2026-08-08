import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { router } from "./js/router.js";
import { initialize, launchPublicApi } from "./js/initialize.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/profileimage", express.static("profileimage"));
app.use("/temp", express.static("temp"));
app.use("/api", router);

const publicApi = "https://snsaver-render-api.onrender.com";
initialize(publicApi);

setInterval(() => launchPublicApi(publicApi), 5 * 60 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
