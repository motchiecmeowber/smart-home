import { z } from "zod";

const EmailSchema = z.email("Email không hợp lệ");
const UsernameSchema = z
  .string()
  .min(2, "Tên người dùng phải có ít nhất 2 ký tự")
  .max(30, "Tên người dùng không được vượt quá 30 ký tự")
  .regex(/^[a-zA-Z0-9_]+$/, "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới");
const IdentifierSchema = z
  .string()
  .min(1, "Email hoặc tên người dùng là bắt buộc")
  .refine((value) => {
    return EmailSchema.safeParse(value).success || UsernameSchema.safeParse(value).success;
  }, "Phải là email hoặc tên người dùng hợp lệ");

// Request DTOs
export const LoginRequestSchema = z.object({
  identifier: IdentifierSchema,
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const RegisterRequestSchema = z.object({
  email: z.email("Email không hợp lệ"),
  userName: z.string().min(2, "Tên người dùng phải có ít nhất 2 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  firstName: z.string().min(1, "Tên phải có ít nhất 1 ký tự"),
  lastName: z.string().min(1, "Họ phải có ít nhất 1 ký tự"),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token là bắt buộc"),
});

export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(6, "Mật khẩu hiện tại phải có ít nhất 6 ký tự"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

// Response DTOs
export const UserResponseSchema = z.object({
  userId: z.string(),
  email: z.string(),
  username: z.string(),
  createdAt: z.date(),
  role: z.string(),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserResponseSchema,
});

// Type Exports
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
