import { Router } from "express";
import { interactionController } from "./interaction.controller";

const interactionRouter = Router();

interactionRouter.get("/notifications", interactionController.getNotifications);
interactionRouter.patch("/notifications/:id/read", interactionController.markAsRead);

export { interactionRouter };