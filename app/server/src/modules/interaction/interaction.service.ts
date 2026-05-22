import { interactionRepo } from "./interaction.repository";
import { notificationService } from "./notification.service";
import { hardwareRepo } from "../hardware/hardware.repository";
import { prisma } from "../../config/prisma";
import { HttpError } from "@/common/app-error";
import { DeviceStatus, DeviceType } from "@prisma/client";
import { actuatorService } from "../hardware/actuator.service";
import { redisClient } from "@/config/redis";

export class InteractionService {
  async checkThresholdAndAlert(deviceId: string, dataType: string, value: number, threshold: number) {
    // 1. Trigger Buzzer via RPC (Real Device Control)
    const triggeringDevice = await interactionRepo.getDeviceOwner(deviceId);
    if (triggeringDevice?.locationId) {
      // Find an actuator in the same location that acts as a buzzer/alarm
      const devicesInLocation = await hardwareRepo.getDevices({
        locationId: triggeringDevice.locationId,
        deviceType: DeviceType.ACTUATOR
      });

      const buzzer = devicesInLocation.find(d => d.deviceName?.toLowerCase().includes("buzzer"));
      const safeThreshold = threshold * 0.96; // 4% hysteresis margin
      const locationAlertKey = `location_alerts:${triggeringDevice.locationId}`;

      if (value > safeThreshold) {
        await redisClient.sAdd(locationAlertKey, deviceId);

        if (buzzer) {
          // check if buzzer is manual muted
          try {
            const isMuted = await redisClient.get(`mute:${buzzer.deviceId}`);
            
            if (!isMuted && buzzer.status !== DeviceStatus.ONLINE) {
              const customerId = buzzer.actuator?.customerId || "";
              await actuatorService.controlActuator(buzzer.deviceId, "ON", customerId);
              console.log(`[RPC] Triggered Buzzer (${buzzer.deviceName}) for alert in location ${triggeringDevice.locationId}`);
            } else if (isMuted) {
              console.log(`[ALERT] Buzzer is currently muted by user. Skipping ON command.`);
            }
          } catch (rpcErr: any) {
            console.error(`[RPC ERROR] Failed to trigger buzzer: ${rpcErr.message}`);
          }
        }
      } else if (value <= safeThreshold) {
        await redisClient.sRem(locationAlertKey, deviceId);
        
        const activeAlertsCount = await redisClient.sCard(locationAlertKey);

        if (activeAlertsCount === 0) {
          if (buzzer && buzzer.status === DeviceStatus.ONLINE) {
            // auto-turn off buzzer
            try {
              const customerId = buzzer.actuator?.customerId || "";
              await actuatorService.controlActuator(buzzer.deviceId, "OFF", customerId);
              console.log(`[RPC] Auto-turned OFF Buzzer (${buzzer.deviceName}) as environment is safe (value: ${value} <= ${safeThreshold})`);
            } catch (rpcErr: any) {
              console.error(`[RPC ERROR] Fail to turn off buzzer: ${rpcErr.message}`);
            }
          }
        } else {
          console.log(`[ALERT] Sensor ${deviceId} is safe, but ${activeAlertsCount} other sensor(s) in location ${triggeringDevice.locationId} are still alerting. Buzzer stays ON.`);
        }
      }
    }    

    if (value > threshold) {
      // 2. Cooldown for 15 minutes prevent alert spam
      console.warn(`[ALERT] Threshold exceeded for device ${deviceId}! ${dataType} value: ${value} > ${threshold}`);

      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
      const existingAlert = await prisma.notification.findFirst({
        where: {
          deviceId: deviceId,
          title: `Cảnh báo an toàn - ${dataType}`,
          createdAt: {
            gte: fifteenMinAgo
          }
        }
      });

      if (existingAlert) {
        console.log(`[COOLDOWN] Notification exists, skipped`);
        return;
      }

      // 3. Create Notification in DB
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
            const timeString = new Date().toLocaleTimeString("vi-VN");
            const subject = `[Smart Home] Cảnh báo an toàn - ${dataType} [${timeString}]`;

            const htmlContent = `
              <h3>Hệ thống Smart Home cảnh báo</h3>
              <p>Thiết bị <b>${triggeringDevice?.deviceName ?? "cảm biến"}</b> (Vị trí: <b>${triggeringDevice?.location?.locationName ?? "N/A"}</b>) phát hiện chỉ số <b>${dataType}</b> đạt mức <b>${value}</b>.</p>
              <p>Ngưỡng an toàn thiết lập: <b>${threshold}</b>.</p>
              <p>Vui lòng kiểm tra thiết bị của bạn ngay lập tức!</p>
            `;
            await notificationService.sendEmailAlert(user.email, subject, htmlContent);
            console.log(`[EMAIL] Sent to user ${targetUserId}: Cảnh báo ${dataType} vượt ngưỡng!`);
          }
        } catch (err) {
          console.error("Failed to send email notification:", err);
        }

        // 4. Push Notification
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