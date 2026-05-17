import { interactionRepo } from "./interaction.repository";
import { notificationService } from "./notification.service";
import { hardwareRepo } from "../hardware/hardware.repository";
import { sendRpcCommand } from "../../config/tb-api";
import { prisma } from "../../config/prisma";
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
      let targetUserId = triggeringDevice?.sensor?.customerId;

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

        try {
          const user = await prisma.user.findUnique({
            where: { userId: targetUserId },
            select: { email: true }
          });

          if (user?.email) {
            const subject = `[Smart Home] Cảnh báo an toàn - ${dataType}`;
            const htmlContent = `
              <h3>Hệ thống Smart Home cảnh báo</h3>
              <p>Thiết bị <b>${triggeringDevice?.deviceName ?? "cảm biến"}</b> (Serial: <b>${triggeringDevice?.serial ?? "N/A"}</b>) phát hiện chỉ số <b>${dataType}</b> đạt mức <b>${value}</b>.</p>
              <p>Ngưỡng an toàn thiết lập: <b>${threshold}</b>.</p>
              <p>Vui lòng kiểm tra thiết bị của bạn ngay lập tức!</p>
            `;
            await notificationService.sendEmailAlert(user.email, subject, htmlContent);
            console.log(`[EMAIL] Sent to user ${targetUserId}: Cảnh báo ${dataType} vượt ngưỡng!`);
          }
        } catch (err) {
          console.error("Failed to send email notification:", err);
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