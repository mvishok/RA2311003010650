import express from "express";
import dotenv from "dotenv";
import { Log } from "../../logging_middleware/logger.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import priorityRoutes from "./routes/priority.routes.js";

dotenv.config();
console.log("booted");
const app = express();
app.use(express.json());

const TOKEN = process.env.TOKEN!;

app.use("/", vehicleRoutes);
app.use("/", serviceRoutes);
app.use("/", priorityRoutes);

app.get("/", async (req, res) => {
    await Log("backend", "info", "route", "Root route hit", TOKEN);
    res.send("Working");
});

app.get("/error", async (req, res) => {
    console.log("route hit");
    const re = await Log("backend", "error", "handler", "Test error log", TOKEN);
    console.log("received response", re);
    res.status(500).send("Error route");
});

app.listen(3000, () => {
    console.log("Server running on 3000");
});