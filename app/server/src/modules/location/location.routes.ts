import { Router } from "express";
import { locationController } from "./location.controller";

const locationRouter = Router();

locationRouter.post("/locations", locationController.addLocation);
locationRouter.get("/locations", locationController.getLocations);
locationRouter.patch("/locations/:id", locationController.updateLocation);
locationRouter.delete("/locations/:id", locationController.removeLocation);

export { locationRouter };