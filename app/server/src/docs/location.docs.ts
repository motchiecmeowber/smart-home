import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { apiError, apiSuccess } from "@/common/api-response";

import { createLocationDto, updateLocationDto } from "@/modules/location/location.dto";

export function registerLocationDocs(registry: OpenAPIRegistry){
    registry.registerPath({
        method: "post",
        path: "/api/locations",
        summary: "[CUSTOMER] Add a new location",
        tags: ["Location"],
        security: [{ bearerAuth: [] }],
        request: {
        body: {
            content: { "application/json": { schema: createLocationDto } }
        }
        },
        responses: {
            201: {
                description: "Created successfully",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            400: { description: "Bad Request", content: { "application/json": { schema: apiError } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } }
        }
    });
    
    registry.registerPath({
        method: "get",
        path: "/api/locations",
        summary: "[CUSTOMER] Get all locations",
        tags: ["Location"],
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
        path: "/api/locations/{id}",
        summary: "[CUSTOMER] Update a location",
        tags: ["Location"],
        security: [{ bearerAuth: [] }],
        request: {
        params: z.object({ id: z.string().openapi({ description: "Location ID" }) }),
        body: {
            content: { "application/json": { schema: updateLocationDto } }
        }
        },
        responses: {
            200: {
                description: "Updated successfully",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            400: { description: "Bad Request", content: { "application/json": { schema: apiError } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Location not found", content: { "application/json": { schema: apiError } } }
        }
    });
    
    registry.registerPath({
        method: "delete",
        path: "/api/locations/{id}",
        summary: "[CUSTOMER] Delete a location",
        tags: ["Location"],
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string().openapi({ description: "Location ID" }) }) },
        responses: {
            200: {
                description: "Deleted successfully",
                content: { "application/json": { schema: apiSuccess(z.any()) } }
            },
            401: { description: "Unauthorized", content: { "application/json": { schema: apiError } } },
            404: { description: "Location not found", content: { "application/json": { schema: apiError } } }
        }
    });
}