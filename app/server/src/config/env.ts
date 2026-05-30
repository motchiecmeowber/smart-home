import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.url({ message: "DATABASE_URL phải là một URL hợp lệ" }),
  REDIS_URL: z.url({ message: "REDIS_URL phải là một URL hợp lệ" }).default("redis://localhost:6379"),
  REDIS_PASSWORD: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(10, { message: "JWT_ACCESS_SECRET phải có ít nhất 10 ký tự" }),
  JWT_REFRESH_SECRET: z.string().min(10, { message: "JWT_REFRESH_SECRET phải có ít nhất 10 ký tự" }),

  THINGSBOARD_HOST: z.string().default("thingsboard.cloud"),
  THINGSBOARD_USERNAME: z.email({ message: "THINGSBOARD_USERNAME must be a valid email" }),
  THINGSBOARD_PASSWORD: z.string().min(1, { message: "THINGSBOARD_PASSWORD is required" }),
  THINGSBOARD_API_TOKEN: z.string().optional(),

  TB_TELEMETRY_TEMPERATURE: z.string().default("temperature"),
  TB_TELEMETRY_HUMIDITY: z.string().default("humidity"),
  TB_TELEMETRY_GAS: z.string().default("gas_value"),

  TB_RPC_SET_TEMP_LED: z.string().default("setTempLed"),
  TB_RPC_SET_HUMI_LED: z.string().default("setHumiLed"),
  TB_RPC_GET_TEMP_LED: z.string().default("getTempLed"),
  TB_RPC_GET_HUMI_LED: z.string().default("getHumiLed"),
  TB_RPC_SET_BUZZER: z.string().default("setBuzzer"),
  TB_RPC_GET_BUZZER: z.string().default("getBuzzer"),

  // SMTP Gmail
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.email({ message: "SMTP_USER must be a valid email" }).optional(),
  SMTP_PASS: z.string().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Lỗi Cấu Hình Biến Môi Trường (.env):");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1); 
}

export const env = _env.data;
export type Env = z.infer<typeof envSchema>;