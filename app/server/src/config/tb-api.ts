import { env } from "./env";
import { DeviceStatus } from "@prisma/client";
import { redisClient } from "./redis";
import { REDIS_KEYS } from "./redis.keys";

// HELPER: Get Dynamic Token
async function getTbToken(): Promise<string> {
  const cached = await redisClient.get(REDIS_KEYS.tbToken);
  if (cached) return cached;

  console.log("Logging into ThingsBoard to get new token...");
  const res = await fetch(`https://${env.THINGSBOARD_HOST}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: env.THINGSBOARD_USERNAME,
      password: env.THINGSBOARD_PASSWORD,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`ThingsBoard Login Failed -> ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const token = data.token;

  // Cache for 90 minutes
  await redisClient.set(REDIS_KEYS.tbToken, token, { EX: 5400 });

  return token;
}

async function tbHeader(): Promise<Record<string, string>> {
  const token = await getTbToken();
  return {
    "Content-Type": "application/json",
    "X-Authorization": `Bearer ${token}`,
  };
}

function tbUrl(path: string) {
  return `https://${env.THINGSBOARD_HOST}${path}`;
}

async function tbFetch<T = void>(path: string, options: RequestInit): Promise<T> {
  const headers = await tbHeader();
  const res = await fetch(tbUrl(path), {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`ThingsBoard ${options.method ?? "GET"} ${path} -> ${res.status}: ${errorText}`);
  }

  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// RPC
/*
Two-way RPC: wait for device response within timeout
For: read back value from device
*/
export async function sendRpcRequest<T = any>(deviceId: string, method: string, params: Record<string, any>, timeout = 5000)
  : Promise<T> {
  return tbFetch<T>(`/api/rpc/twoway/${deviceId}?timeout=${timeout}`, {
    method: "POST",
    body: JSON.stringify({ method: method, params: params })
  });
}

/*
One-way RPC: BE sends command ----> TB --> DEVICE
Not wait for device response
For: LED control, buzzer trigger
*/
export async function sendRpcCommand(tbDeviceId: string, method: string, params: any) {
  await tbFetch(`/api/rpc/oneway/${tbDeviceId}`, {
    method: "POST",
    body: JSON.stringify({ method, params })
  });
}

// CLIENT ATTRIBUTES
export async function getClientAttributes(
  tbDeviceId: string,
  keys: string[] = ["tempLed", "humiLed"]
): Promise<Record<string, any>> {
  const raw = await tbFetch<{ key: string; value: any }[]>(
    `/api/plugins/telemetry/DEVICE/${tbDeviceId}/values/attributes/CLIENT_SCOPE?keys=${keys.join(",")}`,
    { method: "GET" }
  );
  return Object.fromEntries((raw ?? []).map((a) => [a.key, a.value]));
}

// DEVICES
export async function getDeviceStatus(tbDeviceId: string): Promise<DeviceStatus> {
  try {
    const raw = await tbFetch<{ key: string; value: any }[]>(
      `/api/plugins/telemetry/DEVICE/${tbDeviceId}/values/attributes/SERVER_SCOPE?keys=active`,
      { method: "GET" }
    );
    const activeAttr = raw?.find(a => a.key === "active");
    return activeAttr?.value === true ? DeviceStatus.ONLINE : DeviceStatus.DISCONNECTED;
  } catch {
    return DeviceStatus.DISCONNECTED;
  }
}

export async function getTenantDevices(pageSize = 20, page = 0): Promise<any> {
  return tbFetch<any>(`/api/tenant/devices?pageSize=${pageSize}&page=${page}`, {
    method: "GET",
  });
}

// export async function getCustomerDevices(customerId: string, pageSize = 100, page = 0): Promise<any> {
//   return tbFetch<any>(`/api/customer/${customerId}/devices?pageSize=${pageSize}&page=${page}`, {
//     method: "GET",
//   });
// }

// TELEMETRY
export async function getDeviceTelemetry(
  tbDeviceId: string,
  keys: string[],
  startTs: number,
  endTs: number,
  limit = 1000
): Promise<Record<string, { ts: number; value: any }[]>> {
  const keysStr = keys.join(",");
  const url = `/api/plugins/telemetry/DEVICE/${tbDeviceId}/values/timeseries?keys=${keysStr}&startTs=${startTs}&endTs=${endTs}&limit=${limit}`;
  
  return tbFetch<Record<string, { ts: number; value: any }[]>>(url, {
    method: "GET",
  });
}

export async function getDeviceTelemetryKeys(tbDeviceId: string): Promise<string[]> {
  return tbFetch<string[]>(`/api/plugins/telemetry/DEVICE/${tbDeviceId}/keys/timeseries`, { method: "GET" });
}