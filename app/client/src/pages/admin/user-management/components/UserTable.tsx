import { Button, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { TableProps } from "antd";
import type { UserDto } from "../../../../lib/authApi";
import { DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../../../hooks/useAuth";

const { Text } = Typography

type UserTableProps = {
    loading: boolean
    data: UserDto[]
    onViewDetail: (userId: string) => void
    onDeleteUser: (userId: string) => void
}

export function UserTable({
    loading,
    data,
    onViewDetail,
    onDeleteUser
}: UserTableProps) {
    const { user } = useAuth();

    const columns: TableProps<UserDto>['columns'] = [
        {
            title: 'Tên tài khoản',
            dataIndex: 'username',
            key: 'username',
            width: '25%',
            render: (text: string) => (
                <Space>
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '35%',
            render: (text: string) => <Text>{text}</Text>
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: '20%',
            align: 'center',
            render: (role: string) => (
                <Tag color={role === 'ADMIN' ? 'volcano' : 'geekblue'}>
                    {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: '20%',
            align: 'center',
            render: (_: any, record: UserDto) => (
                <Space size={16}>
                    {user?.userId !== record.userId && (
                        <Popconfirm
                            title="Xóa người dùng"
                            description="Bạn có chắc chắn muốn xóa tài khoản này khỏi hệ thống?"
                            onConfirm={(e) => {
                                e?.stopPropagation()
                                onDeleteUser(record.userId)
                            }}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                style={{ fontWeight: 600, padding: 0}}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Xóa
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ]

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="userId"
            loading={loading}
            pagination={{ pageSize: 8 }}
            onRow={(record) => ({
                onClick: () => onViewDetail(record.userId),
                style: { cursor: 'pointer' }
            })}
        />
    )
}