import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { env } from "../../config/env";
import { sendRpcCommand } from "../../config/tb-api";
import { DeviceType } from "@prisma/client";

export class ActuatorService {
  async controlActuator(deviceId: string, action: "ON" | "OFF", userId: string) {
    const device = await hardwareRepo.getDeviceById(deviceId);
    if (!device || device.deviceType !== DeviceType.ACTUATOR) {
      throw new HttpError(404, "Actuator not found");
    }

    if (device.actuator?.customerId && device.actuator.customerId !== userId) {
      throw new HttpError(403, "You do not have permission to control this device");
    }

    let methodName = env.TB_RPC_SET_TEMP_LED;
    if (device.deviceName && device.deviceName.toLowerCase().includes("humi")) {
      methodName = env.TB_RPC_SET_HUMI_LED;
    }

    const value = action === "ON";
    try {
      await sendRpcCommand(device.tbDeviceId, methodName, value);
      return { 
        success: true, 
        message: `Sent command ${action} (${value}) to ${device.deviceName}`,
        details: { tbDeviceId: device.tbDeviceId, method: methodName, value }
      };
    } catch (error: any) {
      console.error("ThingsBoard RPC Error:", error.message);
      throw new HttpError(500, `Failed to control device: ${error.message}`);
    }
  }
}

export const actuatorService = new ActuatorService();