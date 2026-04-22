import type { Response } from "express";
import type { ApiErrorResponse, ApiSuccessResponse } from "./api-response";

export class HttpError extends Error {
    public readonly statusCode: number;
  
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    data: T,
    message?: string,
    meta?: Record<string, unknown>
): Response<ApiSuccessResponse<T>> => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(meta && { meta }),
    });
};

export const sendError = (
    res: Response,
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown,
): Response<ApiErrorResponse> => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: {
        code,
        details,
        },
    });
};