import { hardwareRepo } from "./hardware.repository";
import { HttpError } from "../../common/app-error";
import { env } from "../../config/env";
import { sendRpcCommand } from "../../config/tb-api";
import { DeviceStatus, DeviceType } from "@prisma/client";
import { redisClient } from "@/config/redis";

export class ActuatorService {
  async controlActuator(deviceId: string, action: "ON" | "OFF", userId: string, isManual: boolean = false) {
    const device = await hardwareRepo.getDeviceById(deviceId);
    if (!device || device.deviceType !== DeviceType.ACTUATOR) {
      throw new HttpError(404, "Actuator not found");
    }

    if (device.actuator?.customerId && device.actuator.customerId !== userId) {
      throw new HttpError(403, "You do not have permission to control this device");
    }

    if (device.status === DeviceStatus.DISCONNECTED) {
      throw new HttpError(400, "Device is disconnected, cannot control");
    }

    let methodName = env.TB_RPC_SET_TEMP_LED;
    const nameLower = device.deviceName ? device.deviceName.toLowerCase() : "";
    if (nameLower.includes("humi")) {
      methodName = env.TB_RPC_SET_HUMI_LED;
    } else if (nameLower.includes("buzzer")) {
      methodName = env.TB_RPC_SET_BUZZER;
    }

    const value = action === "ON";
    try {
      await sendRpcCommand(device.tbDeviceId, methodName, value);

      const nextStatus = action === "ON" ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
      await hardwareRepo.updateDevice(deviceId, { status: nextStatus });

      if (isManual && nameLower.includes("buzzer")) {
        if (action === "OFF") {
          await redisClient.set(`mute:${deviceId}`, "true", { EX: 300 });
          console.log(`[ACTUATOR] Buzzer manually muted. Snoozing for 5 minutes.`);
        } else if (action === "ON") {
          await redisClient.del(`mute:${deviceId}`);
          console.log(`[ACTUATOR] Buzzer manually turned ON. Cleared mute flag.`);
        }
      }

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