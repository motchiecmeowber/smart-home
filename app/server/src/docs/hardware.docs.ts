import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { controlActuatorDto, createDeviceDto, updateDeviceDto } from "@/modules/hardware/hardware.dto";

export function registerHardwareDocs(registry: OpenAPIRegistry){
    // sửa dụng sync device từ tb thay cho nhập thủ công
    // registry.registerPath({
    //     method: "post",
    //     path: "/api/devices",
    //     summary: "[ADMIN] Add a new device",
    //     description: `Admin trực tiếp thêm thiết bị vào hệ thống.
    //     \n- **SENSOR**: Cần có 'unit' và 'threshold'.
    //     \n- **ACTUATOR**: Cần có 'customerId' để gắn quyền điều khiển.`,
    //     tags: ["Hardware"],
    //     security: [{ bearerAuth: [] }],
    //     request: {
    //         body: {
    //         content: {
    //             "application/json": {
    //             schema: createDeviceDto
    //             }
    //         }
    //         }
    //     },
    //     responses: {
    //         201: {
    //         description: "Created successfully"
    //         }
    //     }
    // });

    registry.registerPath({
        method: "get",
        path: "/api/devices",
        summary: "Get all devices",
        description: "Lấy danh sách tất cả thiết bị. Dữ liệu trả về sẽ bao gồm thông tin chi tiết của Sensor (nếu có) hoặc Actuator (nếu có).",
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
        request: {
            query: z.object({
            locationId: z.string().optional().openapi({ description: "Filter by Location ID" }),
            deviceType: z.enum(["SENSOR", "ACTUATOR"]).optional().openapi({ description: "Filter by Device Type" })
            })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/devices/sync",
        summary: "Sync devices from ThingsBoard",
        description: "Đồng bộ danh sách thiết bị từ ThingsBoard. Một thiết bị trên TB có thể được tách thành 2 bản ghi (Sensor và Actuator).",
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
        responses: {
            200: {
                description: "Sync success",
                content: {
                    "application/json": {
                        schema: z.object({
                            createdCount: z.number().openapi({ example: 2 })
                        })
                    }
                }
            }
        }
    });

    registry.registerPath({
        method: "get",
        path: "/api/devices/{id}",
        summary: "Get device by ID",
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) })
        },
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
            method: "patch",
            path: "/api/devices/{id}",
            summary: "[ADMIN] Update a device",
            description: `Cập nhật thông tin thiết bị.
            \n- Nếu là **SENSOR**: Có thể cập nhật 'unit' và 'threshold'.
            \n- Nếu là **ACTUATOR**: Có thể cập nhật 'customerId' để đổi người sở hữu.`,
            tags: ["Hardware"],
            security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Device ID" }) })
        },
        responses: { 201: { description: "Delete request submitted" } }
    });

    registry.registerPath({
        method: "post",
        path: "/api/devices/{id}/request-update",
        summary: "[CUSTOMER] Submit an update request",
        description: `Người dùng gửi yêu cầu thay đổi thông tin thiết bị (ví dụ: đổi tên, đổi ngưỡng cảnh báo). 
        \nNội dung thay đổi nên được ghi rõ trong trường 'content' hoặc 'note'.`,
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
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

    const addDeviceRequestSchema = registry.register("AddDeviceRequest", z.object({
        serial: z.string().min(1, "Serial is required").openapi({ example: "SN-TEMP-999" }),
        deviceType: z.enum(["SENSOR", "ACTUATOR"]).openapi({ example: "SENSOR" }),
        status: z.enum(["ONLINE", "OFFLINE", "DISCONNECTED"]).optional().openapi({ example: "ONLINE" }),
        deviceName: z.string().optional().openapi({ example: "Bedroom Sensor" }),
        locationId: z.string().optional().openapi({ example: "loc-123" }),
        unit: z.string().optional().openapi({ example: "°C" }),
        threshold: z.number().optional().openapi({ example: 35 }),
        note: z.string().optional().openapi({ example: "Cần lắp ở phòng ngủ" })
    }));

    registry.registerPath({
        method: "post",
        path: "/api/devices/request-add",
        summary: "[CUSTOMER] Submit an add request",
        description: `Gửi yêu cầu thêm thiết bị mới. 
        \n- Nếu là **SENSOR**: Cần nhập thêm 'unit' và 'threshold'.
        \n- Nếu là **ACTUATOR**: Các trường 'unit' và 'threshold' sẽ bị bỏ qua.`,
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: addDeviceRequestSchema
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
        security: [{ bearerAuth: [] }],
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

    registry.registerPath({
        method: "post",
        path: "/api/sensors/{id}/sync-telemetry",
        summary: "[CUSTOMER] Sync historical telemetry data",
        description: `Đồng bộ dữ liệu cảm biến (nhiệt độ, độ ẩm, gas...) từ ThingsBoard về Database local để vẽ biểu đồ.
        \n- Hệ thống sẽ tự động khám phá các loại dữ liệu thiết bị đang có.
        \n- Mặc định lấy dữ liệu trong 24 giờ qua nếu không truyền tham số 'hours'.`,
        tags: ["Hardware"],
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({ id: z.string().openapi({ description: "Sensor Device ID" }) }),
            query: z.object({
                hours: z.string().optional().openapi({ 
                    description: "Số giờ muốn lấy dữ liệu ngược về quá khứ",
                    example: "24" 
                })
            })
        },
        responses: {
            200: {
                description: "Telemetry synced successfully",
                content: {
                    "application/json": {
                        schema: z.object({
                            count: z.number().openapi({ description: "Số lượng bản ghi dữ liệu đã được lưu", example: 150 })
                        })
                    }
                }
            }
        }
    });
}