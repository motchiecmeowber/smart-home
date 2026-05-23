import { Modal, Descriptions, Tag, Typography, Button, Popconfirm } from 'antd';
import type { RequestItemDto } from '../../../../lib/requestApi';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

type RequestDetailModalProps = {
    visible: boolean
    request: RequestItemDto | null
    onClose: () => void
    onAction: (id: string, status: 'APPROVED' | 'REJECTED') => void
    actionLoading: boolean
};

export function RequestDetailModal({
    visible,
    request,
    onClose,
    onAction,
    actionLoading
}: RequestDetailModalProps) {
    if (!request) return null;

    const isPending = request.status === 'PENDING'
    const handleConfirm = (status: 'APPROVED' | 'REJECTED') => {
        onAction(request.requestId, status);
        onClose();
    };

    return (
        <Modal
            title={<span style={{ fontSize: 18, fontWeight: 800, color: '#122D3A' }}>Chi Tiết Yêu Cầu</span>}
            open={visible}
            onCancel={onClose}
            width={550}
            footer={
                isPending ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '10px 0 0' }}>
                        <Popconfirm
                            title="Từ chối yêu cầu?"
                            description="Tài khoản này sẽ không thể sử dụng thiết bị."
                            onConfirm={() => handleConfirm('REJECTED')}
                            okText="Từ chối"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger icon={<CloseOutlined />} loading={actionLoading}>
                                Từ Chối
                            </Button>
                        </Popconfirm>

                        <Popconfirm
                            title="Phê duyệt yêu cầu?"
                            description="Cấp quyền sở hữu phần cứng cho người dùng ngay."
                            onConfirm={() => handleConfirm('APPROVED')}
                            okText="Phê duyệt"
                            cancelText="Hủy"
                        >
                            <Button type="primary" icon={<CheckOutlined />} loading={actionLoading} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                                Phê Duyệt
                            </Button>
                        </Popconfirm>
                    </div>
                ) : null
            }
        >
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Mã Yêu Cầu">
                    <Text copyable style={{ fontFamily: 'monospace' }}>{request.requestId}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Mã Thiết Bị">
                    {request.device?.deviceId ? (
                        <Text copyable style={{ fontFamily: 'monospace' }}>{request.device.deviceId}</Text>
                    ) : (
                        <Text type="secondary">N/A</Text>
                    )}
                </Descriptions.Item>
                
                <Descriptions.Item label="Tên Thiết Bị">
                    <Text strong>{request.device?.deviceName || 'N/A'}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Phân Loại">
                    <Tag color={request.device?.deviceType === 'SENSOR' ? 'geekblue' : 'volcano'}>
                        {request.device?.deviceType}
                    </Tag>
                </Descriptions.Item>
                
                <Descriptions.Item label="Tài Khoản Gửi">
                    <Text strong>{request.customer?.username}</Text> <Text type="secondary">({request.customer?.email})</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Thời Gian Gửi">
                    <Text>{new Date(request.createdAt).toLocaleString('vi-VN')}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Trạng Thái">
                    <Tag color={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'error' : 'default'}>
                        {request.status === 'APPROVED' ? 'PHÊ DUYỆT' : request.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ XỬ LÝ'}
                    </Tag>
                </Descriptions.Item>
                
                {!isPending && (
                    <Descriptions.Item label="Người Xử Lý">
                        <Text style={{ color: '#0B5F95', fontWeight: 700 }}>
                            {request.admin?.username ?? 'Hệ thống'}
                        </Text>
                    </Descriptions.Item>
                )}
            </Descriptions>
        </Modal>
    );
}