import { automationRepo } from "./automation.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, Frequency } from "@prisma/client";
import cron from "node-cron";
import { actuatorService } from "../hardware/actuator.service";

export class AutomationService {
  constructor() {
    cron.schedule("* * * * *", async () => {
      await this.executeSchedules();
    });
  }

  async createSchedule(customerId: string, data: {
    actuatorId: string;
    action: string;
    startTime?: string;
    duration?: number;
    frequency?: Frequency;
  }) {
    const createData: Prisma.ScheduleCreateInput = {
      action: data.action,
      duration: data.duration,
      frequency: data.frequency,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      customer: { connect: { userId: customerId } },
      actuator: { connect: { deviceId: data.actuatorId } },
    };

    return automationRepo.createSchedule(createData);
  }

  async getSchedules(customerId: string) {
    return automationRepo.getSchedulesByCustomer(customerId);
  }

  async getScheduleById(scheduleId: string, customerId: string) {
    const schedule = await automationRepo.getScheduleById(scheduleId);
    if (!schedule || schedule.customerId !== customerId) {
      throw new HttpError(404, "Schedule not found");
    }
    return schedule;
  }

  async updateSchedule(scheduleId: string, customerId: string, data: any) {
    const existing = await automationRepo.getScheduleById(scheduleId);
    if (!existing || existing.customerId !== customerId) {
      throw new HttpError(404, "Schedule not found or you don't have permission");
    }

    const updateData: Prisma.ScheduleUpdateInput = {
      action: data.action,
      duration: data.duration,
      frequency: data.frequency,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
    };

    return automationRepo.updateSchedule(scheduleId, updateData);
  }

  async deleteSchedule(scheduleId: string, customerId: string) {
    const existing = await automationRepo.getScheduleById(scheduleId);
    if (!existing || existing.customerId !== customerId) {
      throw new HttpError(404, "Schedule not found or you don't have permission");
    }

    return automationRepo.deleteSchedule(scheduleId);
  }

  private async executeSchedules() {
    try {
      const schedules = await automationRepo.getAllSchedules();
      const now = new Date();

      for (const schedule of schedules) {
        if (!schedule.startTime) continue;

        const scheduleTime = new Date(schedule.startTime);

        let shouldExecute = false;

        if (schedule.frequency === "ONCE") {
          const diffMs = now.getTime() - scheduleTime.getTime();
          if (diffMs >= 0 && diffMs < 60000) {
            shouldExecute = true;
          }
        } else if (schedule.frequency === "DAILY") {
          if (scheduleTime.getHours() === now.getHours() && scheduleTime.getMinutes() === now.getMinutes()) {
            shouldExecute = true;
          }
        } else if (schedule.frequency === "WEEKLY") {
          if (scheduleTime.getDay() === now.getDay() && scheduleTime.getHours() === now.getHours() && scheduleTime.getMinutes() === now.getMinutes()) {
            shouldExecute = true;
          }
        }

        if (shouldExecute) {
          console.log(`Executing schedule ${schedule.scheduleId}: ${schedule.action} on actuator ${schedule.actuatorId}`);
          try {
            await actuatorService.controlActuator(schedule.actuatorId, schedule.action as "ON" | "OFF", schedule.customerId);

            if (schedule.frequency === "ONCE") {
              await automationRepo.deleteSchedule(schedule.scheduleId);
            }
          } catch (error) {
            console.error(`Failed to execute schedule ${schedule.scheduleId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("Error in schedule execution job:", error);
    }
  }
}

export const automationService = new AutomationService();