export interface TelemetryData {
  temperature?: number
  humidity?: number
  gas?: number
  [key: string]: number | undefined
}

export interface TelemetryPoint {
  ts: number
  value: number
}

export interface DeviceTelemetryState {
  deviceId: string
  tbDeviceId: string
  deviceName: string
  deviceType: 'SENSOR' | 'ACTUATOR'
  serial: string
  serialSuffix: string
  sensorFunction: 'combined' | 'temperature' | 'humidity' | 'gas' | null
  latest: TelemetryData
  history: {
    temperature: TelemetryPoint[]
    humidity: TelemetryPoint[]
    gas: TelemetryPoint[]
  }
  lastUpdated: number | null
  status: 'connecting' | 'subscribed' | 'error' | 'disconnected'
}

export interface DeviceDescriptor {
  deviceId: string
  tbDeviceId: string
  deviceType: string
  serial: string
  serialSuffix: string
  sensorFunction: 'combined' | 'temperature' | 'humidity' | 'gas' | null
}

export type WsServerMessage =
  | { type: 'connected'; userId: string; role: string }
  | {
    type: 'subscribed'
    deviceId: string
    tbDeviceId: string
    deviceType: string
    serial: string
    sensorFunction: string
  }
  | { type: 'unsubscribed'; deviceId: string }
  | { type: 'pong'; ts: number }
  | { type: 'error'; deviceId?: string; tbDeviceId?: string; message: string }
  | {
    type: 'telemetry'
    deviceId: string          // BE UUID — primary key for state map
    tbDeviceId: string
    sensorFunction: string
    data: TelemetryData
    ts: number
  }

export type WsClientMessage =
  | { type: 'subscribe'; device: DeviceDescriptor }
  | { type: 'unsubscribe'; device: { deviceId: string; tbDeviceId: string } }
  | { type: 'ping' }
