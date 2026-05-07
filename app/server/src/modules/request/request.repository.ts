import { prisma } from "../../config/prisma";
import { Prisma, RequestStatus } from "@prisma/client";

export const requestRepo = {
  async createRequest(data: Prisma.RequestCreateInput) {
    return prisma.request.create({ data });
  },

  async getRequests(filters?: { customerId?: string; adminId?: string; status?: RequestStatus }) {
    return prisma.request.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        device: true,
      }
    });
  },

  async getRequestById(requestId: string) {
    return prisma.request.findUnique({ 
      where: { requestId },
      include: {
        customer: true,
        device: true,
      }
    });
  },

  async updateRequestStatus(requestId: string, status: RequestStatus, note?: string, adminId?: string) {
    return prisma.request.update({
      where: { requestId },
      data: {
        status,
        note,
        adminId
      }
    });
  },

  async deleteRequest(requestId: string) {
    return prisma.request.delete({
      where: { requestId }
    });
  }
};