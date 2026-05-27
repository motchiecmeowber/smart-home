import { Modal, Typography, Descriptions, Tag, Button } from "antd"
import type { RequestItemDto } from "../../../../lib/requestApi"

const { Text, Title } = Typography

type RequestDetailModalProps = {
    visible: boolean
    request: RequestItemDto | null
    onClose: () => void
}

export function RequestDetailModal({
    visible,
    request,
    onClose
}: RequestDetailModalProps) {
    if (!request) return null

    const handleClose = () => { onClose() }

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Chi tiết yêu cầu</Title>}
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button key="close" onClick={handleClose}>
                    Đóng
                </Button>
            ]}
            centered
            width={600}
        >
            <div style={{ padding: '8px 0' }}>
                <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Mã Yêu Cầu">
                        <Text copyable style={{ fontFamily: 'monospace' }}>{request.requestId}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Mã Thiết Bị">
                        {request.device?.deviceId ? (
                            <Text copyable style={{ fontFamily: 'monospace' }}>{request.device.tbDeviceId || request.device.deviceId}</Text>
                        ) : (
                            <Text type="secondary">N/A</Text>
                        )}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Loại Yêu Cầu">
                        <Tag color={request.requestType === 'ADD' ? 'blue' : request.requestType === 'UPDATE' ? 'orange' : 'red'}>
                            {request.requestType === 'ADD' ? 'THÊM MỚI' : request.requestType === 'UPDATE' ? 'CẬP NHẬT' : request.requestType === 'DELETE' ? 'GỠ BỎ' : 'N/A'}
                        </Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Tên Thiết Bị">
                        <Text strong>{request.device?.deviceName || 'N/A'}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Phân Loại">
                        {request.device?.deviceType ? (
                            <Tag color={request.device.deviceType === 'SENSOR' ? 'geekblue' : 'volcano'}>
                                {request.device.deviceType}
                            </Tag>
                        ) : (
                            <Text type="secondary">N/A</Text>
                        )}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Thời Gian Gửi">
                        <Text>{new Date(request.createdAt).toLocaleString('vi-VN')}</Text>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Trạng Thái">
                        <Tag color={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'error' : 'default'}>
                            {request.status === 'APPROVED' ? 'PHÊ DUYỆT' : request.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ XỬ LÝ'}
                        </Tag>
                    </Descriptions.Item>
                    
                    {request.status !== 'PENDING' && (
                        <Descriptions.Item label="Người Xử Lý">
                            <Text style={{ color: '#0B5F95', fontWeight: 700 }}>
                                {request.admin?.username ?? 'Hệ thống'}
                            </Text>
                        </Descriptions.Item>
                    )}
                </Descriptions>

                {request.note && request.status !== 'PENDING' && (
                    <div style={{ marginTop: 16 }}>
                        <Typography.Title level={5}>Ghi chú từ quản trị viên</Typography.Title>
                        <div style={{ 
                            padding: '12px 16px', 
                            background: request.status === 'REJECTED' ? '#fff1f0' : '#f6ffed', 
                            borderLeft: `4px solid ${request.status === 'REJECTED' ? '#ff4d4f' : '#52c41a'}`,
                            borderRadius: 4
                        }}>
                            <Text>{request.note}</Text>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}