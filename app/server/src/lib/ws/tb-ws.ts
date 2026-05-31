import WebSocket from "ws";
import { env } from "@/config/env";
import { redisClient } from "@/config/redis";
import { REDIS_KEYS } from "@/config/redis.keys";
import { REDIS_CHANNELS } from "@/config/redis.keys";
import { getDeviceTelemetryKeys } from "@/config/tb-api";

type TbAgg = "NONE" | "AVG" | "MIN" | "MAX" | "SUM" | "COUNT";

/** Auth command sent immediately after connection opens */
interface TbAuthCmd {
    authCmd: {
        cmdId: 0;
        token: string;
    };
}

/** Live time-series subscription command (v1 legacy, still supported) */
interface TbTimeseriesCmd {
    cmdId: number;
    type: "TIMESERIES";
    entityType: "DEVICE";
    entityId: string;
    keys: string;
    startTs: number;
    timeWindow: number;
    interval: number;
    limit: number;
    agg: TbAgg;
}

/** One-shot history fetch command (v1, no ongoing subscription) */
interface TbTimeseriesHistoryCmd {
    cmdId: number;
    type: "TIMESERIES_HISTORY";
    entityType: "DEVICE";
    entityId: string;
    keys: string;
    startTs: number;
    endTs: number;
    interval: number;
    limit: number;
    agg: TbAgg;
}

/** Unsubscribe from a v1 time-series cmd */
interface TbTimeseriesUnsubscribeCmd {
    cmdId: number;
    type: "TIMESERIES";
    unsubscribe: true;
}

type TbCmd = TbTimeseriesCmd | TbTimeseriesHistoryCmd | TbTimeseriesUnsubscribeCmd;

/** Wrapper for all outgoing command messages (after auth) */
interface TbCmdMessage {
    cmds: TbCmd[];
}

/**
 * Shape of incoming messages from ThingsBoard.
 * Telemetry subscription responses use `subscriptionId` (not `cmdId`).
 * Auth ack uses `cmdId: 0`.
 */
interface TbResponse {
    cmdId?: number;          // present on auth ack (cmdId=0)
    subscriptionId?: number; // present on telemetry updates
    errorCode?: number;
    errorMsg?: string | null;
    cmdUpdateType?: string;
    /** Time-series data: key → [[ts_ms, value_string], ...] */
    data?: Record<string, [number, string][]>;
    /** Latest value timestamps per key (not used, but typed to avoid TS noise) */
    latestValues?: Record<string, number>;
}

/**
 * Which metrics a logical device is interested in.
 * Derived from the last 2 chars of its serial:
 *   S  → combined (all keys)
 *   TS → temperature only
 *   HS → humidity only
 *   GS → gas only
 */
export type SensorFunction = 'combined' | 'temperature' | 'humidity' | 'gas'

/** One logical BE device mapped to this TB subscription */
export interface LogicalDevice {
    deviceId: string;          // BE-generated UUID
    sensorFunction: SensorFunction;
}

/** Set of metric keys each sensorFunction cares about */
const SENSOR_KEYS: Record<SensorFunction, string[]> = {
    combined: ['temperature', 'humidity', 'gas'],
    temperature: ['temperature'],
    humidity: ['humidity'],
    gas: ['gas'],
};

interface Subscription {
    cmdId: number;
    tbDeviceId: string;
    keys: string;              // comma-separated keys sent to TB WS
    /** All logical BE devices that share this TB WS subscription */
    logicalDevices: LogicalDevice[];
}

// ─── ThingsBoard WebSocket client ─────────────────────────────────────────────

class ThingsBoardWebSocket {
    private ws: WebSocket | null = null;
    private reconnectDelay = 3_000;
    private readonly maxReconnectDelay = 60_000;
    private subscriptions: Map<number, Subscription> = new Map();
    private cmdIdCounter = 1;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private isShuttingDown = false;

    constructor(private readonly wsUrl: string) { }

    async connect(): Promise<void> {
        const token = await this.getJwtToken();
        this.openConnection(token);
    }

