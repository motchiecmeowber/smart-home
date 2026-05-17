import z from "zod";
import { ReportType } from "@prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createReportDto = z.object({
    reportType: z.enum(ReportType),
    targetTime: z.iso.datetime().optional(),
    startTime: z.iso.datetime().optional(),
    endTime: z.iso.datetime().optional(),
}).openapi("CreateReport");