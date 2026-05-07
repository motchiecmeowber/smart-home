import { z } from "zod";
import { Frequency } from "@prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createScheduleDto = z.object({
  actuatorId: z.string().min(1, "Actuator ID is required"),
  action: z.string().min(1, "Action is required"),
  startTime: z.iso.datetime().optional(), // ISO 8601 string
  duration: z.number().int().optional(),
  frequency: z.enum(Frequency).optional(),
}).openapi("CreateSchedule");

export const updateScheduleDto = createScheduleDto.partial().openapi("UpdateSchedule");