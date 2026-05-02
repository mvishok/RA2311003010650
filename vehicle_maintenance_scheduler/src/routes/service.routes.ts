import { Router } from "express";
import { Log } from "../../../logging_middleware/logger.js";

const router = Router();

const services: any[] = [];


// POST /services → schedule service
router.post("/services", async (req, res) => {
    const TOKEN = process.env.TOKEN!;
    await Log("backend", "info", "route", "POST /services hit", TOKEN);

    const { vehicleId, date } = req.body || {};

    if (!vehicleId || !date) {
        await Log("backend", "error", "handler", "Invalid service data", TOKEN);
        return res.status(400).json({ error: "Invalid data" });
    }

    services.push({ vehicleId, date });

    await Log("backend", "info", "service", "Service scheduled", TOKEN);

    res.json({ message: "Service scheduled" });
});


// GET /services → fetch all services
router.get("/services", async (req, res) => {
    const TOKEN = process.env.TOKEN!;
    await Log("backend", "info", "route", "GET /services hit", TOKEN);

    await Log("backend", "debug", "service", "Fetching services list", TOKEN);

    res.json(services);
});

export default router;