import { Button, Table, Tag, Typography, type TableProps } from "antd";
import type { DeviceInfo } from "../../../../lib/deviceApi";
import { InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography

type DeviceTableProps = {
    loading: boolean
    data: DeviceInfo[]
    onViewDetail: (device: DeviceInfo) => void
}

export function DeviceTable({
    loading,
    data,
    onViewDetail
}: DeviceTableProps) {
    const columns: TableProps<DeviceInfo>['columns'] = [
        {
            title: 'Tên thiết bị',
            dataIndex: 'deviceName',
            key: 'deviceName',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Phân loại',
            dataIndex: 'deviceType',
            key: 'deviceType',
            align: 'center',
            render: (type: string) => (
                <Tag color={type === 'SENSOR' ? 'cyan' : 'orange'}>
                    {type === 'SENSOR' ? 'CẢM BIẾN' : 'CHẤP HÀNH'}
                </Tag>
            )
        },
        {
            title: 'Người sở hữu',
            key: 'owner',
            align: 'center',
            render: (_: any, record: DeviceInfo) => (
                record.hasOwner ? (
                    <Tag color="#02183C">ĐÃ CÓ</Tag>
                ) : (
                    <Tag color="default">CHƯA CÓ</Tag>
                )
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_: any, record: DeviceInfo) => (
                <Button
                    type="link"
                    icon={<InfoCircleOutlined />}
                    onClick={() => onViewDetail(record)}
                    style={{ fontWeight: 600 }}
                >
                    Chi tiết
                </Button>
            )
        }
    ]

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="deviceId"
            loading={loading}
            pagination={{ pageSize: 8 }}
        />
    )
}