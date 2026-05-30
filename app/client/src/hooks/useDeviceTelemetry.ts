import { useEffect, useRef, useState, useCallback } from 'react'
import type {
  DeviceTelemetryState,
  TelemetryPoint,
  WsServerMessage,
} from '../types/telemetry'
import type { DeviceInfo } from '../lib/deviceApi'
import { authStore } from '../lib/authStore'

const WS_URL = `${import.meta.env.VITE_WS_URL}`
const MAX_HISTORY_POINTS = 60

function addPoint(history: TelemetryPoint[], ts: number, value: number): TelemetryPoint[] {
  const next = [...history, { ts, value }]
  return next.length > MAX_HISTORY_POINTS ? next.slice(next.length - MAX_HISTORY_POINTS) : next
}

function makeInitialState(d: DeviceInfo): DeviceTelemetryState {
  return {
    deviceId: d.deviceId,
    tbDeviceId: d.tbDeviceId,
    deviceName: d.deviceName,
    deviceType: d.deviceType,
    serial: d.serial,
    serialSuffix: d.serialSuffix,
    sensorFunction: d.sensorFunction,
    latest: {},
    history: { temperature: [], humidity: [], gas: [] },
    lastUpdated: null,
    status: 'connecting',
  }
}

function isSensor(d: DeviceInfo): boolean {
  return d.deviceType === 'SENSOR' && d.sensorFunction !== null
}

export function useDeviceTelemetry(devices: DeviceInfo[]) {
  const sensorDevices = devices.filter(isSensor)

  const [states, setStates] = useState<Record<string, DeviceTelemetryState>>(() => {
    const init: Record<string, DeviceTelemetryState> = {}
    for (const d of sensorDevices) {
      init[d.deviceId] = makeInitialState(d)
    }
    return init
  })

  const wsRef = useRef<WebSocket | null>(null)
  const devicesRef = useRef(sensorDevices)
  devicesRef.current = sensorDevices

  const [wsConnected, setWsConnected] = useState(false)
  const [wsError, setWsError] = useState<string | null>(null)

  const subscribe = useCallback((ws: WebSocket, device: DeviceInfo) => {
    if (ws.readyState !== WebSocket.OPEN) return
    const descriptor = {
      deviceId: device.deviceId,
      tbDeviceId: device.tbDeviceId,
      deviceType: device.deviceType,
      serial: device.serial,
      serialSuffix: device.serialSuffix,
      sensorFunction: device.sensorFunction,
    }
    ws.send(JSON.stringify({ type: 'subscribe', device: descriptor }))
    console.log(
      `[WS] >> subscribe deviceId=${device.deviceId} tbDeviceId=${device.tbDeviceId} ` +
      `serial=${device.serial} fn=${device.sensorFunction}`,
    )
  }, [])

  // Main WS effect — runs once 
  useEffect(() => {
    const token = authStore.getToken()
    if (!token) {
      setWsError('Chưa đăng nhập — không có access token')
      return
    }

    const url = `${WS_URL}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      setWsConnected(true)
      setWsError(null)
      console.log('[WS] Connected, waiting for server handshake...')
    }

    ws.onmessage = (event) => {
      let msg: WsServerMessage
      try { msg = JSON.parse(event.data) } catch { return }

      console.log('[WS] <<', msg)

      // connected - subscribe all sensor devices
      if (msg.type === 'connected') {
        console.log(`[WS] Authenticated as userId=${msg.userId} role=${msg.role}`)
        for (const d of devicesRef.current) {
          subscribe(ws, d)
        }
      }

      // subscribed - update card status
      if (msg.type === 'subscribed') {
        console.log(
          `[WS] Subscribed: deviceId=${msg.deviceId} tbDeviceId=${msg.tbDeviceId} ` +
          `fn=${msg.sensorFunction}`,
        )
        setStates((prev) => {
          const entry = prev[msg.deviceId]
          if (!entry) return prev
          return { ...prev, [msg.deviceId]: { ...entry, status: 'subscribed' } }
        })
      }

      // telemetry - update metrics per deviceId
      if (msg.type === 'telemetry') {
        const { deviceId, tbDeviceId, sensorFunction, data, ts } = msg
        console.log(
          `[WS] Telemetry deviceId=${deviceId} tbDeviceId=${tbDeviceId} ` +
          `fn=${sensorFunction}:`, data,
        )
        setStates((prev) => {
          const entry = prev[deviceId]
          if (!entry) return prev

          const merged = { ...entry.latest }
          const history = { ...entry.history }

          for (const [key, rawVal] of Object.entries(data)) {
            const val = typeof rawVal === 'string'
              ? parseFloat(rawVal as string)
              : (rawVal as number)
            if (!isNaN(val)) {
              merged[key] = val
              if (key === 'temperature' || key === 'humidity' || key === 'gas') {
                history[key] = addPoint(history[key], ts, val)
              }
            }
          }

          return {
            ...prev,
            [deviceId]: {
              ...entry,
              latest: merged,
              history,
              lastUpdated: ts,
              status: 'subscribed',
            },
          }
        })
      }

      // error - update specific device card or global
      if (msg.type === 'error') {
        console.warn('[WS] Error from server:', msg.message, msg.deviceId ?? '')
        const errorDeviceId = msg.deviceId
        if (errorDeviceId) {
          setStates((prev) => {
            const entry = prev[errorDeviceId]
            if (!entry) return prev
            return { ...prev, [errorDeviceId]: { ...entry, status: 'error' } }
          })
        } else {
          setWsError(msg.message)
        }
      }
    }

    ws.onclose = () => {
      setWsConnected(false)
      setStates((prev) => {
        const next = { ...prev }
        for (const id of Object.keys(next)) {
          next[id] = { ...next[id], status: 'disconnected' }
        }
        return next
      })
    }

    ws.onerror = () => { setWsError('Lỗi kết nối WebSocket') }

    return () => { ws.close() }
  }, [])

  useEffect(() => {
    const ws = wsRef.current
    if (!ws || !wsConnected) return

    setStates((prev) => {
      const next = { ...prev }
      for (const d of sensorDevices) {
        if (!next[d.deviceId]) {
          next[d.deviceId] = makeInitialState(d)
          subscribe(ws, d)
        }
      }
      return next
    })
  }, [sensorDevices, wsConnected, subscribe])

  return { states, wsConnected, wsError }
}
