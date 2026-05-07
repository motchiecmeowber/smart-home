import { Request, Response, NextFunction } from "express";
import { locationService } from "./location.service";
import { createLocationDto, updateLocationDto } from "./location.dto";
import { sendSuccess } from "../../common/app-error";

export class LocationController {
  async addLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createLocationDto.parse(req.body);
      const location = await locationService.createLocation(data);
      return sendSuccess(res, 201, location, "Location added successfully");
    } catch (error) {
      next(error);
    }
  }

  async getLocations(req: Request, res: Response, next: NextFunction) {
    try {
      const locations = await locationService.getLocations();
      return sendSuccess(res, 200, locations);
    } catch (error) {
      next(error);
    }
  }

  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateLocationDto.parse(req.body);
      const id = req.params.id as string;
      const location = await locationService.updateLocation(id, data);
      return sendSuccess(res, 200, location, "Location updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async removeLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const location = await locationService.deleteLocation(id);
      return sendSuccess(res, 200, location, "Location removed successfully");
    } catch (error) {
      next(error);
    }
  }
}

export const locationController = new LocationController();