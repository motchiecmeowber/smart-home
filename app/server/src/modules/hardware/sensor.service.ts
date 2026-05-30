import { hardwareRepo } from "./hardware.repository";
import { getDeviceTelemetry, getDeviceTelemetryKeys } from "../../config/tb-api";
import { DataType, DeviceType, Role } from "@prisma/client";
import { interactionService } from "../interaction/interaction.service";
import { HttpError } from "@/common/app-error";

export class SensorService {
  async syncTelemetry(deviceId: string, keys?: string[], hours = 24, user?: { userId: string, role: string}) {
    const device = await hardwareRepo.getDeviceById(deviceId);
    if (!device || !device.tbDeviceId || device.deviceType !== DeviceType.SENSOR) return { count: 0 };

    if (user && user.role === Role.CUSTOMER) {
      if (device.sensor?.customerId !== user.userId) {
        throw new HttpError(403, "Forbidden: You do not own this sensor");
      }
    }

    let targetKeys = keys || [];
    if (targetKeys.length === 0) {
      targetKeys = await getDeviceTelemetryKeys(device.tbDeviceId);
    }

    if (targetKeys.length === 0) return { count: 0 };

    const endTs = Date.now();
    const startTs = endTs - hours * 60 * 60 * 1000;

    const tbTelemetry = await getDeviceTelemetry(device.tbDeviceId, targetKeys, startTs, endTs);
    
    const dataToCreate: any[] = [];
    const lastestValues: Record<string, { value: number, timestamp: number }> = {};

    for (const [key, values] of Object.entries(tbTelemetry)) {
      const dataType = this.mapTbKeyToDataType(key);
      if (!dataType) continue;

      const deviceName = device.deviceName?.toLowerCase() || "";
      if (dataType === DataType.TEMPERATURE && !deviceName.includes("temperature")) continue;
      if (dataType === DataType.HUMIDITY && !deviceName.includes("humidity")) continue;
      if (dataType === DataType.GAS && !deviceName.includes("gas")) continue;

      for (const item of values) {
        let numericValues = parseFloat(item.value.toString());
        const timestampMs = item.ts;

        if (dataType === DataType.GAS) {
          numericValues = Math.round((numericValues / 4095) * 100 * 100) / 100;
        }

        dataToCreate.push({
          timestamp: new Date(timestampMs),
          sensorId: deviceId,
          dataType: dataType,
          value: numericValues,
        });

        if (!lastestValues[dataType] || timestampMs > lastestValues[dataType].timestamp) {
          lastestValues[dataType] = {
            timestamp: timestampMs,
            value: numericValues
          }
        }
      }
    }

    if (dataToCreate.length > 0) {
      await hardwareRepo.createManySensorData(dataToCreate);

      const threshold = device.sensor?.threshold;
      if (threshold !== null && threshold !== undefined) {
        for (const [dataType, latest] of Object.entries(lastestValues)) {
          await interactionService.checkThresholdAndAlert(deviceId, dataType, latest.value, threshold);
        }
      }
    }

    return { count: dataToCreate.length };
  }

  private mapTbKeyToDataType(key: string): DataType | null {
    const k = key.toLowerCase();
    if (k.includes("temperature")) return DataType.TEMPERATURE;
    if (k.includes("humidity")) return DataType.HUMIDITY;
    if (k.includes("gas")) return DataType.GAS;
    return null;
  }
}

export const sensorService = new SensorService();