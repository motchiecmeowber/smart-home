import { Request, Response, NextFunction } from "express";
import { interactionService } from "./interaction.service";
import { sendSuccess } from "../../common/app-error";

export class InteractionController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const isReadParam = req.query.isRead;
      const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
      const notifications = await interactionService.getNotifications(userId, isRead);
      return sendSuccess(res, 200, notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const notification = await interactionService.markAsRead(id);
      return sendSuccess(res, 200, notification, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }
}

export const interactionController = new InteractionController();