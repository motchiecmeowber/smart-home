import { useEffect, useState } from "react"
import { apiGetScheduleDetail, type ScheduleDTO } from "../../../../lib/scheduleApi"
import { Descriptions, message, Modal, Space, Spin, Tag, Typography, Button } from "antd"
import { ClockCircleOutlined, DashboardOutlined, FireOutlined, PoweroffOutlined, EditOutlined } from "@ant-design/icons"

const { Text } = Typography

type ScheduleDetailModal = {
    scheduleId: string | null,
    actuators?: any[]
    open: boolean
    onClose: () => void
    onDelete?: (id: string) => void
    onEdit?: (schedule: ScheduleDTO) => void
}

export function ScheduleDetailModal({
    scheduleId,
    actuators = [],
    open,
    onClose,
    onDelete,
    onEdit
}: ScheduleDetailModal) {
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState<ScheduleDTO | null>(null)

    useEffect(() => {
        if (open && scheduleId) {
            fetchDetail(scheduleId)
        } else {
            setDetail(null)
        }
    }, [open, scheduleId])

    const fetchDetail = async (id: string) => {
        try {
            setLoading(true)
            const data = await apiGetScheduleDetail(id)
            setDetail(data)
        } catch (error: any) {
            message.error(error.message || 'Lỗi lấy chi tiết lịch trình')
        } finally {
            setLoading(false)
        }
    }

    const getDeviceIcon = (type?: string) => {
        if (type === 'SENSOR') return <DashboardOutlined style={{ color: '#fa8c16' }} />
        if (type === 'GAS') return <FireOutlined style={{ color: '#fa541c' }} />
        return <PoweroffOutlined style={{ color: '#0b5f95' }} />
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
            )
        }

        if (!detail) {
            return <div style={{ textAlign: 'center', padding: '20px 0' }}>Không có dữ liệu</div>
        }

        const device = actuators.find(a => a.deviceId === (detail as any).actuatorId)
        const displayName = device ? device.deviceName : (detail as any).actuatorId
        const deviceType = device ? device.deviceType : (detail as any).deviceType

        return (
            <Descriptions bordered column={1} styles={{ label: { width: '150px' } }}>
                <Descriptions.Item label="Thiết bị">
                    <Space>
                        {getDeviceIcon(deviceType)}
                        <Text strong>{displayName}</Text>
                    </Space>
                </Descriptions.Item>
            
                <Descriptions.Item label="Hành động">
                    <Tag color="blue">
                        {detail.action === 'ON' ? 'Bật thiết bị' : detail.action === 'OFF' ? 'Tắt thiết bị' : detail.action}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Thời gian chạy">
                    <Space>
                        <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
                        <Text strong>{detail.startTime || 'Không xác định'}</Text>
                    </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Tần suất">
                    <Text>
                        {detail.frequency === 'DAILY' ? 'Hàng ngày' : detail.frequency === 'WEEKLY' ? 'Hàng tuần' : detail.frequency === 'ONCE' ? 'Chỉ một lần' : detail.frequency || 'Khác'}
                    </Text>
                </Descriptions.Item>

                {detail.duration && (
                    <Descriptions.Item label="Thời lượng">
                        <Text strong>{detail.duration} phút</Text>
                    </Descriptions.Item>
                )}
            </Descriptions>
        )
    }

    return (
        <Modal
            title="Chi tiết lịch trình"
            open={open}
            onCancel={onClose}
            footer={
                detail ? [
                    <Button key="delete" danger onClick={() => onDelete && onDelete(detail.scheduleId)}>
                        Xóa lịch trình
                    </Button>,
                    <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => onEdit && onEdit(detail)}>
                        Cập nhật
                    </Button>
                ] : null
            }
            destroyOnHidden
            centered
        >
            {renderContent()}
        </Modal>
    )
}