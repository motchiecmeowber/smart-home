import { Router } from "express";
import { automationController } from "./automation.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const automationRouter = Router();

automationRouter.post("/schedules", authMiddleware, roleMiddleware("CUSTOMER"), automationController.createSchedule);
automationRouter.get("/schedules", authMiddleware, roleMiddleware("CUSTOMER"), automationController.getSchedules);
automationRouter.get("/schedules/:id", authMiddleware, roleMiddleware("CUSTOMER"), automationController.getScheduleById);
automationRouter.patch("/schedules/:id", authMiddleware, roleMiddleware("CUSTOMER"), automationController.updateSchedule);
automationRouter.delete("/schedules/:id", authMiddleware, roleMiddleware("CUSTOMER"), automationController.deleteSchedule);

export { automationRouter };