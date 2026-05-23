import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export class InteractionRepository {
  async createNotification(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  }

  async getNotificationsByUser(userId: string, isRead?: boolean) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(isRead !== undefined ? { isRead } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getNotificationById(notiId: string) {
    return prisma.notification.findUnique({ where: { notiId }})
  }

  async markAsRead(notiId: string) {
    return prisma.notification.update({
      where: { notiId },
      data: { isRead: true },
    });
  }

  async getDeviceOwner(deviceId: string) {
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        actuator: { include: { customer: true } },
        sensor: true,
        location: true
      }
    });

    return device;
  }
}

export const interactionRepo = new InteractionRepository();