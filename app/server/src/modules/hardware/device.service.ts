import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, DeviceType, DeviceStatus } from "@prisma/client";
import { getTenantDevices, getClientAttributes, getDeviceStatus } from "../../config/tb-api";

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
          customerId: data.customerId,
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

  async getMyDevices(filters?: { locationId?: string; deviceType?: DeviceType }, userId?: string, role?: string) {
    return hardwareRepo.getMyDevices(filters, userId, role);
  }

  async getAvailableDevices() {
    return hardwareRepo.getAvailableDevices();
  }

  async getAllDevices(filters?: { locationId?: string; deviceType?: DeviceType }) {
    return hardwareRepo.getAllDevices(filters);
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

    if (existing.deviceType === DeviceType.SENSOR && (data.unit !== undefined || data.threshold !== undefined || data.customerId !== undefined)) {
      updateData.sensor = {
        update: {
          unit: data.unit,
          threshold: data.threshold,
          customerId: data.customerId
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

  async assignDeviceToCustomer(deviceId: string, customerId: string) {
    const existing = await hardwareRepo.getDeviceById(deviceId);
    if (!existing) {
      throw new HttpError(404, "Device not found");
    }
    
    if (existing.sensor?.customerId || existing.actuator?.customerId) {
      throw new HttpError(400, "Device is already assigned to another customer");
    }
    if (existing.deviceType === DeviceType.SENSOR) {
      return hardwareRepo.updateDevice(deviceId, {
        sensor: {
          update: {
            customerId,
          },
        },
      });
    } else if (existing.deviceType === DeviceType.ACTUATOR) {
      return hardwareRepo.updateDevice(deviceId, {
        actuator: {
          update: {
            customerId,
          },
        },
      });
    } else {
      throw new HttpError(400, "Invalid device type");
    }
  }

  async unassignDeviceFromCustomer(deviceId: string) {
    const existing = await hardwareRepo.getDeviceById(deviceId);
    if (!existing) {
      throw new HttpError(404, "Device not found");
    }

    if (!existing.sensor?.customerId && !existing.actuator?.customerId) {
      throw new HttpError(400, "Device is not assigned to any customer");
    }

    if (existing.deviceType === DeviceType.SENSOR) {
      return hardwareRepo.updateDevice(deviceId, {
        sensor: {
          update: {
            customerId: null,
          },
        },
      });
    } else if (existing.deviceType === DeviceType.ACTUATOR) {
      return hardwareRepo.updateDevice(deviceId, {
        actuator: {
          update: {
            customerId: null,
          },
        },
      });
    } else {
      throw new HttpError(400, "Invalid device type");
    }
  }

  async removeDevice(deviceId: string) {
    const existing = await hardwareRepo.getDeviceById(deviceId);
    if (!existing) {
      throw new HttpError(404, "Device not found");
    }
    return hardwareRepo.deleteDevice(deviceId);
  }

  async syncDevicesFromThingsBoard() {
    const tbData = await getTenantDevices();
    const tbDevices = tbData.data || [];

    let createdCount = 0;
    for (const tbDevice of tbDevices) {
      const tbId = tbDevice.id.id;
      const tbName = tbDevice.name;

      const [attrs, status] = await Promise.all([
        getClientAttributes(tbId, ["tempLed", "humiLed", "buzzer"]),
        getDeviceStatus(tbId)
      ]);

      const isNetworkConnected = status === DeviceStatus.ONLINE;
      const sensorStatus = isNetworkConnected ? DeviceStatus.ONLINE : DeviceStatus.DISCONNECTED;

      // Xử lý SENSORS
      const tempSerial = `SN-${tbId}-TS`;
      const existingTempSensor = await hardwareRepo.getDeviceBySerial(tempSerial);
      if (!existingTempSensor) {
        await this.addDevice({
          serial: tempSerial,
          tbDeviceId: tbId,
          deviceName: `${tbName} - Temperature`,
          deviceType: DeviceType.SENSOR,
          status: sensorStatus,
          unit: "°C"
        });
        createdCount++;
      } else {
        await this.updateDevice(existingTempSensor.deviceId, { status: sensorStatus });
      }

      const humiSerial = `SN-${tbId}-HS`;
      const existingHumiSensor = await hardwareRepo.getDeviceBySerial(humiSerial);
      if (!existingHumiSensor) {
        await this.addDevice({
          serial: humiSerial,
          tbDeviceId: tbId,
          deviceName: `${tbName} - Humidity`,
          deviceType: DeviceType.SENSOR,
          status: sensorStatus,
          unit: "%"
        });
        createdCount++;
      } else {
        await this.updateDevice(existingHumiSensor.deviceId, { status: sensorStatus });
      }

      const gasSerial = `SN-${tbId}-GS`;
      const existingGasSensor = await hardwareRepo.getDeviceBySerial(gasSerial);
      if (!existingGasSensor) {
        await this.addDevice({
          serial: gasSerial,
          tbDeviceId: tbId,
          deviceName: `${tbName} - Gas`,
          deviceType: DeviceType.SENSOR,
          status: sensorStatus,
          unit: "%"
        });
        createdCount++;
      } else {
        await this.updateDevice(existingGasSensor.deviceId, { status: sensorStatus });
      }

      // Xử lý TempLED
      if (attrs.tempLed !== undefined) {
        const tempLedSerial = `SN-${tbId}-TL`;
        const existingTempLed = await hardwareRepo.getDeviceBySerial(tempLedSerial);

        let tempLedStatus: DeviceStatus = DeviceStatus.DISCONNECTED;
        if (isNetworkConnected) {
          tempLedStatus = String(attrs.tempLed) === "true" ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;  
        }

        if (!existingTempLed) {
          await this.addDevice({
            serial: tempLedSerial,
            tbDeviceId: tbId,
            deviceName: `${tbName} - Temp LED`,
            deviceType: DeviceType.ACTUATOR,
            status: tempLedStatus
          });
          createdCount++;
        } else {
          await this.updateDevice(existingTempLed.deviceId, { status: tempLedStatus });
        }
      }

      // Xử lý HumiLED
      if (attrs.humiLed !== undefined) {
        const humiLedSerial = `SN-${tbId}-HL`;
        const existingHumiLed = await hardwareRepo.getDeviceBySerial(humiLedSerial);

        let humiLedStatus : DeviceStatus = DeviceStatus.DISCONNECTED;
        if (isNetworkConnected) {
          humiLedStatus = String(attrs.humiLed) === "true" ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
        }

        if (!existingHumiLed) {
          await this.addDevice({
            serial: humiLedSerial,
            tbDeviceId: tbId,
            deviceName: `${tbName} - Humi LED`,
            deviceType: DeviceType.ACTUATOR,
            status: humiLedStatus
          });
          createdCount++;
        } else {
          await this.updateDevice(existingHumiLed.deviceId, { status: humiLedStatus });
        }
      }

      // Xử lý Buzzer
      if (attrs.buzzer !== undefined) {
        const buzzerSerial = `SN-${tbId}-B`;
        const existingBuzzer = await hardwareRepo.getDeviceBySerial(buzzerSerial);

        let buzzerStatus : DeviceStatus = DeviceStatus.DISCONNECTED;
        if (isNetworkConnected) {
          buzzerStatus = String(attrs.buzzer) === "true" ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
        }

        if (!existingBuzzer) {
          await this.addDevice({
            serial: buzzerSerial,
            tbDeviceId: tbId,
            deviceName: `${tbName} - Buzzer`,
            deviceType: DeviceType.ACTUATOR,
            status: buzzerStatus
          });
          createdCount++;
        } else {
          await this.updateDevice(existingBuzzer.deviceId, { status: buzzerStatus });
        }
      }
    }

    return { createdCount };
  }
}

export const deviceService = new DeviceService();