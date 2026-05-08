import { includes } from "zod";
import { prisma } from "../../config/prisma";
import { Frequency, Prisma } from "@prisma/client";

export class AutomationRepository {
  async createSchedule(data: Prisma.ScheduleCreateInput) {
    return prisma.schedule.create({ data });
  }

  async getSchedulesByCustomer(customerId: string) {
    return prisma.schedule.findMany({
      where: { customerId },
      include: { actuator: true },
    });
  }

  async getScheduleById(scheduleId: string) {
    return prisma.schedule.findUnique({
      where: { scheduleId },
    });
  }

  async updateSchedule(scheduleId: string, data: Prisma.ScheduleUpdateInput) {
    return prisma.schedule.update({
      where: { scheduleId },
      data,
    });
  }

  async deleteSchedule(scheduleId: string) {
    return prisma.schedule.delete({
      where: { scheduleId },
    });
  }

  async getAllSchedules(hour: number, minute: number, day: number) {
    return prisma.schedule.findMany({
      where: { 
        startTime: { not: null },
        OR: [
          { frequency: "DAILY" },
          { frequency: "WEEKLY" },
          { frequency: "ONCE", startTime: { gte: new Date(Date.now() - 60000 )} },
        ]
      },
      include: { actuator: true },
    });
  }
}

export const automationRepo = new AutomationRepository();