    async subscribeDevice(tbDeviceId: string, logical: LogicalDevice): Promise<number> {
        const existing = Array.from(this.subscriptions.values()).find(
            (s) => s.tbDeviceId === tbDeviceId,
        );

        if (existing) {
            const alreadyTracked = existing.logicalDevices.some(
                (d) => d.deviceId === logical.deviceId,
            );
            if (!alreadyTracked) {
                existing.logicalDevices.push(logical);
                console.log(
                    `[TB-WS] Added logical device deviceId=${logical.deviceId} ` +
                    `fn=${logical.sensorFunction} to existing subscription ` +
                    `tbDeviceId=${tbDeviceId} (cmdId=${existing.cmdId})`,
                );
            }
            return existing.cmdId;
        }

        const cmdId = this.cmdIdCounter++;

        let keys = "temperature,humidity,gas"; // fallback
        try {
            const tbKeys = await getDeviceTelemetryKeys(tbDeviceId);
            if (tbKeys.length > 0) {
                keys = tbKeys.join(",");
                console.log(`[TB-WS] Device ${tbDeviceId} has keys: ${keys}`);
            } else {
                console.warn(`[TB-WS] No keys found for device ${tbDeviceId}, using fallback`);
            }
        } catch (err) {
            console.warn(`[TB-WS] Failed to fetch keys for ${tbDeviceId}, using fallback:`, err);
        }

        this.subscriptions.set(cmdId, {
            cmdId,
            tbDeviceId,
            keys,
            logicalDevices: [logical],
        });

        const cmd: TbTimeseriesCmd = {
            cmdId,
            type: "TIMESERIES",
            entityType: "DEVICE",
            entityId: tbDeviceId,
            keys,
            startTs: Date.now() - 60_000,
            timeWindow: 60_000,
            interval: 0,
            limit: 100,
            agg: "NONE",
        };

        this.send({ cmds: [cmd] });
        console.log(
            `[TB-WS] New subscription tbDeviceId=${tbDeviceId} keys=[${keys}] ` +
            `(cmdId=${cmdId}) logical=[${logical.deviceId}/${logical.sensorFunction}]`,
        );
        return cmdId;
    }

    unsubscribeDevice(cmdId: number): void {
        if (!this.subscriptions.has(cmdId)) return;

        const unsubCmd: TbTimeseriesUnsubscribeCmd = {
            cmdId,
            type: "TIMESERIES",
            unsubscribe: true,
        };
        this.send({ cmds: [unsubCmd] });
        this.subscriptions.delete(cmdId);
        console.log(`[TB-WS] Unsubscribed cmdId=${cmdId}`);
    }

    shutdown(): void {
        this.isShuttingDown = true;
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close();
    }

    private openConnection(token: string): void {
        const url = `${this.wsUrl}/api/ws`;
        console.log("[TB-WS] Connecting to ThingsBoard WebSocket...");
        this.ws = new WebSocket(url);

        this.ws.on("open", () => {
            console.log("[TB-WS] Connection established — authenticating...");
            this.reconnectDelay = 3_000; // reset backoff on successful connect

            // Authenticate in-band immediately after opening
            const authMsg: TbAuthCmd = { authCmd: { cmdId: 0, token } };
            this.ws!.send(JSON.stringify(authMsg));
        });

        this.ws.on("message", (raw) => {
            this.handleMessage(raw.toString(), token);
        });

        this.ws.on("close", (code, reason) => {
            console.warn(`[TB-WS] Connection closed (code=${code}, reason=${reason.toString()})`);
            if (!this.isShuttingDown) this.scheduleReconnect();
        });

        this.ws.on("error", (err) => {
            console.error("[TB-WS] WebSocket error:", err.message);
        });
    }

