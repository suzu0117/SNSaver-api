import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./js/router.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/profileimage", express.static("profileimage"));
app.use("/temp", express.static("temp"));

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
