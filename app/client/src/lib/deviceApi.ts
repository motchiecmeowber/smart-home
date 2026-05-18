/**
 * HTTP client for the /api/devices endpoints.
 */

import { authStore } from './authStore'

const BASE = import.meta.env.VITE_API_URL

export interface RawSensor {
  sensorId: string
  unit: string | null
  threshold: number | null
  customerId: string | null
}

export interface RawActuator {
  actuatorId: string
  customerId: string | null
}

export interface RawLocation {
  locationId: string
  locationName: string
}

export interface RawDevice {
  deviceId: string
  serial: string
  tbDeviceId: string | null
  deviceName: string | null
  deviceType: 'SENSOR' | 'ACTUATOR'
  status: 'ONLINE' | 'OFFLINE'
  sensor: RawSensor | null
  actuator: RawActuator | null
  location: RawLocation | null
}

export interface GetDevicesResponse {
  data: RawDevice[]
}

export type SensorFunction = 'temperature' | 'humidity' | 'gas' | 'combined'
export type ActuatorFunction = 'tempLed' | 'humiLed'

export interface DeviceInfo {
  deviceId: string
  tbDeviceId: string
  deviceName: string
  deviceType: 'SENSOR' | 'ACTUATOR'
  serial: string
  serialSuffix: string
  sensorFunction: SensorFunction | null
  actuatorFunction: ActuatorFunction | null
  status: 'ONLINE' | 'OFFLINE'
  location: string | null
}

export function parseSerialSuffix(serial: string): string {
  const parts = serial.split('-')
  return parts[parts.length - 1].toUpperCase()
}

export function resolveSensorFunction(suffix: string): SensorFunction | null {
  switch (suffix) {
    case 'S': return 'combined'
    case 'TS': return 'temperature'
    case 'HS': return 'humidity'
    case 'GS': return 'gas'
    default: return null
  }
}

export function resolveActuatorFunction(suffix: string): ActuatorFunction | null {
  switch (suffix) {
    case 'TL': return 'tempLed'
    case 'HL': return 'humiLed'
    default: return null
  }
}

async function authedFetch<T>(path: string): Promise<T> {
  const token = authStore.getToken()
  if (!token) throw new Error('Not authenticated')

  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? `HTTP ${res.status}`)
  }
  return json as T
}

export async function apiGetDevices(): Promise<DeviceInfo[]> {
  const res = await authedFetch<{ data: RawDevice[] }>('/devices')
  const raw: RawDevice[] = res.data ?? (res as unknown as RawDevice[])

  return raw
    .filter((d) => Boolean(d.tbDeviceId))
    .map((d): DeviceInfo => {
      const suffix = parseSerialSuffix(d.serial)
      return {
        deviceId: d.deviceId,
        tbDeviceId: d.tbDeviceId!,
        deviceName: d.deviceName ?? d.serial,
        deviceType: d.deviceType,
        serial: d.serial,
        serialSuffix: suffix,
        sensorFunction: d.deviceType === 'SENSOR' ? resolveSensorFunction(suffix) : null,
        actuatorFunction: d.deviceType === 'ACTUATOR' ? resolveActuatorFunction(suffix) : null,
        status: d.status,
        location: d.location?.locationName ?? null,
      }
    })
}
