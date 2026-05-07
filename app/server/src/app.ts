import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { env } from "./config/env";
import { openApiDocument } from "./docs/openapi";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { connectRedis } from "@/config/redis";

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use(notFoundHandler);
app.use(errorHandler);

connectRedis().then(() => {
    console.log("Đã kết nối Redis, khởi động server...");
}).catch((err) => {
    console.error("Lỗi khi kết nối Redis:", err);
    process.exit(1);
});

app.listen(env.PORT, () => {
    console.log(`Server is running at http://localhost:${env.PORT}`);
    console.log(`API Docs are available at http://localhost:${env.PORT}/api-docs`)
});