import express from "express";
import { downloadReception } from "./service.js";
import { checkStatus } from "./database.js";
const router = express.Router();

let running = false;

router.post("/search", async (req, res) => {
    try {
        const username = await req.body.username;
        const response = await downloadReception(username);
        if (response.status === 401) {
            return res.status(401).json({
                message: `An error occurred on our service.<br>Please contact us through the inquiry form and mention error code <span class=error-code>401</span>.`,
                data: null,
            });
        }

        if (response.status === 429) {
            return res.status(429).json({
                message: `An error occurred on our service.<br>Please contact us through the inquiry form and mention error code <span class=error-code>429</span>.`,
                data: null,
            });
        }

        if (!response.data.profile) {
            return res.status(404).json({
                message: "user not found",
                data: null,
            });
        }

        res.json({
            message: "success",
            data: response.data,
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
