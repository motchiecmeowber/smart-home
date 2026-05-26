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
  status: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED'
  sensor: RawSensor | null
  actuator: RawActuator | null
  location: RawLocation | null
}

export interface GetDevicesResponse {
  data: RawDevice[]
}

export type SensorFunction = 'temperature' | 'humidity' | 'gas' | 'combined'
export type ActuatorFunction = 'tempLed' | 'humiLed' | 'buzzer'

export interface DeviceInfo {
  deviceId: string
  serial: string
  tbDeviceId: string
  deviceName: string
  deviceType: 'SENSOR' | 'ACTUATOR'
  serialSuffix: string
  sensorFunction: SensorFunction | null
  actuatorFunction: ActuatorFunction | null
  status: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED'
  location: string | null
  hasOwner: boolean
  ownerId: string | null
}

export function parseSuffixFromDeviceName(name: string | null): string {
  if (!name) return ''

  const parts = name.split('-')
  const lastPart = parts[parts.length - 1].trim().toUpperCase();

  if (lastPart.includes('TEMPERATURE') || lastPart === 'TS') return 'TS'
  if (lastPart.includes('HUMIDITY') || lastPart === 'HS') return 'HS'
  if (lastPart.includes('GAS') || lastPart === 'GS') return 'GS'
  if (lastPart.includes('COMBINED') || lastPart === 'S') return 'S'
  if (lastPart.includes('TEMP LED') || lastPart === 'TL') return 'TL'
  if (lastPart.includes('HUMI LED') || lastPart === 'HL') return 'HL'
  if (lastPart.includes('BUZZER') || lastPart === 'B') return 'B'
  
  return ''
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
    case 'B': return 'buzzer'
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
      const suffix = parseSuffixFromDeviceName(d.deviceName)
      const currentOwnerId = d.deviceType === 'SENSOR' ? d.sensor?.customerId : d.actuator?.customerId

      return {
        deviceId: d.deviceId,
        tbDeviceId: d.tbDeviceId!,
        deviceName: d.deviceName ?? 'Thiết bị không tên',
        deviceType: d.deviceType,
        serial: d.serial ?? '',
        serialSuffix: suffix,
        sensorFunction: d.deviceType === 'SENSOR' ? resolveSensorFunction(suffix) : null,
        actuatorFunction: d.deviceType === 'ACTUATOR' ? resolveActuatorFunction(suffix) : null,
        status: d.status,
        location: d.location?.locationName ?? null,
        hasOwner: Boolean(currentOwnerId),
        ownerId: currentOwnerId ?? null
      }
    })
}

export async function apiGetDeviceById(deviceId: string): Promise<DeviceInfo> {
  const res = await authedFetch<{ data: RawDevice }>(`/devices/${deviceId}`)
  const d = res.data ?? (res as unknown as RawDevice)

  const suffix = parseSuffixFromDeviceName(d.deviceName)
  const currentOwnerId = d.deviceType === 'SENSOR' ? d.sensor?.customerId : d.actuator?.customerId

  return {
    deviceId: d.deviceId,
    serial: d.serial ?? '',
    tbDeviceId: d.tbDeviceId ?? '',
    deviceName: d.deviceName ?? 'Thiết bị không tên',
    deviceType: d.deviceType,
    serialSuffix: suffix,
    sensorFunction: d.deviceType === 'SENSOR' ? resolveSensorFunction(suffix) : null,
    actuatorFunction: d.deviceType === 'ACTUATOR' ? resolveActuatorFunction(suffix) : null,
    status: d.status,
    location: d.location?.locationName ?? null,
    hasOwner: Boolean(currentOwnerId),
    ownerId: currentOwnerId ?? null
  }
}

export async function apiSyncDevices(): Promise<{ createdCount: number }> {
  const token = authStore.getToken()
  if (!token) {
    throw new Error('Yêu cầu xác thực tài khoản')
  }

  const res = await fetch(`${BASE}/devices/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message ?? `Lỗi đồng bộ hệ thống (HTTP ${res.status})`)
  }

  return json.data || { createdCount: 0 }
}

export interface UpdateDevicePayload {
  deviceName?: string
  status?: 'ONLINE' | 'OFFLINE' | 'DISCONNECTED'
  locationId?: string
  unit?: string
  threshold?: number
  customerId?: string | null
}

export async function apiUpdateDevice(deviceId: string, updates: UpdateDevicePayload): Promise<void> {
  const token = authStore.getToken()
  if (!token) {
    throw new Error('Yêu cầu xác thực tài khoản')
  }

  const res = await fetch(`${BASE}/devices/${deviceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message ?? `Lỗi cập nhật thiết bị (${res.status})`)
  }
}

export async function apiDeleteDevice(deviceId: string): Promise<void> {
  const token = authStore.getToken()
  if (!token) {
    throw new Error('Yêu cầu xác thực tài khoản')
  }

  const res = await fetch(`${BASE}/devices/${deviceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.message ?? `Lỗi xóa thiết bị (${res.status})`)
  }
}