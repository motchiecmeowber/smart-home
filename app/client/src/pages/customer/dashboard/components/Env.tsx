import { Card, Col, Row, Typography, Spin } from "antd";
import { useUserDevices } from "../../../../hooks/useUserDevices";
import { useDeviceTelemetry } from "../../../../hooks/useDeviceTelemetry";
import { DashboardOutlined, SignalFilled, FireOutlined } from "@ant-design/icons";

const { Text, Title } = Typography

export function Env() {
    const { devices, loading } = useUserDevices()
    const { states: telemetry} = useDeviceTelemetry(devices)

    let tempSum = 0, tempCount = 0
    let humiSum = 0, humiCount = 0
    let gasSum = 0, gasCount = 0

    Object.values(telemetry).forEach(t => {
        if (t.latest.temperature !== undefined) {
            tempSum += Number(t.latest.temperature)
            tempCount++
        }
        if (t.latest.humidity !== undefined) {
            humiSum += Number(t.latest.humidity)
            humiCount++
        }
        if (t.latest.gas !== undefined) {
            gasSum += Number(t.latest.gas)
            gasCount++
        }
    })

    // Calculate Avg
    const avgTemp = tempCount > 0 ? (tempSum / tempCount).toFixed(1) : '--'
    const avgHumi = humiCount > 0 ? (humiSum / humiCount).toFixed(0) : '--'
    const avgGas = gasCount > 0 ? (gasSum / gasCount).toFixed(0) : '--'

    return (
        <div style={{ marginBottom: 24 }}>
            <div className="dashboard-section-title">Tổng Quan Môi Trường</div>

            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    {/* Temp */}
                    <Col xs={24} sm={8}>
                        <Card className="env-card" variant="borderless" styles={{ body: {padding: 0} }}>
                            <div className="env-card-body">
                                <div className="env-icon-wrapper temp"><DashboardOutlined /></div>

                                <Title className="env-value">{avgTemp}{avgTemp !== '--' ? '°C' : ''}</Title>
                                <Text className="env-label">Nhiệt độ trung bình</Text>
                            </div>
                        </Card>
                    </Col>

                    {/* Humi */}
                    <Col xs={24} sm={8}>
                        <Card className="env-card" variant="borderless" styles={{ body: {padding: 0} }}>
                            <div className="env-card-body">
                                <div className="env-icon-wrapper humid"><SignalFilled /></div>

                                <Title className="env-value">{avgHumi}{avgHumi !== '--' ? '%' : ''}</Title>
                                <Text className="env-label">Độ ẩm trung bình</Text>
                            </div>
                        </Card>
                    </Col>

                    {/* Gas */}
                    <Col xs={24} sm={8}>
                        <Card className="env-card" variant="borderless" styles={{ body: {padding: 0} }}>
                            <div className="env-card-body">
                                <div className="env-icon-wrapper gas"><FireOutlined /></div>

                                <Title className="env-value">{avgGas}{avgGas !== '--' ? '%' : ''}</Title>
                                <Text className="env-label">Nồng độ Gas trung bình</Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Spin>
        </div>
    )
}