import { analyticsService } from "./analytics.service";
import { HttpError, sendSuccess } from "../../common/app-error";
import { Request, Response, NextFunction } from "express";
import { createReportDto } from "./analytics.dto";

export class AnalyticsController {
    async getReport(req: Request, res: Response, next: NextFunction) {
        try {
            const { reportType, startDate, endDate } = req.query;
            const userId = (req as any).userId;
            const role = (req as any).role;

            const filters: any = {};
            if (reportType) filters.reportType = String(reportType);
            if (startDate) filters.startDate = String(startDate);
            if (endDate) filters.endDate = String(endDate);

            const reports = await analyticsService.getReports(filters, userId, role);
            return sendSuccess(res, 200, reports);
        } catch (error) {
            next(error);
        }
    }

    async getReportById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const { userId, role } = req as any;
            const report = await analyticsService.getReportById(id, { userId, role });

            if (!report) {
                throw new HttpError(404, "Report not found");
            }

            return sendSuccess(res, 200, report);
        } catch (error) {
            next(error);
        }
    }

    async generateReport(req: Request, res: Response, next: NextFunction) {
        try {
            const data = createReportDto.parse(req.body);
            const customerId = (req as any).userId;

            const report = await analyticsService.generateReport(customerId, data);
            return sendSuccess(res, 201, report, "Report generated successfully");
        } catch (error) {
            next(error);
        }
    }

    async getChartData(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, role } = req as any;
            const { sensorId, startTime, endTime, bucketTimes } = req.query;
            if (!sensorId || !startTime || !endTime) {
                throw new HttpError(400, "Missing required query parameters");
            }

            const parseBuckets = bucketTimes ? parseInt(bucketTimes as string) : 50;
            const data = await analyticsService.getChartData({userId, role}, sensorId as string, startTime as string, endTime as string, parseBuckets);
            return sendSuccess(res, 200, data);
        } catch (error) {
            next(error);
        }
    }
}

export const analyticsController = new AnalyticsController();