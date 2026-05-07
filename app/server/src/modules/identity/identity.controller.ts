import { Request, Response } from "express";
import {
  LoginRequestSchema,
  RefreshTokenRequestSchema,
  RegisterRequestSchema,
  ChangePasswordRequestSchema,
} from "./identity.dto";
import { IdentityService } from "./identity.service";
import z from "zod";
export class IdentityController {
  constructor(private readonly identityService = new IdentityService()) {}

  register = async (req: Request, res: Response) => {
    const parsed = RegisterRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: z.prettifyError(parsed.error),
      });
    }

    try {
      const result = await this.identityService.register(parsed.data);
      return res.status(201).json({
        message: "Đăng ký thành công",
        data: result,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  login = async (req: Request, res: Response) => {
    const parsed = LoginRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: z.prettifyError(parsed.error),
      });
    }

    try {
      const result = await this.identityService.login(parsed.data);
      
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Gửi qua HTTPS trong production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Đăng nhập thành công",
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });

    } catch (error) {
      return this.handleError(error, res);
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const accessToken = req.headers.authorization?.split(" ")[1];

      if (!accessToken) {
        return res.status(401).json({ message: "Access token không được cung cấp" });
      }
      if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token không được cung cấp" });
      }

      await this.identityService.logout(accessToken, refreshToken);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      return res.status(200).json({ message: "Đăng xuất thành công" });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  changePassword = async (req: Request, res: Response) => {
    const parsed = ChangePasswordRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors: z.prettifyError(parsed.error),
      });
    }

    // Get userId from auth middleware
    const userId = (req as any).userId as string;

    try {
      await this.identityService.changePassword(
        userId,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );
      return res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  forgotPassword = async (req: Request, res: Response) => {
    // TBD: Enable this feature in the future
  }

  refreshToken = async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies?.refreshToken;
    const tokenFromBody = req.body?.refreshToken;
    const token = tokenFromCookie ?? tokenFromBody;

    if (typeof token !== "string") {
        return res.status(400).json({ message: "Refresh token không được cung cấp" });
    }

    try {
      const result = await this.identityService.refreshToken(token);

      return res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      return this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";

    if (message.includes("đã được đăng ký")) {
      return res.status(409).json({ message });
    }

    if (message.includes("không chính xác")) {
      return res.status(401).json({ message });
    }

    if (message.includes("không hợp lệ")) {
      return res.status(400).json({ message });
    }

    if (message.includes("không tồn tại")) {
      return res.status(404).json({ message });
    }

    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
