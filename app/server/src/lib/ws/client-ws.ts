import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage, Server } from "node:http";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { redisClient, redisSubscriber } from "@/config/redis";
import { REDIS_KEYS, REDIS_CHANNELS } from "@/config/redis.keys";
import { tbWsClient } from "@/lib/ws/tb-ws";
import type { SensorFunction, LogicalDevice } from "@/lib/ws/tb-ws";
import { hardwareRepo } from "@/modules/hardware/hardware.repository";

interface AuthenticatedClient {
    ws: WebSocket;
    userId: string;
    role: string;
    subscribedDevices: Set<string>;
}

/**
 * Full device descriptor sent by the frontend when subscribing.
 *
 * serialSuffix convention (last 2 chars of serial):
 *   S  → combined sensor (temperature + humidity + gas)
 *   TS → temperature sensor
 *   HS → humidity sensor
 *   GS → gas sensor
 *   TL → temperature LED actuator
 *   HL → humidity LED actuator
 */
interface DeviceDescriptor {
    deviceId: string;        // BE-generated UUID (primary key)
    tbDeviceId: string;      // ThingsBoard UUID
    deviceType: string;      // "SENSOR" | "ACTUATOR"
    serial: string;          // e.g. "SN-<tbId>-TS"
    serialSuffix: string;    // last 2 chars of serial, e.g. "TS"
    sensorFunction: SensorFunction | null;  // null for actuators
}

type ClientMessage =
    | { type: "subscribe"; device: DeviceDescriptor }
    | { type: "unsubscribe"; device: { deviceId: string; tbDeviceId: string } }
    | { type: "ping" };

function parseSerialSuffix(serial: string): string {
    const parts = serial.split("-");
    return parts[parts.length - 1].toUpperCase();
}

function resolveSensorFunction(suffix: string): SensorFunction | null {
    switch (suffix) {
        case "S": return "combined";
        case "TS": return "temperature";
        case "HS": return "humidity";
        case "GS": return "gas";
        default: return null;
    }
}

class ClientWebSocketManager {
    private wss: WebSocketServer | null = null;
    private clients: Map<WebSocket, AuthenticatedClient> = new Map();
    private deviceSubscribers: Map<string, Set<WebSocket>> = new Map();

    async init(httpServer: Server): Promise<void> {
        this.wss = new WebSocketServer({ server: httpServer, path: "/ws" });

        this.wss.on("connection", (ws, req) => {
            this.handleConnection(ws, req);
        });

        // Subscribe to ALL telemetry channels (now keyed by deviceId)
        await redisSubscriber.pSubscribe(REDIS_CHANNELS.telemetryAll, (message, channel) => {
            this.broadcastTelemetry(channel, message);
        });

        console.log("[WS] Client WebSocket server ready at /ws");
    }

    private async handleConnection(ws: WebSocket, req: IncomingMessage): Promise<void> {
        const url = new URL(req.url ?? "/", "http://localhost");
        const token = url.searchParams.get("token");

        if (!token) { ws.close(4001, "Missing access token"); return; }

        const isBlacklisted = await redisClient.get(REDIS_KEYS.blacklist(token));
        if (isBlacklisted) { ws.close(4001, "Token revoked"); return; }

        let userId: string;
        let role: string;
        try {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string; role: string };
            userId = decoded.userId;
            role = decoded.role;
        } catch {
            ws.close(4001, "Invalid or expired token");
            return;
        }

        const client: AuthenticatedClient = { ws, userId, role, subscribedDevices: new Set() };
        this.clients.set(ws, client);

        console.log(`[WS] Client connected: userId=${userId}, role=${role}`);
        ws.send(JSON.stringify({ type: "connected", userId, role }));

