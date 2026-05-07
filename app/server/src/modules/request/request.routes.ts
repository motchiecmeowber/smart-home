import { Router } from "express";
import { requestController } from "./request.controller";

const requestRouter = Router();

requestRouter.post("/requests", requestController.createRequest);
requestRouter.get("/requests", requestController.getRequests);
requestRouter.get("/requests/:id", requestController.getRequestById);
requestRouter.patch("/requests/:id/status", requestController.updateRequestStatus);
requestRouter.delete("/requests/:id", requestController.deleteRequestById);

export { requestRouter };