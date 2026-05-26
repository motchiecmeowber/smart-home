import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Progress,
  Radio,
  Row,
  Space,
  Typography,
  Alert,
  Spin,
  Tooltip
} from 'antd'
import {
  BarChartOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from '@ant-design/icons'
import '../CustomerPages.css'
import './StatisticsPage.css'

const { Text, Title } = Typography

type EnergyDetail = {
  day: string
  total: number
  lighting: number
  sensors: number
  gas: number
}

const energyThisWeek: EnergyDetail[] = [
  { day: 'Thứ 2', total: 8.2, lighting: 5.0, sensors: 1.2, gas: 2.0 },
  { day: 'Thứ 3', total: 7.4, lighting: 4.2, sensors: 1.2, gas: 2.0 },
  { day: 'Thứ 4', total: 9.1, lighting: 5.9, sensors: 1.2, gas: 2.0 },
  { day: 'Thứ 5', total: 7.8, lighting: 4.6, sensors: 1.2, gas: 2.0 },
  { day: 'Thứ 6', total: 8.5, lighting: 5.3, sensors: 1.2, gas: 2.0 },
  { day: 'Thứ 7', total: 10.6, lighting: 7.4, sensors: 1.2, gas: 2.0 },
  { day: 'Chủ Nhật', total: 9.8, lighting: 6.6, sensors: 1.2, gas: 2.0 },
]

const energyLastWeek: EnergyDetail[] = [
  { day: 'Thứ 2', total: 7.5, lighting: 4.5, sensors: 1.0, gas: 2.0 },
  { day: 'Thứ 3', total: 8.0, lighting: 5.0, sensors: 1.0, gas: 2.0 },
  { day: 'Thứ 4', total: 6.8, lighting: 3.8, sensors: 1.0, gas: 2.0 },
  { day: 'Thứ 5', total: 7.0, lighting: 4.0, sensors: 1.0, gas: 2.0 },
  { day: 'Thứ 6', total: 8.2, lighting: 5.2, sensors: 1.0, gas: 2.0 },
  { day: 'Thứ 7', total: 9.5, lighting: 6.5, sensors: 1.0, gas: 2.0 },
  { day: 'Chủ Nhật', total: 10.1, lighting: 7.1, sensors: 1.0, gas: 2.0 },
]

type ClimatePoint = {
  time: string
  temp: number
  humid: number
}

const climateHistory: ClimatePoint[] = [
  { time: '08:00', temp: 28, humid: 65 },
  { time: '10:00', temp: 30, humid: 60 },
  { time: '12:00', temp: 32, humid: 55 },
  { time: '14:00', temp: 33, humid: 52 },
  { time: '16:00', temp: 31, humid: 58 },
  { time: '18:00', temp: 29, humid: 62 },
  { time: '20:00', temp: 27, humid: 68 },
]

type DeviceUsage = {
  name: string
  room: string
  hours: number
  percentage: number
  color: string
}

const deviceUsages: DeviceUsage[] = [
  { name: 'Bóng đèn thông minh', room: 'Phòng khách', hours: 6.5, percentage: 55, color: '#0b5f95' },
  { name: 'Nhiệt ẩm kế', room: 'Phòng khách', hours: 24.0, percentage: 100, color: '#fa8c16' },
  { name: 'Bóng đèn thông minh', room: 'Phòng ngủ', hours: 4.2, percentage: 35, color: '#52c41a' },
  { name: 'Nhiệt ẩm kế', room: 'Phòng ngủ', hours: 24.0, percentage: 100, color: '#13c2c2' },
  { name: 'Máy đo khí gas', room: 'Phòng bếp', hours: 24.0, percentage: 100, color: '#fa541c' },
  { name: 'Bóng đèn thông minh', room: 'Phòng bếp', hours: 3.5, percentage: 30, color: '#fadb14' },
]

export function StatisticsPage() {
  const [timePeriod, setTimePeriod] = useState<'this-week' | 'last-week'>('this-week')
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)

  const activeEnergyData = timePeriod === 'this-week' ? energyThisWeek : energyLastWeek
  const totalEnergy = activeEnergyData.reduce((sum, item) => sum + item.total, 0)
  const avgEnergy = (totalEnergy / activeEnergyData.length).toFixed(1)

  const handleExport = () => {
    setExporting(true)
    setExportSuccess(false)
    setTimeout(() => {
      setExporting(false)
      setExportSuccess(true)
      setTimeout(() => {
        setExportSuccess(false)
      }, 5000)
    }, 2500)
  }

  // Energy chart constants
  const chartHeight = 220
  const chartWidth = 500
  const maxEnergy = Math.max(...activeEnergyData.map((d) => d.total), 30)

  // Climate chart constants
  const climateChartHeight = 220
  const climateChartWidth = 500
  const maxClimateVal = 100 // Humidity goes up to 100%

  return (
    <section className="customer-page" aria-labelledby="statistics-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="statistics-title" level={1} className="customer-title">
            Báo cáo thống kê
          </Title>
        </div>

        <Button
          icon={exporting ? <Spin size="small" /> : <DownloadOutlined />}
          size="large"
          type="primary"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Đang xuất báo cáo...' : 'Xuất báo cáo'}
        </Button>
      </div>

      {exportSuccess && (
        <Alert
          className="statistics-alert"
          message="Xuất báo cáo thành công!"
          description="File báo cáo thống kê năng lượng tháng 5 đã được chuẩn bị và tự động tải xuống thiết bị của bạn."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          closable
          onClose={() => setExportSuccess(false)}
        />
      )}

      <Row className="statistics-summary" gutter={[14, 14]}>
        <Col lg={8} sm={12} xs={24}>
          <Card className="statistic-summary-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Tổng tiêu thụ năng lượng</Text>
                <Title level={2}>{totalEnergy.toFixed(1)} kWh</Title>
              </div>
              <div className="stat-icon-wrapper energy">
                <ThunderboltOutlined />
              </div>
            </div>
            <div className="card-footer green">
              <ArrowDownOutlined /> <Text strong>4.2%</Text> <Text type="secondary">so với tuần trước</Text>
            </div>
          </Card>
        </Col>
        <Col lg={8} sm={12} xs={24}>
          <Card className="statistic-summary-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Trung bình hàng ngày</Text>
                <Title level={2}>{avgEnergy} kWh</Title>
              </div>
              <div className="stat-icon-wrapper avg">
                <BarChartOutlined />
              </div>
            </div>
            <div className="card-footer green">
              <ArrowDownOutlined /> <Text strong>2.1%</Text> <Text type="secondary">tiêu thụ tối ưu</Text>
            </div>
          </Card>
        </Col>
        <Col lg={8} sm={24} xs={24}>
          <Card className="statistic-summary-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Thời gian hoạt động chính</Text>
                <Title level={2}>12.0 giờ/ngày</Title>
              </div>
              <div className="stat-icon-wrapper active-time">
                <ClockCircleOutlined />
              </div>
            </div>
            <div className="card-footer orange">
              <ArrowUpOutlined /> <Text strong>1.5 giờ</Text> <Text type="secondary">tăng do cuối tuần</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="statistics-charts-row">
        {/* Energy Column Chart Card */}
        <Col xl={14} lg={24} xs={24}>
          <Card
            title={
              <div className="chart-card-header">
                <Space>
                  <span className="chart-header-icon energy"><ThunderboltOutlined /></span>
                  <span>Điện năng tiêu thụ theo ngày</span>
                </Space>
                <Radio.Group
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  size="small"
                >
                  <Radio.Button value="this-week">Tuần này</Radio.Button>
                  <Radio.Button value="last-week">Tuần trước</Radio.Button>
                </Radio.Group>
              </div>
            }
            className="chart-card"
          >
            <div className="svg-chart-container">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = chartHeight - 40 - ratio * (chartHeight - 60)
                  const labelVal = Math.round(ratio * maxEnergy)
                  return (
                    <g key={ratio} className="grid-group">
                      <line
                        x1="45"
                        y1={yVal}
                        x2={chartWidth - 15}
                        y2={yVal}
                        stroke="#e8e8e8"
                        strokeDasharray="4,4"
                      />
                      <text x="35" y={yVal + 4} textAnchor="end" className="chart-axis-text">
                        {labelVal}
                      </text>
                    </g>
                  )
                })}

                {/* Bars */}
                {activeEnergyData.map((d, index) => {
                  const barWidth = 32
                  const colSpacing = (chartWidth - 80) / activeEnergyData.length
                  const xVal = 60 + index * colSpacing
                  const barHeight = (d.total / maxEnergy) * (chartHeight - 60)
                  const yVal = chartHeight - 40 - barHeight

                  const isHovered = hoveredBarIndex === index

                  return (
                    <g
                      key={d.day}
                      onMouseEnter={() => setHoveredBarIndex(index)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Interactive hover background */}
                      <rect
                        x={xVal - 8}
                        y="15"
                        width={barWidth + 16}
                        height={chartHeight - 50}
                        fill={isHovered ? '#f5f5f5' : 'transparent'}
                        rx="4"
                      />

                      {/* Bar segments - Bottom part (Other - Yellowish) */}
                      <rect
                        x={xVal}
                        y={yVal}
                        width={barWidth}
                        height={barHeight}
                        fill="#0b5f95"
                        rx="3"
                        className="chart-bar"
                      />

                      {/* Label under bar */}
                      <text
                        x={xVal + barWidth / 2}
                        y={chartHeight - 15}
                        textAnchor="middle"
                        className={`chart-axis-text ${isHovered ? 'bold' : ''}`}
                      >
                        {d.day}
                      </text>
                    </g>
                  )
                })}

                <text x={chartWidth / 2} y={chartHeight - 2} textAnchor="middle" className="chart-label-tip">
                  Di chuột vào cột để xem phân tích chi tiết tiêu thụ của từng phòng
                </text>
              </svg>

              {/* Float details panel based on hover */}
              <div className="chart-details-panel">
                {hoveredBarIndex !== null ? (
                  <div className="panel-content animate-fade">
                    <div className="panel-title">{activeEnergyData[hoveredBarIndex].day}</div>
                    <div className="panel-value">
                      Tổng: <span className="highlight">{activeEnergyData[hoveredBarIndex].total} kWh</span>
                    </div>
                    <div className="panel-breakdown">
                      <div className="breakdown-item">
                        <span className="dot lighting"></span> Bóng đèn: {activeEnergyData[hoveredBarIndex].lighting.toFixed(1)} kWh
                      </div>
                      <div className="breakdown-item">
                        <span className="dot sensors"></span> Nhiệt ẩm kế: {activeEnergyData[hoveredBarIndex].sensors.toFixed(1)} kWh
                      </div>
                      <div className="breakdown-item">
                        <span className="dot gas"></span> Máy đo khí gas: {activeEnergyData[hoveredBarIndex].gas.toFixed(1)} kWh
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="panel-placeholder">
                    <p>Di chuột lên cột đồ thị để xem cơ cấu điện năng tiêu thụ</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* Device Active List Card */}
        <Col xl={10} lg={24} xs={24}>
          <Card title="Thời lượng hoạt động của thiết bị" className="devices-active-card">
            <div className="device-usage-list">
              {deviceUsages.map((device) => (
                <div key={device.name} className="device-usage-item">
                  <div className="device-info">
                    <div>
                      <Text strong>{device.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {device.room}
                      </Text>
                    </div>
                    <div className="device-duration">
                      <ClockCircleOutlined /> <Text strong>{device.hours}h</Text> <Text type="secondary">/ ngày</Text>
                    </div>
                  </div>
                  <Progress
                    percent={device.percentage}
                    strokeColor={device.color}
                    showInfo={false}
                    strokeWidth={6}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: '20px' }}>
        {/* Climate Line Chart */}
        <Col span={24}>
          <Card
            title={
              <div className="chart-card-header">
                <Space>
                  <span className="chart-header-icon climate"><FireOutlined /></span>
                  <span>Diễn biến Nhiệt độ & Độ ẩm (24h qua)</span>
                </Space>
                <Space size={15} className="chart-legend">
                  <span className="legend-item"><span className="legend-color temp"></span> Nhiệt độ (°C)</span>
                  <span className="legend-item"><span className="legend-color humid"></span> Độ ẩm (%)</span>
                </Space>
              </div>
            }
            className="chart-card full-width"
          >
            <div className="svg-climate-chart-container">
              <svg viewBox={`0 0 ${climateChartWidth} ${climateChartHeight}`} className="svg-chart">
                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const yVal = climateChartHeight - 40 - ratio * (climateChartHeight - 60)
                  const labelVal = Math.round(ratio * maxClimateVal)
                  return (
                    <g key={ratio} className="grid-group">
                      <line
                        x1="45"
                        y1={yVal}
                        x2={climateChartWidth - 15}
                        y2={yVal}
                        stroke="#e8e8e8"
                        strokeDasharray="4,4"
                      />
                      <text x="35" y={yVal + 4} textAnchor="end" className="chart-axis-text">
                        {labelVal}
                      </text>
                    </g>
                  )
                })}

                {/* X Axis Labels */}
                {climateHistory.map((pt, index) => {
                  const colSpacing = (climateChartWidth - 80) / (climateHistory.length - 1)
                  const xVal = 60 + index * colSpacing
                  return (
                    <text
                      key={pt.time}
                      x={xVal}
                      y={climateChartHeight - 15}
                      textAnchor="middle"
                      className="chart-axis-text"
                    >
                      {pt.time}
                    </text>
                  )
                })}

                {/* Draw temperature line */}
                {(() => {
                  const pointsStr = climateHistory
                    .map((pt, index) => {
                      const colSpacing = (climateChartWidth - 80) / (climateHistory.length - 1)
                      const xVal = 60 + index * colSpacing
                      const yVal = climateChartHeight - 40 - (pt.temp / maxClimateVal) * (climateChartHeight - 60)
                      return `${xVal},${yVal}`
                    })
                    .join(' ')
                  return (
                    <polyline
                      fill="none"
                      stroke="#fa8c16"
                      strokeWidth="2.5"
                      points={pointsStr}
                    />
                  )
                })()}

                {/* Draw humidity line */}
                {(() => {
                  const pointsStr = climateHistory
                    .map((pt, index) => {
                      const colSpacing = (climateChartWidth - 80) / (climateHistory.length - 1)
                      const xVal = 60 + index * colSpacing
                      const yVal = climateChartHeight - 40 - (pt.humid / maxClimateVal) * (climateChartHeight - 60)
                      return `${xVal},${yVal}`
                    })
                    .join(' ')
                  return (
                    <polyline
                      fill="none"
                      stroke="#0b5f95"
                      strokeWidth="2.5"
                      points={pointsStr}
                    />
                  )
                })()}

                {/* Plot dots with Tooltips */}
                {climateHistory.map((pt, index) => {
                  const colSpacing = (climateChartWidth - 80) / (climateHistory.length - 1)
                  const xVal = 60 + index * colSpacing
                  const yTemp = climateChartHeight - 40 - (pt.temp / maxClimateVal) * (climateChartHeight - 60)
                  const yHumid = climateChartHeight - 40 - (pt.humid / maxClimateVal) * (climateChartHeight - 60)

                  return (
                    <g key={pt.time}>
                      {/* Temp Dot */}
                      <Tooltip title={`Thời điểm ${pt.time}: Nhiệt độ ${pt.temp}°C`}>
                        <circle
                          cx={xVal}
                          cy={yTemp}
                          r="5"
                          fill="#ffffff"
                          stroke="#fa8c16"
                          strokeWidth="2.5"
                          className="chart-dot"
                        />
                      </Tooltip>

                      {/* Humid Dot */}
                      <Tooltip title={`Thời điểm ${pt.time}: Độ ẩm ${pt.humid}%`}>
                        <circle
                          cx={xVal}
                          cy={yHumid}
                          r="5"
                          fill="#ffffff"
                          stroke="#0b5f95"
                          strokeWidth="2.5"
                          className="chart-dot"
                        />
                      </Tooltip>
                    </g>
                  )
                })}
              </svg>
            </div>
          </Card>
        </Col>
      </Row>
    </section>
  )
}
