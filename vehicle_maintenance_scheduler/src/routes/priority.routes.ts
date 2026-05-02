import { Router } from "express";
import axios from "axios";
import { Log } from "../../../logging_middleware/logger.js";

const router = Router();

type Notification = {
    ID: string;
    Type: "Event" | "Result" | "Placement";
    Message: string;
    Timestamp: string;
};

const weight = {
    Placement: 3,
    Result: 2,
    Event: 1
};

// CORE LOGIC
function getTopNotifications(data: Notification[], n = 10) {
    return data
        .map(noti => ({
            ...noti,
            score:
                weight[noti.Type] * 1e13 +
                new Date(noti.Timestamp).getTime()
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, n);
}

// ROUTE
router.get("/priority", async (req, res) => {
    try {
        const TOKEN = process.env.TOKEN!;
        await Log("backend", "info", "route", "GET /priority hit", TOKEN);

        // CALL THEIR API
        const response = await axios.get(
            "http://20.207.122.201/evaluation-service/notifications",
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        );

        await Log("backend", "info", "service", "Fetched notifications", TOKEN);

        const notifications: Notification[] = response.data.notifications;

        // COMPUTE TOP
        const result = getTopNotifications(notifications);

        await Log("backend", "info", "service", "Computed top notifications", TOKEN);

        res.json(result);

    } catch (err) {
        const TOKEN = process.env.TOKEN!;
        await Log("backend", "error", "handler", "Priority computation failed", TOKEN);
        res.status(500).json({ error: "Failed" });
    }
});

export default router;