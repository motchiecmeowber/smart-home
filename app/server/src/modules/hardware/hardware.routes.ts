import { Router } from "express";
import { hardwareController } from "./hardware.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const hardwareRouter = Router();

hardwareRouter.get("/devices/available", authMiddleware, hardwareController.getAvailableDevices);
hardwareRouter.get("/devices/my-devices", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.getMyDevices);

// Admin
hardwareRouter.get("/devices", authMiddleware, roleMiddleware("ADMIN"), hardwareController.getAllDevices);
hardwareRouter.post("/devices/sync", authMiddleware, roleMiddleware("ADMIN"), hardwareController.syncDevices);
hardwareRouter.delete("/devices/:id", authMiddleware, roleMiddleware("ADMIN"), hardwareController.deleteDevice);
hardwareRouter.patch("/devices/:id", authMiddleware, roleMiddleware("ADMIN"), hardwareController.updateDevice);

// Customer
hardwareRouter.post("/actuators/:id/control", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.controlActuator);
hardwareRouter.patch("/sensors/:id/threshold", authMiddleware, roleMiddleware("CUSTOMER"), hardwareController.updateThreshold);

hardwareRouter.get("/devices/:id", authMiddleware, hardwareController.getDeviceById); // This api may overide others with same path, so put it at the end of all get request

export { hardwareRouter };