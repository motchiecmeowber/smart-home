import { Modal, Descriptions, Tag, Typography, Button } from 'antd';
import type { RequestItemDto } from '../../../../lib/requestApi';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Text } = Typography;

type RequestDetailModalProps = {
    visible: boolean
    request: RequestItemDto | null
    onClose: () => void
    onAction: (id: string, status: 'APPROVED' | 'REJECTED') => void
    onDelete: (id: string) => void
    actionLoading: boolean
};

export function RequestDetailModal({
    visible,
    request,
    onClose,
    onAction,
    onDelete,
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
            title={<span style={{ fontSize: 18, fontWeight: 700, color: '#122D3A' }}>Chi Tiết Yêu Cầu</span>}
            open={visible}
            onCancel={onClose}
            width={550}
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px 0 0' }}>
                    <Button
                        danger
                        loading={actionLoading}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Xóa yêu cầu?',
                                content: 'Bạn có chắc chắn muốn xóa yêu cầu này không? Hành động này không thể hoàn tác.',
                                okText: 'Xóa',
                                okType: 'danger',
                                cancelText: 'Hủy',
                                centered: true,
                                onOk: () => onDelete(request.requestId)
                            });
                        }}
                    >
                        Xóa
                    </Button>
                    
                    {isPending ? (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button 
                                danger 
                                icon={<CloseOutlined />} 
                                loading={actionLoading}
                                onClick={() => {
                                    Modal.confirm({
                                        title: 'Từ chối yêu cầu?',
                                        content: 'Tài khoản này sẽ không thể sử dụng thiết bị.',
                                        okText: 'Từ chối',
                                        okType: 'danger',
                                        cancelText: 'Hủy',
                                        centered: true,
                                        onOk: () => handleConfirm('REJECTED')
                                    });
                                }}
                            >
                                Từ Chối
                            </Button>

                            <Button 
                                type="primary" 
                                icon={<CheckOutlined />} 
                                loading={actionLoading} 
                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                onClick={() => {
                                    let confirmTitle = 'Phê duyệt yêu cầu?'
                                    let confirmContent = 'Cấp quyền sở hữu phần cứng cho người dùng ngay.'

                                    if (request.requestType === 'DELETE') {
                                        confirmTitle = 'Xác nhận gỡ bỏ thiết bị?'
                                        confirmContent = 'Thiết bị này sẽ bị gỡ khỏi tài khoản người dùng.'
                                    } else if (request.requestType === 'UPDATE') {
                                        confirmContent = 'Thông tin của thiết bị sẽ được cập nhật theo yêu cầu.'
                                    }

                                    Modal.confirm({
                                        title: confirmTitle,
                                        content: confirmContent,
                                        okText: 'Phê duyệt',
                                        cancelText: 'Hủy',
                                        centered: true,
                                        okButtonProps: { style: { background: '#0b5f95', borderColor: '#0b5f95' } },
                                        onOk: () => handleConfirm('APPROVED')
                                    });
                                }}
                            >
                                Phê Duyệt
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={onClose}>Đóng</Button>
                    )}
                </div>
            }
        >
            <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
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