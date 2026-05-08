import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createScheduleDto, updateScheduleDto } from "@/modules/automation/automation.dto";

export function registerAutomationDocs(registry: OpenAPIRegistry){
    registry.registerPath({
        method: "post",
        path: "/api/schedules",
        summary: "[CUSTOMER] Create a schedule",
        tags: ["Automation"],
        request: {
            body: {
            content: { "application/json": { schema: createScheduleDto } }
            }
        },
        responses: { 201: { description: "Created successfully" } }
    });

    registry.registerPath({
        method: "get",
        path: "/api/schedules",
        summary: "[CUSTOMER] Get schedules for current user",
        tags: ["Automation"],
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "get",
        path: "/api/schedules/{id}",
        summary: "[CUSTOMER] Get schedule by ID",
        tags: ["Automation"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Schedule ID" }) })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "patch",
        path: "/api/schedules/{id}",
        summary: "[CUSTOMER] Update a schedule",
        tags: ["Automation"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Schedule ID" }) }),
            body: {
            content: { "application/json": { schema: updateScheduleDto } }
            }
        },
        responses: { 200: { description: "Updated successfully" } }
    });

    registry.registerPath({
        method: "delete",
        path: "/api/schedules/{id}",
        summary: "[CUSTOMER] Delete a schedule",
        tags: ["Automation"],
        request: { params: z.object({ id: z.string().openapi({ description: "Schedule ID" }) }) },
        responses: { 200: { description: "Deleted successfully" } }
    });
}