import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { createScheduleDto, updateScheduleDto } from "@/modules/automation/automation.dto";

export function registerAutomationDocs(registry: OpenAPIRegistry){
    registry.registerPath({
        method: "post",
        path: "/api/schedules",
        summary: "[CUSTOMER] Create a schedule",
        description: `Tạo lịch trình điều khiển thiết bị tự động.
        \n**Các loại Tần suất (Frequency):**
        \n- **ONCE**: Chạy một lần duy nhất vào thời điểm 'startTime' rồi tự xóa.
        \n- **DAILY**: Lặp lại hàng ngày vào đúng Giờ:Phút của 'startTime'.
        \n- **WEEKLY**: Lặp lại hàng tuần vào đúng Thứ và Giờ:Phút của 'startTime'.
        \n**Lưu ý:** Nếu có 'duration', thiết bị sẽ tự động TẮT sau số phút tương ứng.`,
        tags: ["Automation"],
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Success" } }
    });

    registry.registerPath({
        method: "get",
        path: "/api/schedules/{id}",
        summary: "[CUSTOMER] Get schedule by ID",
        tags: ["Automation"],
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
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
        security: [{ bearerAuth: [] }],
        request: { params: z.object({ id: z.string().openapi({ description: "Schedule ID" }) }) },
        responses: { 200: { description: "Deleted successfully" } }
    });
}