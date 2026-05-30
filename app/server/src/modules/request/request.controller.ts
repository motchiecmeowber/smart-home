import { Request, Response, NextFunction } from "express";
import { requestService } from "./request.service";
import { createRequestSchema, getRequestsQuerySchema, updateRequestStatusDto } from "./request.dto";
import { sendSuccess } from "../../common/app-error";

export class RequestController {
  async createRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).userId;
      const data = createRequestSchema.parse(req.body);

      const requestEntity = await requestService.createRequest(customerId, data);

      return sendSuccess(res, 201, requestEntity, "Request created successfully");
    } catch (error) {
      next(error);
    }
  }

  async getRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const cleanQueries = getRequestsQuerySchema.parse(
        req.query
      );
      const { userId, role } = req as any; 
      const filters = {
        ...cleanQueries,
        userId: userId,
        role: role
      }

      const requests = await requestService.getRequests(filters);
      return sendSuccess(res, 200, requests);
    } catch (error) {
      next(error);
    }
  }

  async approveRequestsByIds(req: Request, res: Response, next: NextFunction) {
    try {
      const { list_id } = req.body;

      await requestService.approveRequestsByIds(list_id);
      return sendSuccess(res, 200, null, "Requests approved successfully");
    } catch (error) {
      next(error);
    }
  }

  async approveRequestsByBatch(req: Request, res: Response, next: NextFunction) {
    // TODO: TBD
  }

  async rejectRequestsByIds(req: Request, res: Response, next: NextFunction) {
    try {
      const { list_id } = req.body;

      await requestService.rejectRequestsByIds(list_id);
      return sendSuccess(res, 200, null, "Requests rejected successfully");
    } catch (error) {
      next(error);
    }
  }

  async rejectRequestsByBatch(req: Request, res: Response, next: NextFunction) {
    // TODO: TBD
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