import { prisma } from "@/config/prisma";
import { redisClient } from "@/config/redis";
import { REDIS_KEYS } from "@/config/redis.keys";


export class RefreshTokenRepository {
    async saveToken(data: {
        userId: string;
        token: string;
        expiresAt: Date;
    }) {
        const refreshRecord = await prisma.refreshToken.create({
            data,
            select: {
                token: true,
                userId: true,                                expiresAt: true,
                revoked: true,
                user: {
                    select: {
                        userId: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        role: true,
                    }
                }
            }
        });
        
        // Cache in redis
        const ttl = Math.floor((data.expiresAt.getTime() - Date.now()) / 1000);
        await redisClient.set(
            REDIS_KEYS.refreshToken(refreshRecord.token),
            JSON.stringify(refreshRecord),
            { EX: ttl }
        );
    }

    async findByToken(token: string): Promise<any | null> {
        const cached = await redisClient.get(REDIS_KEYS.refreshToken(token));
        if (cached) {
            const parse = JSON.parse(cached);
            if (parse.revoked) return null;
            return parse;
        }

        const refreshRecord = await prisma.refreshToken.findUnique({
            where: { token },
            select: {
                token: true,
                userId: true,
                expiresAt: true,
                revoked: true,
                user: {
                    select: {
                        userId: true,
                        email: true,
                        username: true,
                        createdAt: true,
                        role: true,
                    }
                }
            }
        });

        if (refreshRecord) {
            const ttl = Math.floor((refreshRecord.expiresAt.getTime() - Date.now()) / 1000);
            await redisClient.set(
                REDIS_KEYS.refreshToken(refreshRecord.token),
                JSON.stringify(refreshRecord),
                { EX: ttl }
            );
        }
        
        return refreshRecord ?? null;
    }

    async findActiveByUserId(userId: string) {
        return prisma.refreshToken.findMany({
            where: {
                userId,
                revoked: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: { createdAt: "asc" },
        })
    }

    async deleteByToken(token: string) {
        await redisClient.del(REDIS_KEYS.refreshToken(token));
        return prisma.refreshToken.delete({
            where: { token },
        });
    }

    async deleteByUserId(userId: string) {
        const tokens = await prisma.refreshToken.findMany({
            where: { userId },
            select: { token: true }
        });

        if (tokens.length > 0) {
            await redisClient.del(tokens.map(t => REDIS_KEYS.refreshToken(t.token)));
        }

        return prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    async revokeToken(token: string) {
        await redisClient.del(REDIS_KEYS.refreshToken(token));
        return prisma.refreshToken.update({
            where: { token },
            data: { revoked: true },
        });
    }
}