        ws.on("message", (raw) => this.handleClientMessage(ws, raw.toString()));
        ws.on("close", () => this.handleDisconnect(ws));
        ws.on("error", (err) => console.error(`[WS] Client error (userId=${userId}):`, err.message));
    }

    private handleDisconnect(ws: WebSocket): void {
        const client = this.clients.get(ws);
        if (!client) return;

        client.subscribedDevices.forEach((deviceId) => {
            const subs = this.deviceSubscribers.get(deviceId);
            if (subs) {
                subs.delete(ws);
                if (subs.size === 0) this.deviceSubscribers.delete(deviceId);
            }
        });

        this.clients.delete(ws);
        console.log(`[WS] Client disconnected: userId=${client.userId}`);
    }

    private async handleClientMessage(ws: WebSocket, raw: string): Promise<void> {
        let msg: ClientMessage;
        try {
            msg = JSON.parse(raw);
        } catch {
            ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
            return;
        }

        const client = this.clients.get(ws);
        if (!client) return;

        switch (msg.type) {
            case "subscribe":
                await this.subscribeClientToDevice(client, msg.device);
                break;
            case "unsubscribe":
                this.unsubscribeClientFromDevice(client, msg.device.deviceId);
                break;
            case "ping":
                ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
                break;
            default:
                ws.send(JSON.stringify({ type: "error", message: "Unknown message type" }));
        }
    }

    private async subscribeClientToDevice(
        client: AuthenticatedClient,
        device: DeviceDescriptor,
    ): Promise<void> {
        const { deviceId, tbDeviceId, deviceType, serial } = device;

        // Resolve sensorFunction from serial suffix (authoritative source: serial)
        const suffix = parseSerialSuffix(serial);
        const sensorFunction = device.sensorFunction ?? resolveSensorFunction(suffix);

        // Authorization: verify both IDs + ownership
        const allowed = await this.canAccessDevice(client, deviceId, tbDeviceId);
        if (!allowed) {
            console.warn(
                `[WS] Access denied: userId=${client.userId} role=${client.role} ` +
                `deviceId=${deviceId} tbDeviceId=${tbDeviceId}`,
            );
            client.ws.send(JSON.stringify({
                type: "error",
                deviceId,
                tbDeviceId,
                message: `Access denied for device ${deviceId}`,
            }));
            return;
        }

        // Only SENSOR devices produce telemetry — skip actuators
        if (deviceType === "ACTUATOR" || sensorFunction === null) {
            client.ws.send(JSON.stringify({
                type: "error",
                deviceId,
                tbDeviceId,
                message: `Device ${deviceId} is an actuator and does not emit telemetry`,
            }));
            return;
        }

        // Track WS subscription keyed by deviceId
        client.subscribedDevices.add(deviceId);
        if (!this.deviceSubscribers.has(deviceId)) {
            this.deviceSubscribers.set(deviceId, new Set());
        }
        this.deviceSubscribers.get(deviceId)!.add(client.ws);

        // Register with TB WS (deduplicates per tbDeviceId, adds logicalDevice)
        const logical: LogicalDevice = { deviceId, sensorFunction };
        await tbWsClient.subscribeDevice(tbDeviceId, logical);

        client.ws.send(JSON.stringify({
            type: "subscribed",
            deviceId,
            tbDeviceId,
            deviceType,
            serial,
            sensorFunction,
        }));
        console.log(
            `[WS] userId=${client.userId} subscribed: ` +
            `deviceId=${deviceId} tbDeviceId=${tbDeviceId} serial=${serial} fn=${sensorFunction}`,
        );
    }

    private unsubscribeClientFromDevice(client: AuthenticatedClient, deviceId: string): void {
        client.subscribedDevices.delete(deviceId);
        const subs = this.deviceSubscribers.get(deviceId);
        if (subs) {
            subs.delete(client.ws);
            if (subs.size === 0) this.deviceSubscribers.delete(deviceId);
        }
        client.ws.send(JSON.stringify({ type: "unsubscribed", deviceId }));
    }

    // Redis - Client broadcast
    private broadcastTelemetry(channel: string, message: string): void {
        // Extract deviceId from channel name "telemetry:<deviceId>"
        const deviceId = channel.slice("telemetry:".length);
        const subscribers = this.deviceSubscribers.get(deviceId);
        if (!subscribers || subscribers.size === 0) return;

        const payload = JSON.stringify({ type: "telemetry", ...JSON.parse(message) });

        subscribers.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(payload);
            }
        });
    }

    /**
     * Authorization rules:
     *  - ADMIN:    always allowed.
     *  - CUSTOMER: device must exist in DB with matching deviceId AND tbDeviceId,
     *              AND the device must belong to the requesting userId.
     */
    private async canAccessDevice(
        client: AuthenticatedClient,
        deviceId: string,
        tbDeviceId: string,
    ): Promise<boolean> {
        if (client.role === "ADMIN") return true;

        try {
            const device = await hardwareRepo.getDeviceById(deviceId);

            if (!device) {
                console.warn(`[WS] canAccessDevice: deviceId=${deviceId} not found in DB`);
                return false;
            }

            if (device.tbDeviceId !== tbDeviceId) {
                console.warn(
                    `[WS] canAccessDevice: tbDeviceId mismatch for deviceId=${deviceId} ` +
                    `expected=${device.tbDeviceId} got=${tbDeviceId}`,
                );
                return false;
            }

            const ownedByUser =
                device.sensor?.customerId === client.userId ||
                device.actuator?.customerId === client.userId;

            console.log(
                `[WS] canAccessDevice: deviceId=${deviceId} tbDeviceId=${tbDeviceId} ` +
                `owned=${ownedByUser} (userId=${client.userId} role=${client.role})`,
            );

            return ownedByUser;
        } catch (err) {
            console.error(`[WS] canAccessDevice error:`, err);
            return false;
        }
    }
}

export const clientWsManager = new ClientWebSocketManager();
