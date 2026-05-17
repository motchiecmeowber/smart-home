import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { createReportDto } from "@/modules/analytics/analytics.dto";
import { z } from "zod";
import { apiError, apiSuccess } from "@/common/api-response";

export function registerAnalyticsDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "post",
        path: "/api/generate-report",
        summary: "[CUSTOMER] Generate report",
        tags: ["Analytics"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createReportDto
                    }
                }
            }
        },
        responses: {
            201: {
                description: "Report generated successfully",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            400: { description: "Bad Request", content: { "application/json": { schema: apiError } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } }
        }
    });

    registry.registerPath({
        method: "get",
        path: "/api/reports",
        summary: "[CUSTOMER] Get reports",
        tags: ["Analytics"],
        request: {
            query: z.object({
                reportType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]).optional().openapi({ description: "Lọc theo loại báo cáo" }),
                startDate: z.iso.datetime().optional().openapi({ description: "Lọc báo cáo tạo từ thời điểm này (ISO 8601)" }),
                endDate: z.iso.datetime().optional().openapi({ description: "Lọc báo cáo tạo đến thời điểm này (ISO 8601)" })
            })
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.array(z.any())) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } }
        }
    });

    registry.registerPath({
        method: "get",
        path: "/api/reports/{id}",
        summary: "[CUSTOMER] Get report by ID",
        tags: ["Analytics"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Report ID" }) })
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Report not found", content: { "application/json": { schema: apiError } } }
        }
    });

    registry.registerPath({
        method: "get",
        path: "/api/chart-data",
        summary: "[CUSTOMER] Get chart data",
        tags: ["Analytics"],
        request: {
            query: z.object({
                sensorId: z.string().openapi({ description: "Sensor ID" }),
                startTime: z.iso.datetime().optional().openapi({ description: "Start time (ISO 8601)" }),
                endTime: z.iso.datetime().optional().openapi({ description: "End time (ISO 8601)" }),
                bucketTimes: z.number().optional().openapi({ description: "Number of buckets" })
            })
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Chart data not found", content: { "application/json": { schema: apiError } } }
        }
    })
}