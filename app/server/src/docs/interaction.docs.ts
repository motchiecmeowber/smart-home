import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { apiError, apiSuccess } from "@/common/api-response";

export function registerInteractionDocs(registry: OpenAPIRegistry) {
    registry.registerPath({
        method: "get",
        path: "/api/notifications",
        summary: "Get notifications",
        tags: ["Interaction"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
                isRead: z.enum(["true", "false"]).optional().openapi({ description: "Filter by read status" })
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
        method: "patch",
        path: "/api/notifications/{id}/read",
        summary: "Mark notification as read",
        tags: ["Interaction"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string().openapi({ description: "Notification ID" }) }) },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Not Found", content: { "application/json": { schema: apiError } } }
        }
    });
}