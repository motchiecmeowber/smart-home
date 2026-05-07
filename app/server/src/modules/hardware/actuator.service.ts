import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { env } from "../../config/env";
import { sendRpcCommand } from "../../config/tb-api";


export class ActuatorService {
  async controlActuator(actuatorId: string, action: "ON" | "OFF", userId: string) {
    const device = await hardwareRepo.getDeviceById(actuatorId);
    if (!device || device.deviceType !== "ACTUATOR") {
      throw new HttpError(404, "Actuator not found");
    }

    if (device.actuator?.customerId && device.actuator.customerId !== userId) {
      throw new HttpError(403, "You do not have permission to control this device");
    }

    let methodName = env.TB_RPC_SET_TEMP_LED;
    if (device.deviceName && device.deviceName.toLowerCase().includes("humi")) {
      methodName = env.TB_RPC_SET_HUMI_LED;
    }

    if (!env.THINGSBOARD_API_TOKEN) {
      throw new HttpError(503, "THINGSBOARD_API_TOKEN is missing in .env configuration");
    }

    try {
      await sendRpcCommand(device.tbDeviceId, methodName, { action });
      return { success: true, message: `Sent command ${action} to ${device.deviceName || actuatorId}` };
    } catch (error: any) {
      console.error("ThingsBoard RPC Error:", error.message);
      throw new HttpError(500, `Failed to control device: ${error.message}`);
    }
  }
}

export const actuatorService = new ActuatorService();