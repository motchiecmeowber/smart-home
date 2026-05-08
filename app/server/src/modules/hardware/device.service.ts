import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, DeviceType, DeviceStatus } from "@prisma/client";

export class DeviceService {
  async addDevice(data: {
    serial: string;
    tbDeviceId: string;
    deviceName?: string;
    deviceType: DeviceType;
    status?: DeviceStatus;
    locationId?: string;
    unit?: string;
    threshold?: number;
    customerId?: string;
  }) {
    const existing = await hardwareRepo.getDeviceBySerial(data.serial);
    if (existing) {
      throw new HttpError(400, "Device with this serial already exists");
    }

    const createData: Prisma.DeviceCreateInput = {
      serial: data.serial,
      tbDeviceId: data.tbDeviceId,
      deviceName: data.deviceName,
      deviceType: data.deviceType,
      status: data.status,
    };

    if (data.locationId) {
      createData.location = { connect: { locationId: data.locationId } };
    }

    if (data.deviceType === "SENSOR") {
      createData.sensor = {
        create: {
          unit: data.unit,
          threshold: data.threshold,
        },
      };
    } else if (data.deviceType === "ACTUATOR") {
      createData.actuator = {
        create: {
          customerId: data.customerId,
        },
      };
    }

    return hardwareRepo.createDevice(createData);
  }

  async getDevices(filters?: { locationId?: string; deviceType?: DeviceType }) {
    return hardwareRepo.getDevices(filters);
  }

  async getDeviceById(deviceId: string) {
    return hardwareRepo.getDeviceById(deviceId);
  }

  async updateDevice(deviceId: string, data: any) {
    const existing = await hardwareRepo.getDeviceById(deviceId);
    if (!existing) {
      throw new HttpError(404, "Device not found");
    }

    const updateData: Prisma.DeviceUpdateInput = {
      deviceName: data.deviceName,
      status: data.status,
    };

    if (data.locationId) {
      updateData.location = { connect: { locationId: data.locationId } };
    }

    if (existing.deviceType === "SENSOR" && (data.unit !== undefined || data.threshold !== undefined)) {
      updateData.sensor = {
        update: {
          unit: data.unit,
          threshold: data.threshold,
        },
      };
    } else if (existing.deviceType === "ACTUATOR" && data.customerId !== undefined) {
      updateData.actuator = {
        update: {
          customerId: data.customerId,
        },
      };
    }

    return hardwareRepo.updateDevice(deviceId, updateData);
  }

  async removeDevice(deviceId: string) {
    const existing = await hardwareRepo.getDeviceById(deviceId);
    if (!existing) {
      throw new HttpError(404, "Device not found");
    }
    return hardwareRepo.deleteDevice(deviceId);
  }
}

export const deviceService = new DeviceService();