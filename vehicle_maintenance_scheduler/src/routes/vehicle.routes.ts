import { Router } from "express";
import { Log } from "../../../logging_middleware/logger.js";

const router = Router();

const vehicles: any[] = [];

router.post("/vehicles", async (req, res) => {
    const TOKEN = process.env.TOKEN!;
    await Log("backend", "info", "route", "POST /vehicles hit", TOKEN);

    const { id, name } = req.body || {};

    if (!id || !name) {
        await Log("backend", "error", "handler", "Invalid vehicle data", TOKEN);
        return res.status(400).json({ error: "Invalid data" });
    }

    vehicles.push({ id, name });

    await Log("backend", "info", "service", "Vehicle created", TOKEN);

    res.json({ message: "Vehicle added" });
});

export default router;