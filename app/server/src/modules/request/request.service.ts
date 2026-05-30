import { RequestRepository } from "./request.repository";
import { HttpError } from "../../common/app-error";
import { Prisma, RequestType, RequestStatus } from "@prisma/client";
import { deviceService } from "../hardware/device.service";
import { interactionRepo } from "../interaction/interaction.repository";
import { IdentityRepository } from "@/modules/identity/identity.repository";
import { createRequestDto } from "./request.dto";
import { HardwareRepository } from "../hardware/hardware.repository";
import { randomUUID } from "crypto";
import { IdentityService } from "@/modules/identity/identity.service";

export class RequestService {
  private requestRepo: RequestRepository;
  private hardwareRepo: HardwareRepository;
  private identityService: IdentityService;

  constructor() {
    this.requestRepo = new RequestRepository();
    this.hardwareRepo = new HardwareRepository();
    this.identityService = new IdentityService();
  }

  async createRequest(customerId: string, data: createRequestDto) {
    const identityRepo = new IdentityRepository();
    const admin = await identityRepo.findAvailableAdmin();
    if (!admin) {
      throw new HttpError(503, "No available admin to handle the request. Please try again later.");
    }

    if (data.requestType === RequestType.UPDATE || data.requestType === RequestType.DELETE) {
      const myDevices = await this.hardwareRepo.getMyDevices({}, customerId, "CUSTOMER");
      const ownedSerials = new Set(myDevices.map(d => d.serial));
      const invalidSerials = data.serial_list.filter(s => !ownedSerials.has(s));
      if (invalidSerials.length > 0) {
        throw new HttpError(400, `You do not own the following devices: ${invalidSerials.join(", ")}`);
      }
    }

    const selectedDevices = await this.hardwareRepo.getDevicesBySerials(data.serial_list);

    if (data.requestType === RequestType.ADD) {
      const alreadyOwnedDevices = selectedDevices.filter(d => d.sensor?.customerId || d.actuator?.customerId);
      if (alreadyOwnedDevices.length > 0) {
        const ownedSerials = alreadyOwnedDevices.map(d => d.serial);
        throw new HttpError(400, `The following devices are already owned by another customer: ${ownedSerials.join(", ")}`);
      }
    }

    if (selectedDevices.length !== data.serial_list.length) {
      const foundSerials = selectedDevices.map(d => d.serial);
      const notFoundSerials = data.serial_list.filter(s => !foundSerials.includes(s));
      throw new HttpError(400, `The following device serials were not found: ${notFoundSerials.join(", ")}`);
    }

    const batchId = randomUUID();

    const dataToCreate: Prisma.RequestCreateManyInput[] = selectedDevices.map(
      device => ({
        content: data.title,
        requestType: data.requestType,
        note: data.content,
        status: RequestStatus.PENDING,
        customerId: customerId,
        adminId: admin.userId,
        deviceId: device.deviceId,
        batchId: batchId,
      })
    )
    return this.requestRepo.createRequest(dataToCreate);
  }

  async deleteRequest(id: string) {
    const existing = await this.requestRepo.getRequestById(id);
    if (!existing) {
      throw new HttpError(404, "Request not found");
    }
    if (existing.status !== "PENDING") {
      throw new HttpError(400, "Cannot delete a request that has already been reviewed");
    }
    return this.requestRepo.deleteRequest(id);
  }

  async getRequests(filters: { userId: string; role: string; page: number; pageSize: number; status?: RequestStatus; type?: RequestType }) {
    const whereClause: { customerId?: string; status?: RequestStatus; requestType?: RequestType } = {};
    if (filters.role === "CUSTOMER") {
      whereClause.customerId = filters.userId;
    }
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.type) {
      whereClause.requestType = filters.type;
    }

    const skip = (filters.page - 1) * filters.pageSize;
    const take = filters.pageSize;

    const [requests, total] = await Promise.all([
      this.requestRepo.getRequests(whereClause, skip, take),
      this.requestRepo.countRequests(whereClause)
    ]);

