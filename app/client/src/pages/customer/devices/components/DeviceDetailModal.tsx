import { Button, Descriptions, InputNumber, message, Modal, Select, Space, Tag, Typography } from 'antd'
import { apiControlActuator, apiUpdateDeviceLocation, apiUpdateThreshold, type DeviceInfo } from '../../../../lib/deviceApi'
import type { LocationDTO } from '../../../../lib/locationApi'
import { useEffect, useState } from 'react'

const { Text, Link } = Typography

type Props = {
    visible: boolean
    device: DeviceInfo | null
    locations: LocationDTO[]
    onClose: () => void
    onUpdateSuccess: () => void
}

export function DeviceDetailModal({ visible, device, locations, onClose, onUpdateSuccess }: Props) {
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [threshold, setThreshold] = useState<number | null>()
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
    const [isEditingLocation, setIsEditingLocation] = useState(false)

    useEffect(() => {
        if (visible && device) {
            setThreshold(device.threshold ?? null)
            setSelectedLocationId(device.locationId)
            setIsEditingLocation(false)
        }
    }, [visible, device])

    const handleSaveLocation = async () => {
        if (!device) return

        try {
            setLoadingAction('SAVE_LOCATION')
            await apiUpdateDeviceLocation(device.deviceId, selectedLocationId)
            message.success(`Đã chuyển vị trí thành công`)

            setIsEditingLocation(false)
            onUpdateSuccess()
        } catch (error: any) {
            message.error(error.message || 'Lỗi cập nhật vị trí')
        } finally {
            setLoadingAction(null)
        }
    }

    const handleControl = async (action: string) => {
        if (!device) return
        
        // Check remote control setting
        const savedSettings = localStorage.getItem('system_settings')
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings)
                if (parsed.remoteControl === false) {
                    message.error('Không thể điều khiển thiết bị khi tính năng điều khiển từ xa đang bị tắt!')
                    return
                }
            } catch (e) {}
        }

        try {
            setLoadingAction(action)
            await apiControlActuator(device.deviceId, action)
            message.success(`Đã gửi lệnh ${action === 'ON' ? 'BẬT' : 'TẮT'} thiết bị`)
            onUpdateSuccess()
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
            onUpdateSuccess()
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
                            {isEditingLocation ? (
                                <Space>
                                    <Select
                                        value={selectedLocationId}
                                        style={{ width: 180 }}
                                        onChange={(val) => setSelectedLocationId(val)}
                                        options={[
                                            { label: 'Chưa có vị trí', value: null},
                                            ...locations.map(l => ({ label: l.locationName, value: l.locationId }))
                                        ]}
                                    />
                                    <Button type='primary' size='small' onClick={handleSaveLocation} loading={loadingAction === 'SAVE_LOCATION'}>Lưu</Button>
                                    <Button size='small' onClick={() => setIsEditingLocation(false)}>Hủy</Button>
                                </Space>
                            ) : (
                                <Space>
                                    <Text>{device.location || 'Chưa cập nhật'}</Text>
                                    <Button type='link' size='small' onClick={() => setIsEditingLocation(true)}>Sửa</Button>
                                </Space>
                            )}
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