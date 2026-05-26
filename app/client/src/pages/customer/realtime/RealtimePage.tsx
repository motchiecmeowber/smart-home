import { Button, Spin, Typography } from 'antd'
import {
  ReloadOutlined,
  WifiOutlined,
  DisconnectOutlined,
  ExclamationCircleOutlined,
  RadarChartOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BulbOutlined,
  DashboardOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  InboxOutlined,
  SignalFilled,
} from '@ant-design/icons'
import { useDeviceTelemetry } from '../../../hooks/useDeviceTelemetry'
import { useUserDevices } from '../../../hooks/useUserDevices'
import type { DeviceTelemetryState, TelemetryPoint } from '../../../types/telemetry'
import '../CustomerPages.css'
import './RealtimePage.css'

const { Title } = Typography


interface SuffixMeta {
  label: string
  icon: React.ReactNode
  color: string
}

const SUFFIX_META: Record<string, SuffixMeta> = {
  S: { label: 'Cảm biến tổng hợp', icon: <RadarChartOutlined />, color: '#0b5f95' },
  TS: { label: 'Cảm biến nhiệt độ', icon: <DashboardOutlined />, color: '#e05c2a' },
  HS: { label: 'Cảm biến độ ẩm', icon: <SignalFilled />, color: '#2677cc' },
  GS: { label: 'Cảm biến khí gas', icon: <FireOutlined />, color: '#8b59c2' },
  TL: { label: 'LED nhiệt độ', icon: <BulbOutlined />, color: '#e09a1a' },
  HL: { label: 'LED độ ẩm', icon: <BulbOutlined />, color: '#1ab5b5' },
}

interface MetricMeta {
  label: string
  icon: React.ReactNode
  unit: string
  colorClass: string
}

const METRIC_META: Record<string, MetricMeta> = {
  temperature: { label: 'Nhiệt độ', icon: <ThunderboltOutlined />, unit: '°C', colorClass: 'temp' },
  humidity: { label: 'Độ ẩm', icon: <SignalFilled />, unit: '%', colorClass: 'hum' },
  gas: { label: 'Gas', icon: <FireOutlined />, unit: '', colorClass: 'gas' },
}

