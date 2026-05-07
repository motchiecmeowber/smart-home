import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (requiredRole: string) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.role) {
      return res.status(401).json({ message: "Không tìm thấy thông tin vai trò" });
    }

    if (req.role !== requiredRole) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });
    }

    next();
  };
};