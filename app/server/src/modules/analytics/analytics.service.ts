import { HttpError } from "@/common/app-error";
import { analyticsRepo } from "./analytics.repository";
import { DataType, DeviceType, ReportType, Role } from "@prisma/client";
import { hardwareRepo } from "../hardware/hardware.repository";
import { sensorService } from "../hardware/sensor.service";

interface GroupedData {
  values: any[],
  sensorId: string,
  dataType: DataType
}

export class AnalyticsService {
  async generateReport(customerId: string, data: { reportType: ReportType, targetTime?: string, startTime?: string, endTime?: string }) {
    const { reportType, targetTime, startTime, endTime } = data;
    let actualStartTime: Date;
    let actualEndTime: Date;
    const now = new Date();

    // time normalization
    if (reportType === ReportType.CUSTOM) {
      if (!startTime || !endTime) {
        throw new HttpError(400, "CUSTOM report requires startTime and endTime");
      }

      actualStartTime = new Date(startTime);
      actualEndTime = new Date(endTime);

      if (actualEndTime.getTime() - actualStartTime.getTime() > 31 * 24 * 60 * 60 * 1000) {
        throw new HttpError(400, "CUSTOM report range cannot exceed 31 days");
      }
    } else {
      // Sử dụng new Date(now) để tạo bản sao độc lập, tránh đột biến (mutation) đối tượng "now" gốc
      const referenceDate = targetTime ? new Date(targetTime) : new Date(now.getTime());

      if (reportType === ReportType.DAILY) {
        actualStartTime = new Date(referenceDate.setUTCHours(0, 0, 0, 0));
        actualEndTime = new Date(referenceDate.setUTCHours(23, 59, 59, 999));
      }
      else if (reportType === ReportType.WEEKLY) {
        const day = referenceDate.getUTCDay();
        const diffToMonday = referenceDate.getUTCDate() - day + (day === 0 ? -6 : 1);

        actualStartTime = new Date(referenceDate.setUTCDate(diffToMonday));
        actualEndTime = new Date(actualStartTime);
        actualEndTime.setUTCDate(actualStartTime.getUTCDate() + 6);

        actualStartTime.setUTCHours(0, 0, 0, 0);
        actualEndTime.setUTCHours(23, 59, 59, 999);
      }
      // reportType === ReportType.MONTHLY
      else {
        // new Date (y, m, d) create date w local time => use Date.UTC ensure data integrity
        actualStartTime = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1));
        actualEndTime = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth() + 1, 0));

        actualEndTime.setUTCHours(23, 59, 59, 999);
      }

      if (actualEndTime! > now) {
        actualEndTime = now;
      }
    }

    // fetch raw data
    const devices = await hardwareRepo.getMyDevices({ deviceType: DeviceType.SENSOR }, customerId, Role.CUSTOMER);
    const sensorIds = devices.map(device => device.deviceId);

    if (sensorIds.length === 0) {
      return { message: "No sensors found for this customer, no report generated" };
    }

    const durationHours = Math.ceil((actualEndTime.getTime() - actualStartTime.getTime()) / (1000 * 60 * 60));
    await Promise.all(sensorIds.map(id => sensorService.syncTelemetry(id, undefined, durationHours)));

    const rawData = await hardwareRepo.getSensorDataInRange(sensorIds, actualStartTime.toISOString(), actualEndTime.toISOString());
    const groupedData: Record<string, GroupedData> = {};

    // statistics
    for (const data of rawData) {
      const key = `${data.sensorId}_${data.dataType}`;

      if (!groupedData[key]) {
        groupedData[key] = {
          values: [],
          sensorId: data.sensorId,
          dataType: data.dataType
        };
      }

      groupedData[key].values.push(data.value);
    }

    // calculate
    const summaryItems = [];
    for (const key in groupedData) {
      const group = groupedData[key];
      const vals = group.values;
      if (vals.length === 0) continue;

      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

      summaryItems.push({
        sensorId: group.sensorId,
        metricName: `${group.dataType}_MIN`,
        value: min
      });

      summaryItems.push({
        sensorId: group.sensorId,
        metricName: `${group.dataType}_MAX`,
        value: max
      });

      summaryItems.push({
        sensorId: group.sensorId,
        metricName: `${group.dataType}_AVG`,
        value: avg
      });
    }

    const report = await analyticsRepo.createReport({
      reportType,
      startTime: actualStartTime,
      endTime: actualEndTime,
      customer: {
        connect: { userId: customerId }
      },
      summaryData: {
        create: summaryItems
      }
    });

    return report;
  }

  async getReports(filters?: { reportType?: ReportType, startDate?: string, endDate?: string }, customerId?: string, role?: string) {

    return analyticsRepo.getReports(filters, customerId, role);
  }

  async getReportById(reportId: string, user: { userId: string, role: string }) {
    const report = await analyticsRepo.getReportById(reportId);
    if (!report) return null;

    if (user && user.role === Role.CUSTOMER) {
      if (report.customerId !== user.userId) {
        throw new HttpError(403, "Forbidden: You do not own this report");
      }
    }

    return report;
  }

  async getChartData(user: { userId: string, role: string }, sensorId: string, startTime: string, endTime: string, bucketTimes: number) {
    // validate
    if (user && user.role === Role.CUSTOMER) {
      const device = await hardwareRepo.getDeviceById(sensorId);
      if (!device || device.deviceType !== DeviceType.SENSOR || device.sensor?.customerId !== user.userId) {
        throw new HttpError(403, "Forbidden: You do not have permission to access this sensor");
      }
    }
    
    const durationHours = Math.ceil((new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60));
    await sensorService.syncTelemetry(sensorId as string, undefined, durationHours);

    const rawData = await hardwareRepo.getSensorDataInRange([sensorId], startTime, endTime);
    if (!rawData) return null;
    if (rawData.length === 0) return { sensorId, points: [], metricName: null };

    const metricName = rawData[0].dataType;
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const bucketWidth = duration / bucketTimes;

    // group data into buckets
    const buckets = [];
    for (let i = 0; i < bucketTimes; i++) {
      const bucketTime = new Date(new Date(startTime).getTime() + (i + 0.5) * bucketWidth);
      buckets.push({
        sum: 0,
        count: 0,
        timestamp: bucketTime
      });
    }

    //  push data into buckets
    for (const data of rawData) {
      const dataTime = new Date(data.timestamp).getTime();
      const diffFromStart = dataTime - new Date(startTime).getTime();
      let bucketIndex = Math.floor(diffFromStart / bucketWidth);

      if (bucketIndex >= bucketTimes) bucketIndex = bucketTimes - 1;
      if (bucketIndex < 0) bucketIndex = 0;

      buckets[bucketIndex].sum += data.value!;
      buckets[bucketIndex].count += 1;
    }

    // compute chart points
    const chartPoints = buckets.filter(b => b.count > 0)
      .map(b => ({
        timestamp: b.timestamp,
        value: Math.round((b.sum / b.count) * 100) / 100
      }));

    return {
      sensorId,
      metricName,
      points: chartPoints
    }
  }
}

export const analyticsService = new AnalyticsService();