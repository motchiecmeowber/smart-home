import { createClient } from "redis";
import { env } from "@/config/env";

export const redisClient = createClient({
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => {
    console.log("Kết nối Redis thành công");
});
redisClient.on("error", (err) => {
    console.error("Lỗi kết nối Redis:", err);
});

export async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Không thể kết nối Redis:", err);
        process.exit(1);
    }
}