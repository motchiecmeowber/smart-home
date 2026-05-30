import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";
import { requestController } from "./request.controller";

const requestRouter = Router();

requestRouter.post("/requests/create", authMiddleware, roleMiddleware("CUSTOMER"), requestController.createRequest);
requestRouter.get("/requests", authMiddleware, requestController.getRequests);
requestRouter.get("/requests/:id", authMiddleware, requestController.getRequestById);
requestRouter.patch("/requests/approve-by-ids", authMiddleware, roleMiddleware("ADMIN"), requestController.approveRequestsByIds);
requestRouter.patch("/requests/approve-by-batch", authMiddleware, roleMiddleware("ADMIN"), requestController.approveRequestsByBatch);
requestRouter.patch("/requests/reject-by-ids", authMiddleware, roleMiddleware("ADMIN"), requestController.rejectRequestsByIds);
requestRouter.patch("/requests/reject-by-batch", authMiddleware, roleMiddleware("ADMIN"), requestController.rejectRequestsByBatch);
requestRouter.delete("/requests/:id", authMiddleware, roleMiddleware("ADMIN"), requestController.deleteRequestById);

export { requestRouter };