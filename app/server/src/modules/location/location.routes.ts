import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";
import { locationController } from "./location.controller";

const locationRouter = Router();

locationRouter.post("/locations", authMiddleware, roleMiddleware("CUSTOMER"), locationController.addLocation);
locationRouter.get("/locations", authMiddleware, roleMiddleware("CUSTOMER"), locationController.getLocations);
locationRouter.patch("/locations/:id", authMiddleware, roleMiddleware("CUSTOMER"), locationController.updateLocation);
locationRouter.delete("/locations/:id", authMiddleware, roleMiddleware("CUSTOMER"), locationController.removeLocation);

export { locationRouter };