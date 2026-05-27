import { Button, Descriptions, InputNumber, message, Modal, Space, Tag, Typography } from 'antd'
import { apiControlActuator, apiUpdateThreshold, type DeviceInfo } from '../../../../lib/deviceApi'
import { useEffect, useState } from 'react'

const { Text, Link } = Typography

type Props = {
    visible: boolean
    device: DeviceInfo | null
    onClose: () => void
}

export function DeviceDetailModal({ visible, device, onClose }: Props) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [threshold, setThreshold] = useState<number | null>()

    useEffect(() => {
        if (visible && device) {
            setThreshold(device.threshold ?? null)
        }
    }, [visible, device])

    const handleControl = async (action: string) => {
        if (!device) return
        
        try {
            setLoadingAction(action)
            await apiControlActuator(device.deviceId, action)
            message.success(`Đã gửi lệnh ${action === 'ON' ? 'BẬT' : 'TẮT'} thiết bị`)
        } catch (error: any) {
            message.error(error.message || 'Lỗi điều khiển thiết bị')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleUpdateThreshold = async () => {
        if (!device || threshold === null || threshold === undefined) {
            message.warning('Vui lòng nhập ngưỡng cảnh báo')
            return
        }

        try {
            setLoadingAction('SAVE_THRESHOLD')
            await apiUpdateThreshold(device.deviceId, threshold)
            message.success('Đã cập nhật ngưỡng cảnh báo thành công')
        } catch (error: any) {
            message.error(error.message || 'Lỗi cập nhật ngưỡng cảnh báo')
        } finally {
            setLoadingAction(null)
        }
    }
    
    return (
        <Modal
            title={device?.deviceName}
            open={visible}
            onCancel={onClose}
            footer={null}
            destroyOnHidden
            width={600}
            centered
        >
            {device ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Descriptions bordered size='small' column={1}>
                        <Descriptions.Item label='Phòng/Khu vực'>
                            {device.location || 'Chưa cập nhật'}
                        </Descriptions.Item>
                        
                        <Descriptions.Item label='Loại thiết bị'>
                            {device.deviceType === 'SENSOR' ? 'CẢM BIẾN' : 'CHẤP HÀNH'}
                        </Descriptions.Item>

                        <Descriptions.Item label='Mã Serial'>
                            <Text type='secondary'>{device.serial}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label='Trạng thái'>
                            <Tag color={device.status === 'ONLINE' ? 'green' : 'red'}>
                                {device.status}
                            </Tag>
                        </Descriptions.Item>

                        {device.deviceType === 'SENSOR' && (
                            <>
                                <Descriptions.Item label='Ngưỡng cảnh báo'>
                                    {device.threshold !== null ? device.threshold : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label='Đơn vị đo'>
                                    {device.unit || 'N/A'}
                                </Descriptions.Item>
                            </>
                        )}
                    </Descriptions>

                    {/* Setup */}
                    <div style={{ padding: '16px', background: '#F5F5F5', borderRadius: '8px' }}>
                        {device.deviceType === 'ACTUATOR' ? (
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Điều khiển từ xa
                                </Text>

                                <Space size='large'>
                                    <Button type='primary' style={{ background: '#52C14A' }} loading={loadingAction === 'ON'} onClick={() => handleControl("ON")}>
                                        BẬT (ON)
                                    </Button>
                                    <Button type='primary' danger loading={loadingAction === 'OFF'} onClick={() => handleControl("OFF")}>
                                        TẮT (OFF)
                                    </Button>
                                </Space>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>
                                    Cài đặt ngưỡng cảnh báo
                                </Text>

                                <Space size='large'>
                                    <InputNumber controls={false} placeholder='Nhập giá trị...' value={threshold} onChange={(val) => setThreshold(val)} style={{ width: '150px'}} />
                                    
                                    <Button type='primary' loading={loadingAction === 'SAVE_THRESHOLD'} onClick={handleUpdateThreshold}>
                                        Lưu
                                    </Button>
                                </Space>
                            </div>
                        )}
                    </div>

                    {/* Navigation for request */}
                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <Text type='secondary' style={{ fontSize: '13px' }}>
                            Cần cập nhật hoặc gỡ bỏ thiết bị này? <br/>
                            Vui lòng chuyển sang trang <Link onClick={(e) => {
                                e.preventDefault()
                                onClose()
                                window.history.pushState(null, '', '/requests')
                                window.dispatchEvent(new Event('popstate'))
                            }}><strong>Yêu cầu của tôi</strong></Link> để được hỗ trợ.
                        </Text>
                    </div>
                </div>
            ) : null}
        </Modal>
    )
}