import { Descriptions, Modal, Tag, Typography } from "antd";
import type { DeviceInfo } from "../../../../lib/deviceApi";

const { Text } = Typography

type DeviceDetailModalProps = {
    visible: boolean
    device: DeviceInfo | null
    onClose: () => void
}

export function DeviceDetailModal({
    visible,
    device,
    onClose
}: DeviceDetailModalProps) {
    if (!device) return null

    return (
        <Modal
            title={<span style={{ fontSize: 18, fontWeight: 800, color: '#122D3A' }}>Chi Tiết Thiết Bị</span>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Device ID">
                    <Text copyable style={{ fontFamily: 'monospace' }}>{device.deviceId}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="ThingsBoard ID">
                    <Text style={{ fontFamily: 'monospace' }}>{device.tbDeviceId}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Tên thiết bị">
                    <Text strong>{device.deviceName}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Loại thiết bị">
                    <Tag color={device.deviceType === 'SENSOR' ? 'cyan' : 'orange'}>{device.deviceType}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái vận hành">
                    <Tag color={device.status === 'ONLINE' ? 'success' : 'error'}>{device.status}</Tag>
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    )
}