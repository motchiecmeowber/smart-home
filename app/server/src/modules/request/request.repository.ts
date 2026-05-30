import { prisma } from "../../config/prisma";
import { Prisma, RequestStatus, RequestType } from "@prisma/client";

export class RequestRepository {
  async createRequest(data: Prisma.RequestCreateManyInput[]) {
    return prisma.request.createMany({ data });
  }

  async getRequests(whereClause: { customerId?: string; status?: RequestStatus; requestType?: RequestType }, skip: number, take: number) {
    return prisma.request.findMany({
      where: whereClause,
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
      select: {
        requestId: true,
        content: true,
        requestType: true,
        status: true,
        createdAt: true,
        note: true,
        customerId: true,
        batchId: true,
        customer: {
          select: {
            user: {
              select: {
                username: true,
                email: true,
              }
            }
          }
        },
        device: {
          select: {
            deviceName: true,
            serial: true,
            status: true,
            deviceType: true,
            location: true,
          }
        }
      },
    });
  }

  async countRequests(whereClause: { customerId?: string; status?: RequestStatus; requestType?: RequestType }) {
    return prisma.request.count({
      where: whereClause
    })
  }

  async getRequestById(requestId: string) {
    return prisma.request.findUnique({ 
      where: { requestId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              }
            }
          }
        },
        admin: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
              }
            }
          }
        },
        device: true,
      }
    });
  }

  async getRequestsByIds(requestIds: string[]) {
    return prisma.request.findMany({
      where: {
        requestId: {
          in: requestIds
        }
      }
    })
  }

  async updateRequestStatus(requestId: string, status: RequestStatus) {
    return prisma.request.update({
      where: { requestId },
      data: {
        status,
      }
    });
  }

  async deleteRequest(requestId: string) {
    return prisma.request.delete({
      where: { requestId }
    });
  }
};