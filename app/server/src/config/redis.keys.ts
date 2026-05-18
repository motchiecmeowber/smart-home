export const REDIS_KEYS = {
  blacklist: (token: string) => `blacklist:${token}`,

  refreshToken: (token: string) => `refreshToken:${token}`,

  loginAttempts: (identifier: string) => `loginAttempts:${identifier}`,
  tbToken: "tb:token",
};

/**
 * Redis Pub/Sub channels for real-time telemetry streaming.
 * ThingsBoard WS → Publisher → Redis Channel → Subscriber → Client WS
 *
 * Channel is keyed by `deviceId` (BE-generated UUID), NOT tbDeviceId.
 * One physical TB device (tbDeviceId) can map to multiple logical devices
 * (e.g. SN-uuid-TS, SN-uuid-HS, SN-uuid-GS), each with its own channel.
 */
export const REDIS_CHANNELS = {
  telemetry: (deviceId: string) => `telemetry:${deviceId}`,

  telemetryAll: "telemetry:*",
};