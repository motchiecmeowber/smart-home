import { analyticsRepo } from "./analytics.repository";
import { DataType } from "@prisma/client";

export class AnalyticsService {
  async recordSensorData(deviceId: string, type: DataType, value: number, timestamp: Date = new Date()) {
    return analyticsRepo.createSensorData({
      timestamp,
      dataType: type,
      value: value,
      sensor: { connect: { deviceId } }
    });
  }
}

export const analyticsService = new AnalyticsService();