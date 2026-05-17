import { z } from "zod";
import { DeviceType, DeviceStatus } from "@prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createDeviceDto = z.object({
  serial: z.string().min(1, "Serial is required"),
  tbDeviceId: z.string().min(1, "tbDeviceId is required"),
  deviceName: z.string().optional(),
  deviceType: z.enum(DeviceType),
  status: z.enum(DeviceStatus).optional().default(DeviceStatus.OFFLINE),
  locationId: z.string().optional(),

  // Specific fields
  unit: z.string().optional(),        // Sensor
  threshold: z.number().optional(),   // Sensor
  customerId: z.string().optional(),  // Actuator
}).openapi("CreateDevice");

export const updateDeviceDto = createDeviceDto
  .omit({ serial: true, tbDeviceId: true, deviceType: true })
  .partial()
  .openapi("UpdateDevice");

export const controlActuatorDto = z.object({
  action: z.enum(["ON", "OFF"]),
}).openapi("ControlActuator");

export const updateThresholdDto = z.object({
  threshold: z.number().min(0, "Threshold must be greater than or equal to 0")
}).openapi("UpdateThreshold");