function Sparkline({ data, color, height = 32 }: { data: TelemetryPoint[]; color: string; height?: number }) {
  if (data.length < 2) {
    return (
      <svg viewBox="0 0 200 32" preserveAspectRatio="none">
        <line x1="0" y1={height / 2} x2="200" y2={height / 2} stroke="#e0e8ee" strokeWidth="1.5" strokeDasharray="4 3" />
      </svg>
    )
  }

  const values = data.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const W = 200; const H = height; const pad = 3

  const points = data.map((p, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - pad - ((p.value - min) / range) * (H - pad * 2)
    return `${x},${y}`
  })

  const polyline = points.join(' ')
  const last = points[points.length - 1].split(',')
  const lx = parseFloat(last[0])
  const ly = parseFloat(last[1])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={`0,${H} ${polyline} ${W},${H}`} fill={`url(#sg-${color.replace('#', '')})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="3" fill={color} opacity="0.9" />
    </svg>
  )
}

function ConnectionBadge({ connected, error }: { connected: boolean; error: string | null }) {
  if (error) return (
    <span className="rt-badge error">
      <ExclamationCircleOutlined className="rt-badge-icon" />
      Lỗi kết nối
    </span>
  )
  if (connected) return (
    <span className="rt-badge connected">
      <WifiOutlined className="rt-badge-icon" />
      Đang kết nối
    </span>
  )
  return (
    <span className="rt-badge disconnected">
      <DisconnectOutlined className="rt-badge-icon" />
      Ngắt kết nối
    </span>
  )
}


function MetricPill({ icon, value, unit, label, colorClass }: {
  icon: React.ReactNode
  value: number | undefined
  unit: string
  label: string
  colorClass: string
}) {
  return (
    <div className="rt-metric">
      <span className="rt-metric-icon">{icon}</span>
      <span className={`rt-metric-value ${value !== undefined ? colorClass : 'empty'}`}>
        {value !== undefined ? `${value.toFixed(1)}${unit}` : '—'}
      </span>
      <span className="rt-metric-label">{label}</span>
    </div>
  )
}

function DeviceCard({ state }: { state: DeviceTelemetryState }) {
  const { deviceName, serialSuffix, latest, history, lastUpdated, status } = state

  const suffixMeta: SuffixMeta = SUFFIX_META[serialSuffix] ?? {
    label: serialSuffix,
    icon: <DashboardOutlined />,
    color: '#666',
  }
  const lastUpdatedStr = lastUpdated ? new Date(lastUpdated).toLocaleTimeString('vi-VN') : null

  const cardIcon = status === 'error'
    ? <ExclamationCircleOutlined style={{ color: '#e55353' }} />
    : suffixMeta.icon

  return (
    <article className="rt-device-card" aria-label={`Thiết bị: ${deviceName}`}>

      <div className="rt-card-header">
        <div className="rt-card-title">
          <span className="rt-card-icon" style={{ color: suffixMeta.color }}>{cardIcon}</span>
          {deviceName}
        </div>
        <span className={`rt-card-status ${status}`}>
          {status === 'subscribed'
            ? <><WifiOutlined /> Live</>
            : status === 'connecting'
              ? <><LoadingOutlined spin /> Đang kết nối...</>
              : status === 'error'
                ? <><ExclamationCircleOutlined /> Lỗi</>
                : <><DisconnectOutlined /> Offline</>}
        </span>
      </div>

      <div className="rt-card-meta">
        <span className="rt-card-badge" title="Loại thiết bị">{suffixMeta.label}</span>
      </div>

      {(latest.temperature !== undefined || latest.humidity !== undefined || latest.gas !== undefined) && (
        <div className="rt-metrics">
          {Object.entries(latest)
            .filter(([k]) => k in METRIC_META && latest[k] !== undefined)
            .map(([k, v]) => {
              const m = METRIC_META[k]!
              return (
                <MetricPill key={k} icon={m.icon} value={Number(v)} unit={m.unit} label={m.label} colorClass={m.colorClass} />
              )
            })}
        </div>
      )}

      {Object.entries(latest).filter(([k]) => !(k in METRIC_META)).length > 0 && (
        <div className="rt-metrics">
          {Object.entries(latest)
            .filter(([k]) => !(k in METRIC_META))
            .map(([k, v]) => (
              <MetricPill
                key={k}
                icon={<BarChartOutlined />}
                value={v !== undefined ? Number(v) : undefined}
                unit=""
                label={k}
                colorClass="hum"
              />
            ))}
        </div>
      )}

      {status === 'subscribed' && Object.keys(latest).length === 0 && (
        <div className="rt-no-data" style={{ padding: '16px 0' }}>
          <LoadingOutlined style={{ fontSize: '1.2rem', marginRight: 8 }} />
          Đang chờ dữ liệu từ thiết bị...
        </div>
      )}

      {(history.temperature.length > 0 || history.humidity.length > 0 || history.gas.length > 0) && (
        <div className="rt-sparkline-wrap">
          {([
            { key: 'temperature' as const, label: 'T°', color: '#e05c2a' },
            { key: 'humidity' as const, label: 'H%', color: '#2677cc' },
            { key: 'gas' as const, label: 'Gas', color: '#8b59c2' },
          ]).filter(({ key }) => history[key].length > 0).map(({ key, label, color }) => (
            <div className="rt-sparkline-row" key={key}>
              <span className="rt-sparkline-label">{label}</span>
              <div className="rt-sparkline-svg-wrap">
                <Sparkline data={history[key]} color={color} />
              </div>
            </div>
          ))}
        </div>
      )}

      {lastUpdatedStr && (
        <div className="rt-last-updated">
          <ClockCircleOutlined className="rt-last-updated-icon" />
          Cập nhật lúc {lastUpdatedStr}
        </div>
      )}
    </article>
  )
}

export function RealtimePage() {
  const { devices, loading: devicesLoading, error: devicesError, refetch } = useUserDevices()
  const { states, wsConnected, wsError } = useDeviceTelemetry(devices)

  const deviceList = Object.values(states)

  return (
    <section className="customer-page" aria-labelledby="rt-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="rt-title" level={1} className="customer-title">
            Dữ liệu thời gian thực
          </Title>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ConnectionBadge connected={wsConnected} error={wsError} />
          <Button
            icon={<ReloadOutlined />}
            size="small"
            onClick={refetch}
            disabled={devicesLoading}
            title="Tải lại danh sách thiết bị"
          />
        </div>
      </div>

      {devicesError && (
        <div className="rt-error-banner" role="alert">
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Không thể tải danh sách thiết bị: {devicesError}
        </div>
      )}

      {wsError && (
        <div className="rt-error-banner" role="alert">
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          {wsError}
        </div>
      )}

      {devicesLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <Spin size="large" tip="Đang tải thiết bị..." />
        </div>
      )}

      {!devicesLoading && deviceList.length === 0 && (
        <div className="rt-no-data">
          <InboxOutlined className="rt-no-data-icon" />
          {devices.length === 0
            ? 'Bạn chưa có thiết bị nào. Hãy liên hệ quản trị viên để được hỗ trợ.'
            : 'Đang kết nối WebSocket...'}
        </div>
      )}

      {!devicesLoading && deviceList.length > 0 && (
        <div className="rt-grid">
          {deviceList.map((s) => (
            <DeviceCard key={s.deviceId} state={s} />
          ))}
        </div>
      )}
    </section>
  )
}
