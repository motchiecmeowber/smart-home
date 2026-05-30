import { Space, Table, Tag, Typography, type TableProps } from "antd";
import type { RequestItemDto } from "../../../../lib/requestApi";

const { Text } = Typography

type RequestTableProps = {
    loading: boolean
    data: RequestItemDto[]
    onRowClick: (record: RequestItemDto) => void
}

export function RequestTable({
    loading,
    data,
    onRowClick
}: RequestTableProps) {
    const columns: TableProps<RequestItemDto>['columns'] = [
        {
            title: "Thiết bị yêu cầu",
            dataIndex: ['device', 'deviceName'],
            key: 'deviceName',
            render: (text: string, record: RequestItemDto) => (
                <Space orientation="vertical" size={2} align="center">
                    <Text strong>{text || 'Thiết bị không tên'}</Text>
                    {record.device?.deviceType && (
                        <Tag color={record.device.deviceType === 'SENSOR' ? 'cyan' : 'orange'} style={{ margin: 0 }}>
                            {record.device.deviceType}
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: "Tài khoản yêu cầu",
            dataIndex: ['customer', 'username'],
            key: 'username',
            render: (text: string, record: RequestItemDto) => (
                <Space orientation="vertical" size={0}>
                    <Text>{text}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.customer?.user.email}</Text>
                </Space>
            )
        },
        {
            title: "Thời gian tạo",
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (dateString: string) => (
                <Text>{new Date(dateString).toLocaleDateString('vi-VN')}</Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
                let color = 'default'
                let label = 'CHỜ DUYỆT'

                if (status === 'APPROVED') {
                    color = 'success'
                    label = 'ĐÃ DUYỆT'
                }
                if ( status === 'REJECTED') {
                    color = 'error'
                    label = 'TỪ CHỐI'
                }

                return <Tag color={color}>{label}</Tag>
            }
        }
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="requestId"
            loading={loading}
            pagination={{ pageSize: 8 }}
            onRow={(record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: 'pointer'}
            })}
        />
    )
}