import { createClient } from "redis";
import { env } from "@/config/env";

const redisOptions = {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD || undefined,
};

/** Main client: general get/set/pub operations */
export const redisClient = createClient(redisOptions);

/**
 * Dedicated subscriber client.
 * Redis requires a separate connection for Pub/Sub because once a client
 * enters subscribe mode it can only handle subscribe/unsubscribe commands.
 */
export const redisSubscriber = createClient(redisOptions);

redisClient.on("connect", () => {
    console.log("Kết nối Redis (main) thành công");
});
redisClient.on("error", (err) => {
    console.error("Lỗi Redis (main):", err);
});

redisSubscriber.on("connect", () => {
    console.log("Kết nối Redis (subscriber) thành công");
});
redisSubscriber.on("error", (err) => {
    console.error("Lỗi Redis (subscriber):", err);
});

export async function connectRedis() {
    try {
        await Promise.all([
            redisClient.connect(),
            redisSubscriber.connect(),
        ]);
    } catch (err) {
        console.error("Không thể kết nối Redis:", err);
        process.exit(1);
    }
}