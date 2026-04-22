import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import { sendError, HttpError } from "../common/app-error";

export const notFoundHandler = (_req: Request, res: Response): void => {
    sendError(res, 404, "API endpoint không tồn tại", "NOT_FOUND");
};

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
  
    if (err instanceof ZodError) {
        const validationDetails = err.issues.map((e: $ZodIssue) => ({
            field: e.path.join("."),
            message: e.message,
        }));
        
        sendError(res, 400, "Dữ liệu đầu vào không hợp lệ", "VALIDATION_ERROR", validationDetails);
        return;
    }

    if (err instanceof HttpError) {
        sendError(res, err.statusCode, err.message, "HTTP_ERROR");
        return;
    }

    console.error("Unhandled error:", err);
    sendError(res, 500, "Internal Server Error", "INTERNAL_SERVER_ERROR");
};