    return {
      data: requests,
      pagination: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
        totalPages: Math.ceil(total / filters.pageSize),
        hasNextPage:
          filters.page < Math.ceil(total / filters.pageSize),
        hasPrevPage:
          filters.page > 1
      }
    };
  }

  async getRequestById(id: string, user: { userId: string, role: string }) {
    const req = await this.requestRepo.getRequestById(id);
    if (!req) {
      throw new HttpError(404, "Request not found");
    }

    if (user.role === "CUSTOMER" && req.customerId !== user.userId)
      throw new HttpError(403, "Forbidden");

    return req;
  }

  async approveRequestsByIds(list_id: string[]) {
    const requests = await this.requestRepo.getRequestsByIds(list_id);

    if (requests.some(r => !r)) {
      throw new HttpError(404, "One or more requests not found");
    }

    for (const request of requests) {
      if (request.status !== RequestStatus.PENDING) {
        throw new HttpError(400, `This request ${request.requestId} has been processed already`);
      }

      const deviceId = request.deviceId;
      const requestType = request.requestType;

      if (requestType === RequestType.ADD) {
        const device = await deviceService.getDeviceById(deviceId!);
        if (!device) {
          throw new HttpError(404, `Device with ID ${deviceId} not found`);
        }
        if (device.sensor?.customerId || device.actuator?.customerId) {
          throw new HttpError(400, `Device with ID ${deviceId} is already owned by another customer`);
        }
      }

      await this.requestRepo.updateRequestStatus(request.requestId, RequestStatus.APPROVED);

      switch (requestType) {
        case RequestType.ADD:
          await deviceService.assignDeviceToCustomer(deviceId!, request.customerId!);
          break;
        case RequestType.UPDATE:
          break;
        case RequestType.DELETE:
          await deviceService.unassignDeviceFromCustomer(deviceId!);
          break;
        default:
          throw new HttpError(400, `Invalid request type: ${requestType}`);
      }

      if (request.customerId) {
        const customer = await this.identityService.getUserById(request.customerId);
        if (customer) {
          const typeLabel = requestType === RequestType.ADD ? 'thêm'
            : requestType === RequestType.DELETE ? 'gỡ bỏ' : 'cập nhật';
          const title = `Yêu cầu ${typeLabel} thiết bị đã được phê duyệt`;
          const content = `Yêu cầu #${request.requestId} của bạn đã được phê duyệt.`;

          interactionRepo.createNotification({
            title,
            content,
            user: { connect: { userId: request.customerId } },
            ...(deviceId ? { device: { connect: { deviceId } } } : {}),
          }).catch(err => console.error('[NOTI] Failed to create DB notification:', err));
        }
      }
    }
  }

  async approveRequestsByBatch(batchId: string) {
    // TODO: TBD
  }

  async rejectRequestsByIds(list_id: string[]) {
    const requests = await this.requestRepo.getRequestsByIds(list_id);

    if (requests.some(r => !r)) {
      throw new HttpError(404, "One or more requests not found");
    }

    for (const request of requests) {
      if (request.status !== RequestStatus.PENDING) {
        throw new HttpError(400, `This request ${request.requestId} has been processed already`);
      }

      await this.requestRepo.updateRequestStatus(request.requestId, RequestStatus.REJECTED);

      // Gửi thông báo cho customer
      if (request.customerId) {
        const customer = await this.identityService.getUserById(request.customerId);
        if (customer) {
          const requestType = request.requestType;
          const typeLabel = requestType === RequestType.ADD ? 'thêm'
            : requestType === RequestType.DELETE ? 'gỡ bỏ' : 'cập nhật';
          const title = `Yêu cầu ${typeLabel} thiết bị bị từ chối`;
          const content = `Yêu cầu #${request.requestId} của bạn đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.`;

          interactionRepo.createNotification({
            title,
            content,
            user: { connect: { userId: request.customerId } },
            ...(request.deviceId ? { device: { connect: { deviceId: request.deviceId } } } : {}),
          }).catch(err => console.error('[NOTI] Failed to create DB notification:', err));
        }
      }
    }
  }

  async rejectRequestsByBatch(batchId: string) {
    // TODO: TBD
  }
}

export const requestService = new RequestService();