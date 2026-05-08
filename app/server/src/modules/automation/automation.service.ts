import { automationRepo } from "./automation.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, Frequency } from "@prisma/client";
import cron from "node-cron";
import { actuatorService } from "../hardware/actuator.service";
import { hardwareRepo } from "../hardware/hardware.repository";

export class AutomationService {
  private schedulerStarted = false;
  
  async init() {
    if (this.schedulerStarted)
      return

    cron.schedule("* * * * *", async () => {
      await this.executeSchedules();
    });

    this.schedulerStarted = true;
  }

  async createSchedule(customerId: string, data: {
    actuatorId: string;
    action: string;
    startTime?: string;
    duration?: number;
    frequency?: Frequency;
  }) {
    const device = await hardwareRepo.getDeviceById(data.actuatorId)
    if (!device || device.deviceType !== "ACTUATOR")
      throw new HttpError(404, "Actuator not found")

    if (device.actuator?.customerId && device.actuator.customerId !== customerId) 
      throw new HttpError(403, "You do not have permission to schedule this actuator")
    
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
      const nowUTC = new Date();
      const hh = nowUTC.getUTCHours();
      const mm = nowUTC.getUTCMinutes();

      const schedules = await automationRepo.getAllSchedules(hh, mm, nowUTC.getUTCDay());

      for (const schedule of schedules) {
        if (!schedule.startTime) continue;

        const scheduleTime = new Date(schedule.startTime);

        let shouldExecute = false;

        if (schedule.frequency === "ONCE") {
          const diffMs = nowUTC.getTime() - scheduleTime.getTime();
          if (diffMs >= 0 && diffMs < 60000) {
            shouldExecute = true;
          }
        } else if (schedule.frequency === "DAILY") {
          if (scheduleTime.getUTCHours() === hh && scheduleTime.getUTCMinutes() === mm) {
            shouldExecute = true;
          }
        } else if (schedule.frequency === "WEEKLY") {
          if (scheduleTime.getDay() === nowUTC.getUTCDay() && scheduleTime.getUTCHours() === hh && scheduleTime.getUTCMinutes() === mm) {
            shouldExecute = true;
          }
        }

        if (shouldExecute) {
          console.log(`Executing schedule ${schedule.scheduleId}: ${schedule.action} on actuator ${schedule.actuatorId}`);
          try {
            if (schedule.frequency === "ONCE") {
              await automationRepo.deleteSchedule(schedule.scheduleId);
              await actuatorService.controlActuator(schedule.actuatorId, schedule.action as "ON" | "OFF", schedule.customerId);
            }

            if (schedule.duration && schedule.action === "ON") {
              setTimeout(async () => {
                try {
                  await actuatorService.controlActuator(schedule.actuatorId, "OFF", schedule.customerId)
                  console.log(`Auto-OFF executed for actuator ${schedule.actuatorId}`)
                } catch (err) {
                  console.error(`Auto-OFF after duration failed for ${schedule.actuatorId}:`, err)
                }
              }, schedule.duration * 60 * 1000)
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