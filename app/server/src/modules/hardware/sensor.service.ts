import { hardwareRepo } from "./hardware.repository";
import { DataType } from "@prisma/client";
import { interactionService } from "../interaction/interaction.service";
import { analyticsService } from "../analytics/analytics.service";

export class SensorService {
  async saveTelemetry(serial: string, data: Record<string, any>) {
    const device = await hardwareRepo.getDeviceBySerial(serial);
    if (!device || device.deviceType !== "SENSOR") {
      console.warn(`Ignored telemetry for unknown or non-sensor serial: ${serial}`);
      return;
    }

    const timestamp = new Date();

    const metrics: { type: DataType; value: number }[] = [];

    if (data.temperature !== undefined) {
      metrics.push({ type: "TEMPERATURE", value: Number(data.temperature) });
    }
    if (data.humidity !== undefined) {
      metrics.push({ type: "HUMIDITY", value: Number(data.humidity) });
    }
    if (data.gas_value !== undefined) {
      metrics.push({ type: "GAS", value: Number(data.gas_value) });
    }

    for (const metric of metrics) {
      await analyticsService.recordSensorData(device.deviceId, metric.type, metric.value, timestamp);

      if (device.sensor?.threshold !== null && device.sensor?.threshold !== undefined) {
        await interactionService.checkThresholdAndAlert(device.deviceId, metric.type, metric.value, device.sensor.threshold);
      }
    }
  }
}

export const sensorService = new SensorService();