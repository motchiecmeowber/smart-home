import nodemailer from "nodemailer";
import { env } from "../../config/env";

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmailAlert(to: string, subject: string, htmlContent: string) {
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn("[WARNING] SMTP is not configured. Email alert skipped.");
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"Smart Home System" <${env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[EMAIL] Alert sent to ${to}. Message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error("[EMAIL ERROR] Failed to send email alert:", error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();