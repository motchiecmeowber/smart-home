import { env } from "./env";

export async function sendRpcCommand(deviceId: string, method: string, params: any) {
  const host = env.THINGSBOARD_HOST;
  const token = env.THINGSBOARD_API_TOKEN;

  if (!token) {
    throw new Error("Missing THINGSBOARD_API_TOKEN in .env");
  }

  const url = `https://${host}/api/rpc/twoway/${deviceId}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      method: method,
      params: params,
      timeout: 5000
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ThingsBoard RPC failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function createDeviceAndGetId(name: string, type: string = "default"): Promise<string> {
  const host = env.THINGSBOARD_HOST;
  const token = env.THINGSBOARD_API_TOKEN;

  if (!token) {
    throw new Error("Missing THINGSBOARD_API_TOKEN in .env");
  }

  const url = `https://${host}/api/device`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name, type })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create device in ThingsBoard: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const tbDeviceId: string = result?.id?.id;

  if (!tbDeviceId) {
    throw new Error("ThingsBoard did not return a device ID in the response");
  }

  return tbDeviceId;
}