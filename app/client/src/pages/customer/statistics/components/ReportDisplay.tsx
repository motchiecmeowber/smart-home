import { Card, Col, Row, Statistic, Typography } from 'antd'
import { DashboardOutlined, CompassOutlined, FireOutlined, AlertOutlined } from '@ant-design/icons'
import type { Report, SummaryData } from '../../../../lib/analyticsApi'
import type { DeviceInfo } from '../../../../lib/deviceApi'
import type { SensorFilterType } from './FilterBar'
import { SensorChart } from './SensorChart'

const { Text, Title } = Typography

interface ReportDisplayProps {
    report: Report
    devices: DeviceInfo[]
    filterType: SensorFilterType
    selectedRoom: string
    selectedDevice: string
    allowedSensors?: string[] | null
}

export function ReportDisplay({ report, devices, filterType, selectedRoom, selectedDevice, allowedSensors }: ReportDisplayProps) {
    const summaryData = report.summaryData ?? []

    // Group summary data by sensorId
    const sensorDataGroups = summaryData.reduce((acc, item) => {
        if (!acc[item.sensorId]) { acc[item.sensorId] = [] }
        acc[item.sensorId].push(item)
        return acc;
    }, {} as Record<string, SummaryData[]>)

    // Filter groups based on selectedRoom, selectedDevice, allowedSensors and filterType
    const filteredSensors = Object.entries(sensorDataGroups).filter(([sensorId]) => {
        const device = devices.find((d) => d.deviceId === sensorId)
        if (!device) return false

        // Filter by room
        if (selectedRoom !== 'ALL' && device.locationId !== selectedRoom) {
            return false
        }

        // Filter by specific device
        if (selectedDevice !== 'ALL' && sensorId !== selectedDevice) {
            return false
        }

        // Filter by allowedSensors list (generated custom selection)
        if (allowedSensors && !allowedSensors.includes(sensorId)) {
            return false
        }

        return true
    })

    if (summaryData.length === 0) {
        return (
            <div className="empty-preview-container animate-fade" style={{ minHeight: '200px' }}>
                <CompassOutlined style={{ fontSize: '32px', color: '#8c8c8c', marginBottom: '12px' }} />
                <Text style={{ color: '#8c8c8c' }}>Báo cáo này không chứa dữ liệu thống kê.<br>Cảm biến có thể đã ngoại tuyến hoặc không có dữ liệu ghi nhận trong khoảng thời gian này.</br></Text>
            </div>
        )
    }

    if (filteredSensors.length === 0) {
        return (
            <div className="empty-preview-container animate-fade" style={{ minHeight: '200px' }}>
                <CompassOutlined style={{ fontSize: '32px', color: '#8c8c8c', marginBottom: '12px' }} />
                <Text style={{ color: '#8c8c8c' }}>Không tìm thấy cảm biến hoặc vị trí phù hợp với bộ lọc hiện tại.</Text>
            </div>
        )
    }

    const formatMetricName = (name: string) => {
        if (name.includes('TEMPERATURE')) return 'Nhiệt độ'
        if (name.includes('HUMIDITY')) return 'Độ ẩm'
        if (name.includes('GAS')) return 'Nồng độ Gas'

        return name
    }

    const getMetricUnit = (name: string) => {
        if (name.includes('TEMPERATURE')) return '°C'
        if (name.includes('HUMIDITY')) return '%'
        if (name.includes('GAS')) return '%'

        return ''
    }

    const getMetricIcon = (name: string) => {
        if (name.includes('TEMPERATURE')) return <FireOutlined style={{ color: '#fa8c16' }} />
        if (name.includes('HUMIDITY')) return <CompassOutlined style={{ color: '#177ddc' }} />
        if (name.includes('GAS')) return <AlertOutlined style={{ color: '#52c41a' }} />
        
        return <DashboardOutlined />
    }

    return (
        <div className="report-display-root animate-fade">
            <Title level={4} style={{ color: '#0b2a3a', marginBottom: '20px' }}>
                Chi tiết báo cáo ({report.reportType})
            </Title>

            <Row gutter={[20, 20]}>
                {filteredSensors.map(([sensorId, metrics]) => {
                    const device = devices.find((d) => d.deviceId === sensorId)
                    const sensorName = device?.deviceName ?? `Cảm biến (${sensorId.slice(0, 6)})`
                    const roomName = device?.location ?? 'Chưa gán vị trí'

                    // Group metrics by type (TEMPERATURE, HUMIDITY, GAS)
                    const metricsByType = metrics.reduce((acc, m) => {
                        let type = ''
                        if (m.metricName.startsWith('TEMPERATURE')) type = 'TEMPERATURE'
                        else if (m.metricName.startsWith('HUMIDITY')) type = 'HUMIDITY'
                        else if (m.metricName.startsWith('GAS')) type = 'GAS'

                        if (type) {
                            if (!acc[type]) acc[type] = {}
                            if (m.metricName.endsWith('_MIN')) acc[type].min = m.value
                            if (m.metricName.endsWith('_MAX')) acc[type].max = m.value
                            if (m.metricName.endsWith('_AVG')) acc[type].avg = m.value
                        }
                        return acc
                    }, {} as Record<string, { min?: number; max?: number; avg?: number }>)

                    // Filter metrics to display based on filterType
                    const displayedMetricTypes = Object.entries(metricsByType).filter(([type]) => {
                        if (filterType !== 'ALL' && type !== filterType) return false
                        return true
                    })

                    if (displayedMetricTypes.length === 0) return null

                    return (
                        <Col key={sensorId} xs={24} md={12}>
                            <Card
                                className="chart-card-dark"
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {displayedMetricTypes.length > 0 && getMetricIcon(displayedMetricTypes[0][0])}
                                        <span style={{ color: '#0b2a3a', fontWeight: 700 }}>{sensorName}</span>
                                    </div>
                                }
                                extra={
                                    <span style={{ fontSize: '12px', color: '#177ddc', background: 'rgba(23, 125, 220, 0.12)', padding: '3px 10px', borderRadius: '4px', fontWeight: 600 }}>
                                        {roomName}
                                    </span>
                                }
                                style={{ borderRadius: '12px', height: '100%', boxShadow: '0 4px 14px rgba(30, 50, 62, 0.03)', border: '1px solid #e1e9ee' }}
                            >
                                {displayedMetricTypes.map(([type, stats]) => (
                                    <div key={type}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <Text type="secondary" style={{ fontSize: '13px' }}>Chỉ số theo dõi: </Text>
                                            <Text style={{ fontWeight: 600, color: '#0b2a3a' }}>{formatMetricName(type)}</Text>
                                        </div>

                                        <Row gutter={8} align="middle">
                                            <Col span={8}>
                                                <Statistic
                                                    title={<span style={{ color: '#8c8c8c', fontSize: '12px' }}>Thấp nhất</span>}
                                                    value={stats.min ?? 0}
                                                    precision={1}
                                                    style={{ color: '#595959', fontSize: '18px', fontWeight: 600 }}
                                                    suffix={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>{getMetricUnit(type)}</span>}
                                                />
                                            </Col>

                                            <Col span={8}>
                                                <Statistic
                                                    title={<span style={{ color: '#8c8c8c', fontSize: '12px' }}>Trung bình</span>}
                                                    value={stats.avg ?? 0}
                                                    precision={1}
                                                    style={{ color: '#0b5f95', fontSize: '22px', fontWeight: 800 }}
                                                    suffix={<span style={{ fontSize: '13px', color: '#0b5f95', fontWeight: 700 }}>{getMetricUnit(type)}</span>}
                                                />
                                            </Col>

                                            <Col span={8}>
                                                <Statistic
                                                    title={<span style={{ color: '#8c8c8c', fontSize: '12px' }}>Cao nhất</span>}
                                                    value={stats.max ?? 0}
                                                    precision={1}
                                                    style={{ color: '#fa8c16', fontSize: '18px', fontWeight: 600 }}
                                                    suffix={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>{getMetricUnit(type)}</span>}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <SensorChart 
                                            sensorId={sensorId}
                                            startTime={report.startTime}
                                            endTime={report.endTime}
                                            metricType={type}
                                        />
                                    </div>
                                ))}
                            </Card>
                        </Col>
                    )
                })}
            </Row>
        </div>
    )
}