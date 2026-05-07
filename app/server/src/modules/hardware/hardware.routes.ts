import { Router } from "express";
import { hardwareController } from "./hardware.controller";

const hardwareRouter = Router();

hardwareRouter.post("/devices", hardwareController.addDevice);
hardwareRouter.get("/devices", hardwareController.getDevices);
hardwareRouter.get("/devices/:id", hardwareController.getDeviceById);
hardwareRouter.patch("/devices/:id", hardwareController.updateDevice);
hardwareRouter.post("/actuators/:id/control", hardwareController.controlActuator);

// Admin
hardwareRouter.delete("/devices/:id", hardwareController.deleteDevice);

// Customer
hardwareRouter.post("/devices/:id/request-delete", hardwareController.requestDeleteDevice);

export { hardwareRouter };