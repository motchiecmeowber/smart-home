import mqtt from "mqtt";
import { env } from "./env";

console.log(`Connecting to ThingsBoard MQTT at mqtt://${env.THINGSBOARD_HOST}:${env.THINGSBOARD_PORT}`);

export const mqttClient = mqtt.connect(`mqtt://${env.THINGSBOARD_HOST}:${env.THINGSBOARD_PORT}`, {
  username: env.THINGSBOARD_ACCESS_TOKEN,
  reconnectPeriod: 5000,
});

mqttClient.on("connect", () => {
  console.log("Connected to ThingsBoard MQTT Broker!");

  mqttClient.subscribe("v1/devices/me/rpc/request/+", (err) => {
    if (err) {
      console.error("Failed to subscribe to RPC requests", err);
    } else {
      console.log("Subscribed to ThingsBoard RPC requests");
    }
  });

  mqttClient.subscribe("v1/gateway/telemetry", (err) => {
    if (!err) console.log("Subscribed to gateway telemetry");
  });
});

mqttClient.on("error", (error) => {
  console.error("MQTT Connection Error:", error);
});

// Function to publish telemetry to ThingsBoard
export const publishTelemetry = (data: Record<string, any>) => {
  if (mqttClient.connected) {
    mqttClient.publish("v1/devices/me/telemetry", JSON.stringify(data));
  } else {
    console.error("Cannot publish telemetry: MQTT client not connected.");
  }
};