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
                data: null,
            });
        }
        res.json({
            message: "success",
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "internal server error",
            data: null,
        });
    }
});

router.get("/status/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const data = await checkStatus(id);

        const status = data.STATUS;
        if (!status) {
            return res.status(404).json({
                message: "id not found",
                status: null,
                url: null,
            });
        }

        const url = data.URL;
        res.json({
            message: "success",
            status: status,
            url: url,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "internal server error",
            status: null,
            url: null,
        });
    }
});

export { router };
