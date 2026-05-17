import { prisma } from "@/config/prisma";
import { Prisma, ReportType, Role } from "@prisma/client";

export class AnalyticsRepository {
    async createReport(data: Prisma.ReportCreateInput) {
        return prisma.report.create({ data });
    }

    async getReports(filters?: {reportType?: ReportType, startDate?: string, endDate?: string}, customerId?: string, role?: string) {
        const where: any = {};
        if (filters?.reportType) where.reportType = filters.reportType;

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        if (role === Role.CUSTOMER && customerId) {
            where.customerId = customerId
        };

        return prisma.report.findMany({ where });
    }

    async getReportById(reportId: string) {
        return prisma.report.findUnique({
            where: { reportId }, 
            include: { summaryData: true }
        });
    }
}

export const analyticsRepo = new AnalyticsRepository();