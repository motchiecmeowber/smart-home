import { z } from "zod";
import { RequestType, RequestStatus } from "@prisma/client";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const createRequestDto = z.object({
  content: z.string().optional(),
  requestType: z.enum(RequestType),
  serial: z.string().optional(),
  deviceId: z.string().optional(),
  note: z.string().optional(),
}).openapi("CreateRequest");

export const updateRequestStatusDto = z.object({
  status: z.enum(RequestStatus),
  note: z.string().optional(),
}).openapi("UpdateRequestStatus");

export const deleteRequestDto = z.object({
  requestId: z.string(),
}).openapi("DeleteRequest");