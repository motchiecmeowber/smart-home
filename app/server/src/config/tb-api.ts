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

/**
 * Checks if a device exists in ThingsBoard by its ID (UUID)
 */
export async function checkDeviceExists(deviceId: string): Promise<boolean> {
  const host = env.THINGSBOARD_HOST;
  const token = env.THINGSBOARD_API_TOKEN;

  if (!token) {
    console.warn("WARNING: THINGSBOARD_API_TOKEN is missing. Device existence check skipped.");
    throw new Error("ThingsBoard API token missing (503)");
  }

  const url = `https://${host}/api/device/${deviceId}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Authorization": `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking device existence in ThingsBoard:", error);
    return false;
  }
}