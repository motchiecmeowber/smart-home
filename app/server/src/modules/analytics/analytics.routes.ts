import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";

const analyticsRouter = Router();

// Customer
analyticsRouter.get("/chart", authMiddleware, roleMiddleware("CUSTOMER"), analyticsController.getChartData);
analyticsRouter.post("/generate-report", authMiddleware, roleMiddleware("CUSTOMER"), analyticsController.generateReport);
analyticsRouter.get("/reports", authMiddleware, roleMiddleware("CUSTOMER"), analyticsController.getReport);
analyticsRouter.get("/reports/:id", authMiddleware, roleMiddleware("CUSTOMER"), analyticsController.getReportById);

export { analyticsRouter };