    private async handleMessage(raw: string, token: string): Promise<void> {
        let msg: TbResponse;
        try {
            msg = JSON.parse(raw);
        } catch {
            return; // ignore non-JSON frames
        }
        console.log("[TB-WS] Received message:", msg);

        // TODO: Handle alert when TB return telemetry which exceeds threshold (e.g. temp > 50°C) EX: publish to Redis "alerts" channel. TBD later not now.

        // Auth ack (cmdId 0) → re-subscribe to all tracked devices
        const isAuthAck = msg.cmdId === 0 || (msg.subscriptionId === 0 && msg.cmdId === undefined);
        if (isAuthAck) {
            if (msg.errorCode && msg.errorCode !== 0) {
                console.error(`[TB-WS] Auth failed (code=${msg.errorCode}): ${msg.errorMsg}`);
                return;
            }
            console.log("[TB-WS] Authenticated successfully");

            if (this.subscriptions.size > 0) {
                const cmds: TbTimeseriesCmd[] = Array.from(this.subscriptions.values()).map((s) => ({
                    cmdId: s.cmdId,
                    type: "TIMESERIES" as const,
                    entityType: "DEVICE" as const,
                    entityId: s.tbDeviceId,
                    keys: s.keys,           // use stored keys per device
                    startTs: Date.now() - 60_000,
                    timeWindow: 60_000,
                    interval: 0,
                    limit: 100,
                    agg: "NONE" as const,
                }));
                this.send({ cmds });
                console.log(`[TB-WS] Re-subscribed to ${cmds.length} device(s)`);
            }
            return;
        }

        // Telemetry update for a tracked subscription
        // TB uses 'subscriptionId' in telemetry messages, 'cmdId' only on auth ack
        const id = msg.subscriptionId ?? msg.cmdId;

        if (msg.errorCode && msg.errorCode !== 0) {
            console.warn(`[TB-WS] Error for id=${id} (code=${msg.errorCode}): ${msg.errorMsg}`);
            return;
        }

        const subscription = id !== undefined ? this.subscriptions.get(id) : undefined;
        if (!subscription) {
            console.log(`[TB-WS] Subscription not found for id=${id} (known: [${Array.from(this.subscriptions.keys()).join(',')}])`);
            return;
        }

        const { tbDeviceId, logicalDevices } = subscription;

        // Extract flat { key: latestValue } from TB time-series arrays
        const rawPayload: Record<string, string | number> = {};
        Object.entries(msg.data ?? {}).forEach(([key, entries]) => {
            if (entries.length > 0) {
                rawPayload[key] = entries[0][1]; // newest-first
            }
        });

        if (Object.keys(rawPayload).length === 0) return;

        // Publish a separate Redis message for each logical device,
        // filtered to only the keys that device cares about.
        for (const logical of logicalDevices) {
            const allowedKeys = SENSOR_KEYS[logical.sensorFunction];
            const filtered: Record<string, string | number> = {};

            for (const key of allowedKeys) {
                if (rawPayload[key] !== undefined) {
                    let val = rawPayload[key];
                    if (key === "gas") {
                        const numericVal = typeof val === "string" ? parseFloat(val) : val;
                        val = Math.round((numericVal / 4095) * 100 * 100) / 100;
                    }
                    filtered[key] = val;
                }
            }

            if (Object.keys(filtered).length === 0) continue;

            const channel = REDIS_CHANNELS.telemetry(logical.deviceId);
            const message = JSON.stringify({
                deviceId: logical.deviceId,
                tbDeviceId,
                sensorFunction: logical.sensorFunction,
                data: filtered,
                ts: Date.now(),
            });

            try {
                await redisClient.publish(channel, message);
                console.log(
                    `[TB-WS] Published to ${channel} ` +
                    `fn=${logical.sensorFunction} data=${JSON.stringify(filtered)}`,
                );
            } catch (err) {
                console.error(`[TB-WS] Failed to publish to ${channel}:`, err);
            }
        }
    }

    private send(data: object): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn("[TB-WS] Cannot send — socket not open");
        }
    }

    private scheduleReconnect(): void {
        console.log(`[TB-WS] Reconnecting in ${this.reconnectDelay / 1000} s...`);
        this.reconnectTimer = setTimeout(async () => {
            try {
                const token = await this.getJwtToken();
                this.openConnection(token);
            } catch (err) {
                console.error("[TB-WS] Failed to get token for reconnect:", err);
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
                this.scheduleReconnect();
            }
        }, this.reconnectDelay);

        // Exponential back-off
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
    }

    private async getJwtToken(): Promise<string> {
        const cached = await redisClient.get(REDIS_KEYS.tbToken);
        if (cached) return cached;

        console.log("[TB-WS] Fetching new ThingsBoard JWT...");
        const res = await fetch(`https://${env.THINGSBOARD_HOST}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: env.THINGSBOARD_USERNAME,
                password: env.THINGSBOARD_PASSWORD,
            }),
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`ThingsBoard login failed: ${res.status} ${text}`);
        }

        const data = await res.json();
        const token: string = data.token;

        await redisClient.set(REDIS_KEYS.tbToken, token, { EX: 5400 });
        return token;
    }
}

const tbWsUrl = `wss://${env.THINGSBOARD_HOST}`;
export const tbWsClient = new ThingsBoardWebSocket(tbWsUrl);