import { Card, Typography } from "antd";
import type { DeviceInfo } from "../../../../lib/deviceApi";

const { Text, Title } = Typography

type DeviceCardProps = {
    device: DeviceInfo
    onClick: () => void
}

export function DeviceCard({ device, onClick }: DeviceCardProps) {
    const isOnline = device.status === 'ONLINE'

    return (
        <Card 
            className="device-card"
            size="small"
            onClick={onClick}
            style={{
                cursor: 'pointer',
                borderColor: isOnline ? '#9ACAFF' : '#D9D9D9'
            }}
            hoverable
        >
            <div className="device-item">
                <span
                    className="device-icon"
                    aria-hidden="true"
                    style={{ background: isOnline ? '#E6F7FF' : '#F5F5F5' }}
                >
                    {device.deviceName.charAt(0).toUpperCase()}
                </span>

                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        {device.deviceName}
                    </Title>

                    <Text type="secondary" style={{ color: isOnline ? '#52C41A' : '#FF4D4F' }}>
                        ● {device.status}
                    </Text>
                </div>
            </div>
        </Card>
    )
}