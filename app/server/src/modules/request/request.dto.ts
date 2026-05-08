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

export const getRequestsQueryDto = z.object({
  customerId: z.string().optional(),
  adminId: z.string().optional(),
  status: z.enum(RequestStatus).optional(),
}).openapi("GetRequestsQuery");