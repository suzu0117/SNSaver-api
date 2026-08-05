import express from "express";
import { downloadReception } from "./service.js";
import { checkStatus } from "./database.js";
const router = express.Router();

let running = false;

router.post("/search", async (req, res) => {
    try {
        const username = await req.body.username;

        const data = await downloadReception(username);

        if (!data) {
            return res.status(404).json({
                message: "user not found",
            });
        }

        res.json({
            data,
            message: "success",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "internal server error",
        });
    }
});

router.get("/status/:id", async (req, res) => {
    const id = req.params.id;
    const data = await checkStatus(id);
    if (!data) {
        return;
    }

    const status = data.STATUS;
    if (!status) {
        return res.status(404).json({
            message: "id not found",
        });
    }

    const url = data.URL;
    res.json({
        status: status,
        url: url,
    });
});

export { router };
