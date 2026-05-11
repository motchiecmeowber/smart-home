import { hardwareRepo } from "./hardware.repository";
import { getDeviceTelemetry, getDeviceTelemetryKeys } from "../../config/tb-api";
import { DataType, DeviceType } from "@prisma/client";

export class SensorService {
  async syncTelemetry(deviceId: string, keys?: string[], hours = 24) {
    const device = await hardwareRepo.getDeviceById(deviceId);
    if (!device || !device.tbDeviceId || device.deviceType !== DeviceType.SENSOR) return { count: 0 };

    let targetKeys = keys || [];
    if (targetKeys.length === 0) {
      targetKeys = await getDeviceTelemetryKeys(device.tbDeviceId);
    }

    if (targetKeys.length === 0) return { count: 0 };

    const endTs = Date.now();
    const startTs = endTs - hours * 60 * 60 * 1000;

    const tbTelemetry = await getDeviceTelemetry(device.tbDeviceId, targetKeys, startTs, endTs);
    
    const dataToCreate: any[] = [];
    for (const [key, values] of Object.entries(tbTelemetry)) {
      const dataType = this.mapTbKeyToDataType(key);
      if (!dataType) continue;

      for (const item of values) {
        dataToCreate.push({
          timestamp: new Date(item.ts),
          sensorId: deviceId,
          dataType: dataType,
          value: parseFloat(item.value.toString()),
        });
      }
    }

    if (dataToCreate.length > 0) {
      await hardwareRepo.createManySensorData(dataToCreate);
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