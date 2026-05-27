import { Button, Space, Switch, Table, Tag, Typography } from "antd";
import type { ScheduleDTO } from "../../../../lib/scheduleApi";
import { InfoCircleOutlined, DashboardOutlined, FireOutlined, PoweroffOutlined } from "@ant-design/icons";

const { Text } = Typography

type SchedulesTableProps = {
    schedules: ScheduleDTO[]
    actuators?: any[]
    loading?: boolean
    onToggle: (id: string, checked: boolean) => void
    onDelete: (id: string) => void
    onView: (id: string) => void
}

export function SchedulesTable({ schedules, actuators = [], loading, onToggle, onView }: SchedulesTableProps) {
    const columns = [
        {
            title: 'Thiết bị & Phòng',
            key: 'device',
            render: (_: any, record: any) => {
                let icon = <PoweroffOutlined />
                let color = '#0b5f95'
                let bg = '#e6f7ff'
        
                if (record.deviceType === 'SENSOR') {
                    icon = <DashboardOutlined />
                    color = '#fa8c16'
                    bg = '#fff7e6'
                } else if (record.deviceType === 'GAS') {
                    icon = <FireOutlined />
                    color = '#fa541c'
                    bg = '#fff2e8'
                }
      
                const device = actuators.find(a => a.deviceId === record.actuatorId)
                const displayName = device ? device.deviceName : record.actuatorId
                const deviceType = device ? device.deviceType : record.deviceType

                return (
                    <Space size={12}>
                        <div
                            className="device-icon-wrapper"
                            style={{
                                backgroundColor: bg,
                                color: color,
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                            }}
                        >
                            {icon}
                        </div>

                        <div>
                            <Text strong>{displayName}</Text>
                            <br />
                            <Tag color={color} style={{ marginTop: 4 }}>
                                {deviceType === 'BULB'
                                    ? 'Bóng đèn'
                                    : deviceType === 'SENSOR'
                                    ? 'Nhiệt ẩm kế'
                                    : 'Thiết bị'}
                            </Tag>
                        </div>
                    </Space>
                )
            },
        },
        {
            title: 'Hành động',
            key: 'control',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Tag color="blue" style={{ fontSize: '12px'}}>
                    {record.action === 'ON' ? 'Bật thiết bị' : record.action === 'OFF' ? 'Tắt thiết bị' : record.action}
                </Tag>
            )
        },
        {
            title: 'Trạng thái',
            key: 'enabled',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Switch
                    checked={record.enabled}
                    onChange={(checked) => onToggle(record.scheduleId, checked)}
                />
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="link"
                        icon={<InfoCircleOutlined />}
                        onClick={() => onView(record.scheduleId)}
                        style={{ fontWeight: 600 }}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        }
    ]

    return (
        <Table
            columns={columns}
            dataSource={schedules}
            rowKey='scheduleId'
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="schedules-table"
        />
    )
}