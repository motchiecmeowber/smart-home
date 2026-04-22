import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  DATABASE_URL: z.string().url({ message: "DATABASE_URL phải là một URL hợp lệ" }),

  JWT_SECRET: z.string().min(10, { message: "JWT_SECRET phải có ít nhất 10 ký tự" }),

  THINGSBOARD_HOST: z.string().default("demo.thingsboard.io"),
  THINGSBOARD_PORT: z.string().default("1883"),
  THINGSBOARD_ACCESS_TOKEN: z.string().min(1, { message: "Thiếu ThingsBoard Access Token" }),

  TB_TELEMETRY_TEMPERATURE: z.string().default("temperature"),
  TB_TELEMETRY_HUMIDITY: z.string().default("humidity"),
  TB_TELEMETRY_GAS: z.string().default("gas_value"),

  TB_RPC_SET_TEMP_LED: z.string().default("setTempLed"),
  TB_RPC_SET_HUMI_LED: z.string().default("setHumiLed"),
  TB_RPC_GET_TEMP_LED: z.string().default("getTempLed"),
  TB_RPC_GET_HUMI_LED: z.string().default("getHumiLed"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("Lỗi Cấu Hình Biến Môi Trường (.env):");
  console.error(JSON.stringify(_env.error.format(), null, 2));
  process.exit(1); 
}

export const env = _env.data;