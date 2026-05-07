import { locationRepo } from "./location.repository";
import { HttpError } from "../../common/app-error";

export class LocationService {
  async createLocation(data: { locationName: string }) {
    return locationRepo.createLocation(data);
  }

  async getLocations() {
    return locationRepo.getLocations();
  }

  async updateLocation(id: string, data: { locationName?: string }) {
    const existing = await locationRepo.getLocationById(id);
    if (!existing) {
      throw new HttpError(404, "Location not found");
    }
    return locationRepo.updateLocation(id, data);
  }

  async deleteLocation(id: string) {
    const existing = await locationRepo.getLocationById(id);
    if (!existing) {
      throw new HttpError(404, "Location not found");
    }
    return locationRepo.deleteLocation(id);
  }
}

export const locationService = new LocationService();