import { Request, Response, NextFunction } from "express";
import { automationService } from "./automation.service";
import { createScheduleDto, updateScheduleDto } from "./automation.dto";
import { sendSuccess } from "../../common/app-error";

export class AutomationController {
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createScheduleDto.parse(req.body);
      const userId = (req as any).userId;
      const schedule = await automationService.createSchedule(userId, data);
      return sendSuccess(res, 201, schedule, "Schedule created successfully");
    } catch (error) {
      next(error);
    }
  }

  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const schedules = await automationService.getSchedules(userId);
      return sendSuccess(res, 200, schedules);
    } catch (error) {
      next(error);
    }
  }

  async getScheduleById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;
      const schedule = await automationService.getScheduleById(id, userId);
      return sendSuccess(res, 200, schedule);
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateScheduleDto.parse(req.body);
      const id = req.params.id as string;
      const userId = (req as any).userId;
      const schedule = await automationService.updateSchedule(id, userId, data);
      return sendSuccess(res, 200, schedule, "Schedule updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const userId = (req as any).userId;
      const schedule = await automationService.deleteSchedule(id, userId);
      return sendSuccess(res, 200, schedule, "Schedule deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const automationController = new AutomationController();