import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import  cookieParser  from "cookie-parser";
import "@/config/zod.extend";

import { env } from "./config/env";
import { openApiDocument } from "./docs/openapi";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { connectRedis } from "@/config/redis";
import identityRouter from "./modules/identity/identity.routes";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(cookieParser());

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/identity", identityRouter);

app.use(notFoundHandler);
app.use(errorHandler);

async function bootstrap() {
    await connectRedis();
    console.log("Đã kết nối Redis, khởi động server...");

    app.listen(env.PORT, () => {
        console.log(`Server is running at http://localhost:${env.PORT}`);
        console.log(`API Docs are available at http://localhost:${env.PORT}/api-docs`);
    });
}

bootstrap().catch((err) => {
    console.error("Lỗi khởi động server:", err);
    process.exit(1);
});