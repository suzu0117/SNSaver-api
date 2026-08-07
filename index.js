import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./js/router.js";
import path from "path";

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
