import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { apiError, apiSuccess } from "@/common/api-response";

import { updateRequestStatusDto, deleteRequestDto } from "@/modules/request/request.dto";

export function registerRequestDocs(registry: OpenAPIRegistry) {
    registry.register("UpdateRequestStatus", updateRequestStatusDto);
    registry.register("DeleteRequest", deleteRequestDto);

    registry.registerPath({
        method: "get",
        path: "/api/requests",
        summary: "Get requests",
        tags: ["Request"],
        request: {
            query: z.object({
                customerId: z.string().optional().openapi({ description: "Filter by customer ID" }),
                adminId: z.string().optional().openapi({ description: "Filter by admin ID" }),
                status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional().openapi({ description: "Filter by status" })
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
        path: "/api/requests/{id}",
        summary: "Get request by ID",
        tags: ["Request"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Request ID" }) })
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Request not found", content: { "application/json": { schema: apiError } } }
        }
    });

    registry.registerPath({
        method: "patch",
        path: "/api/requests/{id}/status",
        summary: "[ADMIN] Update request status",
        tags: ["Request"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Request ID" }) }),
            body: { content: { "application/json": { schema: updateRequestStatusDto } } }
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            400: { description: "Bad Request", content: { "application/json": { schema: apiError } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            403: { description: "Forbidden", content: { "application/json": { schema: apiError } } },
            404: { description: "Request not found", content: { "application/json": { schema: apiError } } }
        }
    });

    registry.registerPath({
        method: "delete",
        path: "/api/requests/{id}",
        summary: "[ADMIN] Delete a request",
        tags: ["Request"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Request ID" }) })
        },
        responses: {
            200: {
                description: "Success",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            403: { description: "Forbidden", content: { "application/json": { schema: apiError } } },
            404: { description: "Request not found", content: { "application/json": { schema: apiError } } }
        }
    });
}