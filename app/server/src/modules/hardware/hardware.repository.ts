import { prisma } from "../../config/prisma";
import { Prisma, DeviceType } from "@prisma/client";

export class HardwareRepository {
  async createDevice(data: Prisma.DeviceCreateInput) {
    return prisma.device.create({ data });
  }

  async getDevices(filters?: { locationId?: string; deviceType?: DeviceType }, userId?: string, role?: string) {
    const where: any = { ...filters };

    // Nếu là CUSTOMER, chỉ lấy những thiết bị mà họ sở hữu
    // (Hiện tại chỉ có Actuator là có customerId)
    if (role === "CUSTOMER" && userId) {
      where.actuator = { customerId: userId };
    }

    return prisma.device.findMany({
      where,
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

  async getDeviceByTbId(tbDeviceId: string) {
    return prisma.device.findMany({
      where: { tbDeviceId },
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

  async createSensorData(data: Prisma.DataCreateInput) {
    return prisma.data.create({ data });
  }

  async createManySensorData(data: Prisma.DataCreateManyInput[]) {
    return prisma.data.createMany({
      data,
      skipDuplicates: true,
    });
  }
}

export const hardwareRepo = new HardwareRepository();