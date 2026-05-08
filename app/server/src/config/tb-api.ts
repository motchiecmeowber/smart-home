import { env } from "./env";

// HELPERS
function tbHeader() {
  const token = env.THINGSBOARD_API_TOKEN;
  if (!token)
    throw new Error("Missing THINGSBOARD_API_TOKEN in.env");

  return {
    "Content-Type": "application/json",
    "X-Authorization": `Bearer ${token}`
  }
}

function tbUrl(path: string) {
  return `https://${env.THINGSBOARD_HOST}${path}`;
}

// RPC
export async function sendRpcCommand(deviceId: string, method: string, params: any, timeout = 5000) {
  const response = await fetch(tbUrl(`/api/rpc/twoway/${deviceId}`), {
    method: "POST",
    headers: tbHeader(),
    body: JSON.stringify({
      method: method,
      params: params,
      timeout,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ThingsBoard RPC (twoway) failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

export async function sendRpcCommandOneWay(deviceId: string, method: string, params: any) {
  const response = await fetch(tbUrl(`/api/rpc/oneway/${deviceId}`), {
    method: "POST",
    headers: tbHeader(),
    body: JSON.stringify({
      method: method,
      params: params
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ThingsBoard RPC (oneway) failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}