import { Request, Response, NextFunction } from "express";
import { deviceService } from "./device.service";
import { actuatorService } from "./actuator.service";
import { createDeviceDto, updateDeviceDto, controlActuatorDto, updateThresholdDto } from "./hardware.dto";
import { sendSuccess, HttpError } from "../../common/app-error";
import { sensorService } from "./sensor.service";
import { DeviceType } from "@prisma/client";

export class HardwareController {
  async addDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createDeviceDto.parse(req.body);
      const device = await deviceService.addDevice(data);
      return sendSuccess(res, 201, device, "Device added successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMyDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { locationId, deviceType } = req.query;
      const userId = (req as any).userId;
      const role = (req as any).role;

      const filters: any = {};
      if (locationId) filters.locationId = String(locationId);
      if (deviceType) filters.deviceType = String(deviceType);

      const devices = await deviceService.getMyDevices(filters, userId, role);
      return sendSuccess(res, 200, devices);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const devices = await deviceService.getAvailableDevices();
      return sendSuccess(res, 200, devices);
    } catch (error) {
      next(error);
    }
  }

  async getAllDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { locationId, deviceType } = req.query;

      const filters: any = {};
      if (locationId) filters.locationId = String(locationId);
      if (deviceType) filters.deviceType = String(deviceType);

      const devices = await deviceService.getAllDevices(filters);
      return sendSuccess(res, 200, devices);
    } catch (error) {
      next(error);
    }
  }

  async getDeviceById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const device = await deviceService.getDeviceById(id);
      if (!device) throw new HttpError(404, "Device not found");
      return sendSuccess(res, 200, device);
    } catch (error) {
      next(error);
    }
  }

  async updateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateDeviceDto.parse(req.body);
      const id = req.params.id as string;
      const device = await deviceService.updateDevice(id, data);
      return sendSuccess(res, 200, device, "Device updated successfully");
    } catch (error) {
      next(error);
    }
  }

  // Admin
  async deleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const device = await deviceService.removeDevice(id);
      return sendSuccess(res, 200, device, "Device removed successfully");
    } catch (error) {
      next(error);
    }
  }

  async syncDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await deviceService.syncDevicesFromThingsBoard();
      return sendSuccess(res, 200, result, `Successfully synced ${result.createdCount} devices from ThingsBoard`);
    } catch (error) {
      next(error);
    }
  }

  async controlActuator(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = controlActuatorDto.parse(req.body);

      const userId = (req as any).userId;

      const result = await actuatorService.controlActuator(id, data.action, userId, true);
      return sendSuccess(res, 200, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  async updateThreshold(req: any, res: Response, next: NextFunction) {
    try {
      const sensorId = req.params.id;
      const { threshold } = updateThresholdDto.parse(req.body);
      const customerId = (req as any).userId;
      const device = await deviceService.getDeviceById(sensorId);

      if (!device || device.deviceType !== DeviceType.SENSOR) {
        throw new HttpError(404, "Sensor not found");
      }

      if (device.sensor?.customerId !== customerId) {
        throw new HttpError(403, "Forbidden: You do not own this sensor");
      }

      const updated = await deviceService.updateDevice(sensorId, { threshold });
      await sensorService.syncTelemetry(sensorId);

      return sendSuccess(res, 200, updated, "Sensor threshold updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const hardwareController = new HardwareController();