import { Request, Response, NextFunction } from "express";
import { requestService } from "./request.service";
import { getRequestsQueryDto, updateRequestStatusDto } from "./request.dto";
import { sendSuccess } from "../../common/app-error";

export class RequestController {
  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = getRequestsQueryDto.parse(
        req.query
      );

      const { userId, role } = req as any; 
      if (role === "CUSTOMER") filters.customerId = userId;

      const requests = await requestService.getRequests(filters);
      return sendSuccess(res, 200, requests);
    } catch (error) {
      next(error);
    }
  }

  async getRequestById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const { userId, role } = req as any;
      const user = { userId, role };

      const requestEntity = await requestService.getRequestById(id, user);
      return sendSuccess(res, 200, requestEntity);
    } catch (error) {
      next(error);
    }
  }

  async updateRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = updateRequestStatusDto.parse(req.body);
      const adminId = (req as any).userId;

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