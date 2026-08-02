import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./js/router.js";
const app = express();
import path from "path";

app.use("/profileimage", (req, res, next) => {
    console.log(req.url);
    next();
});
app.use("/profileimage", express.static("profileimage"));
app.use("/temp", express.static("temp"));
app.use(express.json());
app.use(cors());

app.use("/api", router);

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
