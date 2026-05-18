import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "@/config/zod.extend";
import { createServer } from "node:http";

import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { openApiDocument } from "./docs/openapi";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { connectRedis } from "@/config/redis";
import { tbWsClient } from "@/lib/ws/tb-ws";
import { clientWsManager } from "@/lib/ws/client-ws";
import identityRouter from "./modules/identity/identity.routes";

import { hardwareRouter } from "./modules/hardware/hardware.routes";
import { automationRouter } from "./modules/automation/automation.routes";
import { interactionRouter } from "./modules/interaction/interaction.routes";
import { locationRouter } from "./modules/location/location.routes";
import { requestRouter } from "./modules/request/request.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { automationService } from "./modules/automation/automation.service";

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(
    cors({
        origin: [
            "http://localhost:3000",
        ],
        credentials: true,
    })
);
app.use(cookieParser());

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok", database: "connected" });
    } catch (error) {
        res.status(500).json({ status: "error", database: "disconnected", details: String(error) });
    }
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    swaggerOptions: {
        withCredentials: true,
    }
}));

app.use("/api", hardwareRouter);
app.use("/api", automationRouter);
app.use("/api", interactionRouter);
app.use("/api", locationRouter);
app.use("/api", requestRouter);
app.use("/api", analyticsRouter);
app.use("/api/auth", identityRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
    await connectRedis();
    console.log("Đã kết nối Redis, khởi động server...");

    await automationService.init();
    console.log("Automation scheduler started");

    await clientWsManager.init(server);

    server.listen(env.PORT, async () => {
        console.log(`Server is running at http://localhost:${env.PORT}`);
        console.log(`API Docs are available at http://localhost:${env.PORT}/api-docs`);
        console.log(`WebSocket server ready at ws://localhost:${env.PORT}/ws`);

        await tbWsClient.connect();
        console.log("ThingsBoard WebSocket listener started");
    });
}

bootstrap().catch((err) => {
    console.error("Lỗi khởi động server:", err);
    process.exit(1);
});