import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, DeviceType, DeviceStatus } from "@prisma/client";
import { getTenantDevices, getClientAttributes, getDeviceStatus } from "../../config/tb-api";
import { prisma } from "../../config/prisma";

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
      status: data.status || DeviceStatus.ONLINE,
    };

    if (data.locationId) {
      createData.location = { connect: { locationId: data.locationId } };
    }

    if (data.deviceType === DeviceType.SENSOR) {
      createData.sensor = {
        create: {
          unit: data.unit,
          threshold: data.threshold,
        },
      };
    } else if (data.deviceType === DeviceType.ACTUATOR) {
      createData.actuator = {
        create: {
          customerId: data.customerId,
        },
      };
    }

    return hardwareRepo.createDevice(createData);
  }

  async getDevices(filters?: { locationId?: string; deviceType?: DeviceType }, userId?: string, role?: string) {
    return hardwareRepo.getDevices(filters, userId, role);
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

    if (existing.deviceType === DeviceType.SENSOR && (data.unit !== undefined || data.threshold !== undefined)) {
      updateData.sensor = {
        update: {
          unit: data.unit,
          threshold: data.threshold,
        },
      };
    } else if (existing.deviceType === DeviceType.ACTUATOR && data.customerId !== undefined) {
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

  async syncDevicesFromThingsBoard(userId: string) {
    await prisma.customer.upsert({
      where: { userId },
      create: { userId },
      update: {}
    });

    const tbData = await getTenantDevices();
    const tbDevices = tbData.data || [];

    let createdCount = 0;
    for (const tbDevice of tbDevices) {
      const tbId = tbDevice.id.id;
      const tbName = tbDevice.name;

      const [attrs, status] = await Promise.all([
        getClientAttributes(tbId, ["tempLed", "humiLed"]),
        getDeviceStatus(tbId)
      ]);

      // Xử lý SENSORS
      const sensorSerial = `SN-${tbId}-S`;
      const existingSensor = await hardwareRepo.getDeviceBySerial(sensorSerial);
      if (!existingSensor) {
        await this.addDevice({
          serial: sensorSerial,
          tbDeviceId: tbId,
          deviceName: `${tbName} - Sensors`,
          deviceType: DeviceType.SENSOR,
          status: status,
          unit: "value",
          customerId: userId
        });
        createdCount++;
      } else {
        await this.updateDevice(existingSensor.deviceId, { status });
      }

      // Xử lý TempLED
      if (attrs.tempLed !== undefined) {
        const tempLedSerial = `SN-${tbId}-TL`;
        const existingTempLed = await hardwareRepo.getDeviceBySerial(tempLedSerial);
        if (!existingTempLed) {
          await this.addDevice({
            serial: tempLedSerial,
            tbDeviceId: tbId,
            deviceName: `${tbName} - Temp LED`,
            deviceType: DeviceType.ACTUATOR,
            status: status,
            customerId: userId
          });
          createdCount++;
        } else {
          await this.updateDevice(existingTempLed.deviceId, { status });
        }
      }

      // Xử lý HumiLED
      if (attrs.humiLed !== undefined) {
        const humiLedSerial = `SN-${tbId}-HL`;
        const existingHumiLed = await hardwareRepo.getDeviceBySerial(humiLedSerial);
        if (!existingHumiLed) {
          await this.addDevice({
            serial: humiLedSerial,
            tbDeviceId: tbId,
            deviceName: `${tbName} - Humi LED`,
            deviceType: DeviceType.ACTUATOR,
            status: status,
            customerId: userId
          });
          createdCount++;
        } else {
          await this.updateDevice(existingHumiLed.deviceId, { status });
        }
      }
    }

    return { createdCount };
  }
}

export const deviceService = new DeviceService();