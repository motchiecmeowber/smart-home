import { Router } from "express";
import { interactionController } from "./interaction.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const interactionRouter = Router();

interactionRouter.get("/notifications", authMiddleware, interactionController.getNotifications);
interactionRouter.patch("/notifications/:id/read", authMiddleware, interactionController.markAsRead);

export { interactionRouter };