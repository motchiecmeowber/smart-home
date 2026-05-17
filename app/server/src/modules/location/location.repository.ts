import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const locationRepo = {
  async createLocation(data: Prisma.LocationCreateInput) {
    return prisma.location.create({ data });
  },
  async getLocations() {
    return prisma.location.findMany();
  },
  async getLocationById(locationId: string) {
    return prisma.location.findUnique({ where: { locationId } });
  },
  async updateLocation(locationId: string, data: Prisma.LocationUpdateInput) {
    return prisma.location.update({ where: { locationId }, data });
  },
  async deleteLocation(locationId: string) {
    return prisma.location.delete({ where: { locationId } });
  }
};