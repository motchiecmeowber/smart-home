import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { redisClient } from "@/config/redis";
import { REDIS_KEYS } from "@/config/redis.keys";

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Access token không được cung cấp" });
    }

    // Check if token is blacklisted
    const isBlacklisted = await redisClient.get(REDIS_KEYS.blacklist(token));
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token đã bị thu hồi" });
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
      userId: string;
      role: string;
    };

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token đã hết hạn" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }
    return res.status(500).json({ message: "Lỗi xác thực" });
  }
};