import { z } from "zod";
import { RequestType, RequestStatus } from "@prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const updateRequestStatusDto = z.object({
  status: z.enum(RequestStatus),
  note: z.string().optional(),
}).openapi("UpdateRequestStatus");

export const deleteRequestDto = z.object({
  requestId: z.string(),
}).openapi("DeleteRequest");

export const getRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
  status: z.enum(RequestStatus).optional(),
  type: z.enum(RequestType).optional()
}).openapi("GetRequestsQuery");

export const createRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  requestType: z.enum(RequestType),
  serial_list: z.array(
    z.string().min(1, "Serial number cannot be empty")
  ).min(1, "At least one serial number is required"),
  content: z.string().optional(),
})

export type createRequestDto = z.infer<typeof createRequestSchema>;
export type getRequestsQueryDto = z.infer<typeof getRequestsQuerySchema>;