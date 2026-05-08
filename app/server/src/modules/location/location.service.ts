import { locationRepo } from "./location.repository";
import { HttpError } from "../../common/app-error";
import { hardwareRepo } from "../hardware/hardware.repository";

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

    const devicesInLocation = await hardwareRepo.getDevices({ locationId: id });
    if (devicesInLocation.length > 0) {
      throw new HttpError(400, `Cannot delete location: ${devicesInLocation.length} device(s) still assigned`)
    }
    
    return locationRepo.deleteLocation(id);
  }
}

export const locationService = new LocationService();