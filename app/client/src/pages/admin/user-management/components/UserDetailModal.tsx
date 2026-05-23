import { Descriptions, Modal, Spin, Tag, Typography } from "antd";
import type { UserDetailInfo } from "../../../../lib/userApi";

const { Text } = Typography

type UserDetailModalProps = {
    visible: boolean
    loading: boolean
    user: UserDetailInfo | null
    onClose:() => void
}

export function UserDetailModal({
    visible,
    loading,
    user,
    onClose
}: UserDetailModalProps) {
    return (
        <Modal
            title={<span style={{ fontSize: 18, fontWeight: 800, color: '#122D3A' }}>Thông Tin Chi Tiết Thành Viên</span>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={550}
        >
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                    <Spin description="Đang tải dữ liệu..." />
                </div>
            ): user ? (
                <Descriptions bordered column={1} size="small" style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Mã ID">
                        <Text copyable style={{ fontFamily: 'monospace' }}>{user.userId}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Username">
                        <Text strong>{user.username}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Họ và Tên">
                        <Text>{user.firstName || user.lastName ? `${user.lastName ?? ''} ${user.firstName ?? ''}`.trim() : 'Chưa cập nhật'}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Email">
                        <Text>{user.email}</Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Phân quyền">
                        <Tag color={user.role === 'ADMIN' ? 'volcano' : 'geekblue'}>
                            {user.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                        </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thời gian tham gia">
                        <Text>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</Text>
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <div style={{ textAlign: 'center', padding: '16px 0'}}>
                    Không tìm thấy thông tin thành viên
                </div>
            )}
        </Modal>
    )
}