import { Router } from "express";
import { hardwareController } from "./hardware.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const hardwareRouter = Router();

hardwareRouter.get("/devices", authMiddleware, hardwareController.getDevices);
hardwareRouter.get("/devices/:id", authMiddleware, hardwareController.getDeviceById);

// Admin
hardwareRouter.post("/devices/sync", authMiddleware, roleMiddleware("ADMIN"), hardwareController.syncDevices);
hardwareRouter.delete("/devices/:id", authMiddleware, roleMiddleware("ADMIN"), hardwareController.deleteDevice);
hardwareRouter.patch("/devices/:id", authMiddleware, roleMiddleware("ADMIN"), hardwareController.updateDevice);

// Customer
hardwareRouter.post("/devices/:id/request-delete", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.requestDeleteDevice);
hardwareRouter.post("/devices/:id/request-update", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.requestUpdateDevice);
hardwareRouter.post("/devices/request-add", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.requestAddDevice);
hardwareRouter.post("/actuators/:id/control", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.controlActuator);
hardwareRouter.post("/sensors/:id/sync-telemetry", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.syncSensorTelemetry);
hardwareRouter.patch("/sensors/:id/threshold", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.updateThreshold);

export { hardwareRouter };