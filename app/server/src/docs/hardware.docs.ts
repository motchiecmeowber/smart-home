import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { controlActuatorDto, createDeviceDto, updateDeviceDto } from "@/modules/hardware/hardware.dto";

export function registerHardwareDocs(registry: OpenAPIRegistry){
    registry.registerPath({
        method: "post",
        path: "/api/devices",
        summary: "[ADMIN] Add a new device",
        tags: ["Hardware"],
        request: {
            body: {
            content: {
                "application/json": {
                schema: createDeviceDto
                }
            }
            }
        },
        responses: {
            201: {
            description: "Created successfully"
            }
        }
    });

    registry.registerPath({
        method: "get",
        path: "/api/devices",
        summary: "Get all devices",
        tags: ["Hardware"],
        request: {
            query: z.object({
            locationId: z.string().optional().openapi({ description: "Filter by Location ID" }),
            deviceType: z.enum(["SENSOR", "ACTUATOR"]).optional().openapi({ description: "Filter by Device Type" })
            })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "get",
        path: "/api/devices/{id}",
        summary: "Get device by ID",
        tags: ["Hardware"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
            method: "patch",
            path: "/api/devices/{id}",
            summary: "[ADMIN] Update a device",
            tags: ["Hardware"],
            request: {
                params: z.object({ id: z.string().openapi({ description: "Device ID" }) }),
            body: {
            content: {
                "application/json": {
                schema: updateDeviceDto
                }
            }
            }
        },
        responses: { 200: { description: "Updated successfully" } }
    });

    registry.registerPath({
        method: "delete",
        path: "/api/devices/{id}",
        summary: "[ADMIN] Delete a device",
        tags: ["Hardware"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) })
        },
        responses: { 200: { description: "Deleted successfully" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/devices/{id}/request-delete",
        summary: "[CUSTOMER] Submit a delete request",
        tags: ["Hardware"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) })
        },
        responses: { 201: { description: "Delete request submitted" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/devices/{id}/request-update",
        summary: "[CUSTOMER] Submit an update request",
        tags: ["Hardware"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) }),
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            note: z.string().optional().openapi({ example: "Request to change device name" }),
                            content: z.string().optional().openapi({ example: "Please change my sensor name to Kitchen Temp" })
                        })
                    }
                }
            }
        },
        responses: { 201: { description: "Update request submitted" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/devices/request-add",
        summary: "[CUSTOMER] Submit an add request",
        tags: ["Hardware"],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: z.object({
                            serial: z.string().min(1, "Serial is required").openapi({ example: "SN-TEMP-999" }),
                            note: z.string().optional().openapi({ example: "Adding new bedroom sensor" })
                        })
                    }
                }
            }
        },
        responses: { 201: { description: "Add request submitted" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/actuators/{id}/control",
        summary: "[CUSTOMER] Control an actuator (ON/OFF)",
        tags: ["Hardware"],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Actuator ID" }) }),
            body: {
            content: {
                "application/json": {
                schema: controlActuatorDto
                }
            }
            }
        },
        responses: { 200: { description: "Command sent" } }
    });
}