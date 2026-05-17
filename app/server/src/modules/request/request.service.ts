import { requestRepo } from "./request.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, RequestType, RequestStatus } from "@prisma/client";
import { deviceService } from "../hardware/device.service";

export class RequestService {
  async deleteRequest(id: string) {
    const existing = await requestRepo.getRequestById(id);
    if (!existing) {
      throw new HttpError(404, "Request not found");
    }
    if (existing.status !== "PENDING") {
      throw new HttpError(400, "Cannot delete a request that has already been reviewed");
    }
    return requestRepo.deleteRequest(id);
  }
  async createRequest(customerId: string, data: {
    content?: string;
    requestType: RequestType;
    serial?: string;
    deviceId?: string;
    note?: string;
  }) {
    const createData: Prisma.RequestCreateInput = {
      content: data.content,
      requestType: data.requestType,
      serial: data.serial,
      note: data.note,
      status: "PENDING",
      customer: { connect: { userId: customerId } }
    };

    if (data.deviceId) {
      createData.device = { connect: { deviceId: data.deviceId } };
    }

    return requestRepo.createRequest(createData);
  }

  async getRequests(filters?: { customerId?: string; adminId?: string; status?: RequestStatus }) {
    return requestRepo.getRequests(filters);
  }

  async getRequestById(id: string, user: { userId: string, role: string }) {
    const req = await requestRepo.getRequestById(id);
    if (!req) {
      throw new HttpError(404, "Request not found");
    }

    if (user.role === "CUSTOMER" && req.customerId !== user.userId)
      throw new HttpError(403, "Forbidden");
    
    return req;
  }

  async updateRequestStatus(id: string, status: RequestStatus, adminId: string, note?: string) {
    const existing = await requestRepo.getRequestById(id);
    if (!existing) {
      throw new HttpError(404, "Request not found");
    }

    if (status === "APPROVED" && existing.requestType === "DELETE") {
      if (!existing.deviceId) {
        throw new HttpError(400, "Cannot approve DELETE request: deviceId is missing");
      }
      try {
        await deviceService.removeDevice(existing.deviceId);
      } catch (err: any) {
        throw new HttpError(500, `Failed to remove device: ${err.message}`);
      }
    }

    return requestRepo.updateRequestStatus(id, status, note, adminId);
  }
}

export const requestService = new RequestService();