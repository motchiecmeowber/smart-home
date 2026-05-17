import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

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
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "patch",
        path: "/api/notifications/{id}/read",
        summary: "Mark notification as read",
        tags: ["Interaction"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string().openapi({ description: "Notification ID" }) }) },
        responses: { 200: { description: "Success" } }
    });
}