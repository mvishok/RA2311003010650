import axios from "axios";

const LOG_API = "http://20.207.122.201/evaluation-service/logs";

export const Log = async (
    stack: "backend",
    level: "debug" | "info" | "warn" | "error" | "fatal",
    pkg:
        | "cache"
        | "controller"
        | "cron_job"
        | "db"
        | "domain"
        | "handler"
        | "repository"
        | "route"
        | "service",
    message: string,
    token: string
) => {
    try {
        const response = await axios.post(
            LOG_API,
            {
                stack,
                level,
                package: pkg,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        console.log("received following response", response.data);
        return response.data;
    } catch (err: any) {
        console.log(token);
        console.error("Log failed:", err.response?.data || err.message);
        console.log(`[FALLBACK LOG] [${level.toUpperCase()}] ${stack} (${pkg}): ${message}`);
        return null;
    }
};