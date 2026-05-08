import { prisma } from "../../config/prisma";
import { Prisma, DeviceType } from "@prisma/client";

export class HardwareRepository {
  async createDevice(data: Prisma.DeviceCreateInput) {
    return prisma.device.create({ data });
  }

  async getDevices(filters?: { locationId?: string; deviceType?: DeviceType }) {
    return prisma.device.findMany({
      where: filters,
      include: {
        sensor: true,
        actuator: true,
        location: true,
      },
    });
  }

  async getDeviceById(deviceId: string) {
    return prisma.device.findUnique({
      where: { deviceId },
      include: {
        sensor: true,
        actuator: true,
      },
    });
  }

  async getDeviceBySerial(serial: string) {
    return prisma.device.findUnique({
      where: { serial },
      include: {
        sensor: true,
        actuator: true,
      },
    });
  }

  async updateDevice(deviceId: string, data: Prisma.DeviceUpdateInput) {
    return prisma.device.update({
      where: { deviceId },
      data,
    });
  }

  async deleteDevice(deviceId: string) {
    return prisma.device.delete({
      where: { deviceId },
    });
  }
}

export const hardwareRepo = new HardwareRepository();