import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
  UserDetailResponse,
  UpdateProfileRequest,
} from "./identity.dto";
import { IdentityRepository } from "./identity.repository";
import { RefreshTokenRepository } from "./refreshToken.repository";
import { parseIdentifier } from "@/utils/identity.helper";
import { redisClient } from "@/config/redis";
import { REDIS_KEYS } from "@/config/redis.keys";

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60;
const MAX_DEVICES = 5;

export class IdentityService {
  private repository: IdentityRepository;
  private refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.repository = new IdentityRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async register(data: RegisterRequest): Promise<UserResponse> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.repository.findUserByEmail(data.email),
      this.repository.findUserByUsername(data.userName),
    ]);
    if (existingEmail) {
      throw new Error("Email đã được đăng ký");
    }
    if (existingUsername) {
      throw new Error("Tên người dùng đã được sử dụng");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.repository.createCustomer({
      email: data.email,
      username: data.userName,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    /**
     * Support Rate Limiting (5 attempts, block for 15 minutes)
     * Supoort Multiple Device Login (max 5 devices, revoke oldest if exceed)
     */
    const identifier = parseIdentifier(data.identifier);
    const loginAttemptsKey = REDIS_KEYS.loginAttempts(identifier.value);

    const attempts = await redisClient.get(loginAttemptsKey);
    if (attempts && parseInt(attempts) >= MAX_LOGIN_ATTEMPTS) {
      throw new Error("Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.");
    }

    const user = identifier.type === "email"
      ? await this.repository.findUserByEmail(identifier.value)
      : await this.repository.findUserByUsername(identifier.value);

    if (!user) {
      await redisClient.multi()
      .incr(loginAttemptsKey)
      .expire(loginAttemptsKey, BLOCK_DURATION)
      .exec();
      throw new Error("Thông tin đăng nhập không chính xác");
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      await redisClient.multi()
      .incr(loginAttemptsKey)
      .expire(loginAttemptsKey, BLOCK_DURATION)
      .exec();
      throw new Error("Thông tin đăng nhập không chính xác");
    }
    await redisClient.del(loginAttemptsKey);

    const activeTokens = await this.refreshTokenRepository.findActiveByUserId(user.userId);
    if (activeTokens.length >= MAX_DEVICES) {
      await this.refreshTokenRepository.revokeToken(activeTokens[0].token); // ensure: orderby createdAt asc -> idx 0 is the oldest
    }

    const tokens = this.generateTokens({ userId: user.userId, role: user.role });
    const decoded = jwt.decode(tokens.refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await this.refreshTokenRepository.saveToken({
      userId: user.userId,
      token: tokens.refreshToken,
      expiresAt: expiresAt,
    });

    const userResponse: UserResponse = {
      userId: user.userId,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      role: user.role,
    };

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userResponse,
    };
  }
  
  async logout(accessToken: string, refreshToken: string): Promise<void> {
    const decoded = jwt.decode(accessToken) as { exp: number };
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisClient.set(REDIS_KEYS.blacklist(accessToken), "true", { EX: ttl });
      }
    }
    
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error("Mật khẩu hiện tại không chính xác");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.repository.updateUser(userId, { password: hashedNewPassword });
  }

  async forgotPassword(email: string): Promise<void> {
      // TBD: Enable this feature in the future if needed (Using gmail service to send reset password email with token)
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
      };

      const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);
      if (!storedToken || storedToken.revoked) {
        throw new Error("Refresh token không hợp lệ hoặc đã bị thu hồi");
      }

      const user = await this.repository.findUserById(decoded.userId);

      if (!user) {
        throw new Error("User không tồn tại");
      }

      const accessToken = jwt.sign({ userId: user.userId, role: user.role }, env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
      });

      const userResponse: UserResponse = {
        userId: user.userId,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
        role: user.role,
      };

      return {
        accessToken,
        refreshToken: storedToken.token,
        user: userResponse,
      };
    } catch {
      throw new Error("Refresh token không hợp lệ");
    }
  }

  async validateToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as {
        userId: string;
      };
      return decoded;
    } catch {
      throw new Error("Token không hợp lệ hoặc đã hết hạn");
    }
  }

  private generateTokens(payload: { userId: string, role: string }) {
    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  }

  async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }

    const update = await this.repository.updateUser(userId, data);
    
    return {
      userId: update.userId,
      email: update.email,
      username: update.username,
      createdAt: update.createdAt,
      role: update.role
    };
  }

  async getUsers(): Promise<UserDetailResponse[]> {
    return this.repository.getUsers();
  }

  async getUserById(userId: string): Promise<UserDetailResponse | null> {
    return this.repository.getUserById(userId);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error("User không tồn tại");
    }

    await this.repository.deleteUser(userId);
  }
}