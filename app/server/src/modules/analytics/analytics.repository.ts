import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export class AnalyticsRepository {
  async createSensorData(data: Prisma.DataCreateInput) {
    return prisma.data.create({ data });
  }

  // Thêm hàm query data để vẽ biểu đồ
}

export const analyticsRepo = new AnalyticsRepository();