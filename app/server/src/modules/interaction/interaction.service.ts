import { interactionRepo } from "./interaction.repository";
import { hardwareRepo } from "../hardware/hardware.repository";
import { sendRpcCommand } from "../../config/tb-api";
import { HttpError } from "@/common/app-error";
import { DeviceType } from "@prisma/client";

export class InteractionService {
  async checkThresholdAndAlert(deviceId: string, dataType: string, value: number, threshold: number) {
    if (value > threshold) {
      console.warn(`[ALERT] Threshold exceeded for device ${deviceId}! ${dataType} value: ${value} > ${threshold}`);

      // 1. Trigger Buzzer via RPC (Real Device Control)
      const triggeringDevice = await interactionRepo.getDeviceOwner(deviceId);
      if (triggeringDevice?.locationId) {
        // Find an actuator in the same location that acts as a buzzer/alarm
        const devicesInLocation = await hardwareRepo.getDevices({
          locationId: triggeringDevice.locationId,
          deviceType: DeviceType.ACTUATOR
        });

        const buzzer = devicesInLocation.find(d =>
          d.deviceName?.toLowerCase().includes("buzzer") ||
          d.deviceName?.toLowerCase().includes("alarm")
        );

        if (buzzer) {
          try {
            await sendRpcCommand(buzzer.tbDeviceId, "setBuzzer", { action: "ON" });
            console.log(`[RPC] Triggered Buzzer (${buzzer.deviceName}) for alert in location ${triggeringDevice.locationId}`);
          } catch (rpcErr: any) {
            console.error(`[RPC ERROR] Failed to trigger buzzer: ${rpcErr.message}`);
          }
        } else {
          console.log(`[INFO] No buzzer found in location ${triggeringDevice.locationId} to alert.`);
        }
      }

      // 2. Create Notification in DB
      let targetUserId = triggeringDevice?.actuator?.customerId;

      if (!targetUserId && triggeringDevice?.locationId) {
        // If sensor has no direct owner, find the owner of any actuator in the same location
        const actuatorsInLocation = await hardwareRepo.getDevices({
          locationId: triggeringDevice.locationId,
          deviceType: DeviceType.ACTUATOR
        });
        targetUserId = actuatorsInLocation.find(a => a.actuator?.customerId)?.actuator?.customerId;
      }

      if (targetUserId) {
        try {
          await interactionRepo.createNotification({
            title: `Cảnh báo an toàn - ${dataType}`,
            content: `Giá trị đo được là ${value}, vượt ngưỡng cho phép là ${threshold}`,
            isRead: false,
            user: { connect: { userId: targetUserId } },
            device: { connect: { deviceId } }
          });
          console.log(`Saved notification to database for user ${targetUserId}.`);
        } catch (err) {
          console.error("Failed to save notification:", err);
        }

        // 3. Push Notification
        console.log(`[PUSH NOTIFICATION] Sent to user ${targetUserId}: Cảnh báo ${dataType} vượt ngưỡng!`);
      } else {
        console.warn(`[WARN] Could not find a target user for notification for device ${deviceId}`);
      }
    }
  }

  async getNotifications(userId: string, isRead?: boolean) {
    return interactionRepo.getNotificationsByUser(userId, isRead);
  }

  async markAsRead(notiId: string, userId: string) {
    const noti = await interactionRepo.getNotificationById(notiId);
    if (!noti || noti.userId !== userId)
      throw new HttpError(404, "Notification not found");

    return interactionRepo.markAsRead(notiId);
  }
}

export const interactionService = new InteractionService();