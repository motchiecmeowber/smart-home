import { Router } from "express";
import { automationController } from "./automation.controller";

const automationRouter = Router();

automationRouter.post("/schedules", automationController.createSchedule);
automationRouter.get("/schedules", automationController.getSchedules);
automationRouter.get("/schedules/:id", automationController.getScheduleById);
automationRouter.patch("/schedules/:id", automationController.updateSchedule);
automationRouter.delete("/schedules/:id", automationController.deleteSchedule);

export { automationRouter };