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
  return `http://${env.THINGSBOARD_HOST}/api${path}`;
}

// RPC
export async function sendRpcCommand(deviceId: string, method: string, params: any) {
  const host = env.THINGSBOARD_HOST;
  const token = env.THINGSBOARD_API_TOKEN;

  if (!token) {
    throw new Error("Missing THINGSBOARD_API_TOKEN in .env");
  }

  const response = await fetch(tbUrl(`/rpc/twoway/${deviceId}`), {
    method: "POST",
    headers: tbHeader(),
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