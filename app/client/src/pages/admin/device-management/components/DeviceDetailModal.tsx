import { useEffect, useState } from "react";
import { Descriptions, Modal, Tag, Typography, Form, Input, Select, message, Spin, Button } from "antd";
import { apiGetDeviceById, apiUpdateDevice, apiDeleteDevice, type DeviceInfo } from "../../../../lib/deviceApi";
import { apiGetUsers } from "../../../../lib/userApi";
import type { UserDto } from "../../../../lib/authApi";

const { Text } = Typography

type DeviceDetailModalProps = {
    visible: boolean
    device: DeviceInfo | null
    onClose: () => void
    onUpdateSuccess: () => void
}

export function DeviceDetailModal({
    visible,
    device,
    onClose,
    onUpdateSuccess
}: DeviceDetailModalProps) {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [detailedDevice, setDetailedDevice] = useState<DeviceInfo | null>(null)
    const [customers, setCustomers] = useState<UserDto[]>([])

    useEffect(() => {
        if (visible && device?.deviceId) {
            setLoading(true)
            Promise.all([
                apiGetDeviceById(device.deviceId),
                apiGetUsers()
            ]).then(([deviceData, usersData]) => {
                    setDetailedDevice(deviceData);
                    setCustomers(usersData.filter(u => u.role === 'CUSTOMER'));
                    form.setFieldsValue({
                        deviceName: deviceData.deviceName,
                        customerId: deviceData.ownerId,
                    })
                })
                .catch((err) => {
                    message.error(err.message || 'Không thể lấy thông tin chi tiết')
                })
                .finally(() => {
                    setLoading(false)
                })
        } else {
            setDetailedDevice(null)
            form.resetFields()
        }
    }, [visible, device, form])

    const handleSave = async () => {
        if (!detailedDevice) return

        try {
            const values = await form.validateFields()
            setSaving(true)

            await apiUpdateDevice(detailedDevice.deviceId, {
                deviceName: values.deviceName,
                customerId: values.customerId || null
            })

            message.success('Cập nhật thiết bị thành công')
            onUpdateSuccess()
            onClose()
        } catch (error: any) {
            if (error?.errorFields) return
            message.error(error.message || 'Cập nhật thất bại')
        } finally {
            setSaving(false)
        }
    };

    const handleDelete = async () => {
        if (!detailedDevice) return;
        
        setDeleting(true)
        try {
            await apiDeleteDevice(detailedDevice.deviceId)
            message.success('Đã xóa thiết bị thành công')
            
            onUpdateSuccess()
            onClose()
        } catch (error: any) {
            message.error(error.message || 'Xóa thiết bị thất bại')
        } finally {
            setDeleting(false)
        }
    }

    if (!device) return null

    const displayDevice = detailedDevice || device;

    return (
        <Modal
            title={<span style={{ fontSize: 18, fontWeight: 800, color: '#122D3A' }}>Chi Tiết Thiết Bị</span>}
            open={visible}
            onCancel={onClose}
            width={600}
            footer={[
                <div key="footer-wrapper" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button 
                        danger 
                        loading={deleting}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Xóa thiết bị',
                                content: 'Bạn có chắc chắn muốn xóa thiết bị này không? Hành động này không thể hoàn tác.',
                                okText: 'Xóa',
                                okType: 'danger',
                                cancelText: 'Hủy',
                                onOk: handleDelete,
                                centered: true,
                            });
                        }}
                    >
                        Xóa thiết bị
                    </Button>
                    <div>
                        <Button onClick={onClose}>
                            Đóng
                        </Button>
                        <Button type="primary" loading={saving} onClick={handleSave} style={{ marginLeft: 8 }}>
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            ]}
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin description="Đang tải dữ liệu..." />
                </div>
            ) : (
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                    <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Device ID">
                            <Text copyable style={{ fontFamily: 'monospace' }}>{displayDevice.deviceId}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Serial">
                            <Text style={{ fontFamily: 'monospace' }}>{displayDevice.serial}</Text>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="ThingsBoard ID">
                            <Text style={{ fontFamily: 'monospace' }}>{displayDevice.tbDeviceId}</Text>
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại thiết bị">
                            <Tag color={displayDevice.deviceType === 'SENSOR' ? 'cyan' : 'orange'}>{displayDevice.deviceType}</Tag>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Trạng thái vận hành">
                            {displayDevice.status === 'ONLINE' && <Tag color="success">ONLINE</Tag>}
                            {displayDevice.status === 'OFFLINE' && <Tag color="error">OFFLINE</Tag>}
                            {displayDevice.status === 'DISCONNECTED' && <Tag color="default">DISCONNECTED</Tag>}
                        </Descriptions.Item>
                    </Descriptions>

                    <Form.Item
                        name="deviceName"
                        label={<Text strong>Tên thiết bị</Text>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị' }]}
                    >
                        <Input placeholder="Nhập tên thiết bị..." size="large" />
                    </Form.Item>



                    <Form.Item
                        name="customerId"
                        label={<Text strong>Người dùng sở hữu</Text>}
                    >
                        <Select 
                            size="large"
                            allowClear
                            placeholder="Chọn người dùng... (Bỏ trống để thu hồi)"
                            options={customers.map(c => ({ value: c.userId, label: c.email || c.username }))}
                        />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    )
}