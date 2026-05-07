import { Request, Response, NextFunction } from "express";
import { requestService } from "./request.service";
import { createRequestDto, updateRequestStatusDto } from "./request.dto";
import { sendSuccess } from "../../common/app-error";
import { RequestStatus } from "@prisma/client";

export class RequestController {
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createRequestDto.parse(req.body);
      const customerId = (req as any).user?.userId;

      const requestEntity = await requestService.createRequest(customerId, data);
      return sendSuccess(res, 201, requestEntity, "Request created successfully");
    } catch (error) {
      next(error);
    }
  }

  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId, adminId, status } = req.query;
      const filters: any = {};
      if (customerId) filters.customerId = String(customerId);
      if (adminId) filters.adminId = String(adminId);
      if (status) filters.status = String(status) as RequestStatus;

      const requests = await requestService.getRequests(filters);
      return sendSuccess(res, 200, requests);
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const requestEntity = await requestService.getRequestById(id);
      return sendSuccess(res, 200, requestEntity);
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = updateRequestStatusDto.parse(req.body);
      const adminId = (req as any).user?.userId;

      const requestEntity = await requestService.updateRequestStatus(id, data.status, adminId, data.note);
      return sendSuccess(res, 200, requestEntity, "Request status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async deleteRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const requestEntity = await requestService.deleteRequest(id);
      return sendSuccess(res, 200, requestEntity, "Request deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();