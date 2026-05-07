import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createRequestDto, updateRequestStatusDto, deleteRequestDto } from "@/modules/request/request.dto";

export function registerRequestDocs(registry: OpenAPIRegistry) {
    registry.register("CreateRequest", createRequestDto);
    registry.register("UpdateRequestStatus", updateRequestStatusDto);
    registry.register("DeleteRequest", deleteRequestDto);

    registry.registerPath({
        method: "post",
        path: "/api/requests",
        summary: "Create a new request",
        tags: ["Request"],
        request: {
            body: { content: { "application/json": { schema: createRequestDto } } }
        },
        responses: { 201: { description: "Created successfully" } }
    });

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
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "get",
        path: "/api/requests/{id}",
        summary: "Get request by ID",
        tags: ["Request"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Request ID" }) })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "patch",
        path: "/api/requests/{id}/status",
        summary: "Update request status",
        tags: ["Request"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Request ID" }) }),
            body: { content: { "application/json": { schema: updateRequestStatusDto } } }
        },
        responses: { 200: { description: "Success" } }
    });
}