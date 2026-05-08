import { Request, Response, NextFunction } from "express";
import { deviceService } from "./device.service";
import { actuatorService } from "./actuator.service";
import { createDeviceDto, updateDeviceDto, controlActuatorDto } from "./hardware.dto";
import { requestService } from "../request/request.service";
import { sendSuccess, HttpError } from "../../common/app-error";

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

  async getDevices(req: Request, res: Response, next: NextFunction) {
    try {
      const { locationId, deviceType } = req.query;
      const filters: any = {};
      if (locationId) filters.locationId = String(locationId);
      if (deviceType) filters.deviceType = String(deviceType);

      const devices = await deviceService.getDevices(filters);
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

  // Customer
  async requestDeleteDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const deviceId = req.params.id as string;
      const customerId = (req as any).userId;
      
      const existing = await deviceService.getDeviceById(deviceId);
      if (!existing)
        throw new HttpError(404, "Device not found");

      const request = await requestService.createRequest(customerId, {
        requestType: "DELETE",
        deviceId,
        serial: existing?.serial,
        content: `Request to delete device: ${existing?.deviceName ?? deviceId}`,
      });
      return sendSuccess(res, 201, request, "Delete request submitted, awaiting admin approval");
    } catch (error) {
      next(error);
    }
  }

  async requestAddDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).userId;
      const { serial, note } = req.body;

      const requestEntity = await requestService.createRequest(customerId, {
        requestType: "ADD",
        serial,
        content: `Request to add device with serial: ${serial}`,
        note,
      });

      return sendSuccess(res, 201, requestEntity, "Request created successfully");
    } catch (error) {
      next(error);
    }
  }

  async requestUpdateDevice(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).userId;
      const deviceId = req.params.id as string;

      const existing = await deviceService.getDeviceById(deviceId);
      if (!existing)
        throw new HttpError(404, "Device not found");

      const { note, content } = req.body;
      const request = await requestService.createRequest(customerId, {
        content: content ?? `Request to update device: ${existing.deviceName ?? deviceId}`,
        requestType: "UPDATE",
        deviceId,
        serial: existing.serial,
        note,
      });

      return sendSuccess(res, 201, request, "Update request submitted, awaiting admin approval");
    } catch (err) {
      next(err);
    }
  }

  async controlActuator(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = controlActuatorDto.parse(req.body);

      const userId = (req as any).userId;

      const result = await actuatorService.controlActuator(id, data.action, userId);
      return sendSuccess(res, 200, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const hardwareController = new HardwareController();