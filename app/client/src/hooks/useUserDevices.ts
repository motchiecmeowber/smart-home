/**
 * Fetches the authenticated user's devices from /api/devices on mount.
 */

import { useEffect, useState } from 'react'
import { apiGetMyDevices } from '../lib/deviceApi'
import type { DeviceInfo } from '../lib/deviceApi'

export interface UseUserDevicesResult {
  devices: DeviceInfo[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useUserDevices(): UseUserDevicesResult {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    apiGetMyDevices()
      .then((data) => {
        if (!cancelled) setDevices(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải danh sách thiết bị')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  return {
    devices,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
