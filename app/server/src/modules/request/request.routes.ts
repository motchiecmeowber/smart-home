import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";
import { requestController } from "./request.controller";

const requestRouter = Router();

requestRouter.get("/requests", authMiddleware, requestController.getRequests);
requestRouter.get("/requests/:id", authMiddleware, requestController.getRequestById);
requestRouter.patch("/requests/:id/status", authMiddleware, roleMiddleware("ADMIN"), requestController.updateRequestStatus);
requestRouter.delete("/requests/:id", authMiddleware, roleMiddleware("ADMIN"), requestController.deleteRequestById);

export { requestRouter };