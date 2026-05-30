import { Table, Card, Segmented, Typography, Button } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import type { Report, ReportType } from '../../../../lib/analyticsApi'

const { Text } = Typography

type ReportListProps = {
    reports: Report[];
    loading: boolean;
    timePeriod: 'today' | 'week' | 'month';
    onTimePeriodChange: (val: 'today' | 'week' | 'month') => void;
    onSelectReport: (reportId: string) => void;
}

export function ReportList({
    reports,
    loading,
    timePeriod,
    onTimePeriodChange,
    onSelectReport
}: ReportListProps) {
    const columns = [
        {
            title: 'Mã báo cáo',
            dataIndex: 'reportId',
            key: 'reportId',
            render: (id: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{id.slice(0, 8).toUpperCase()}</span>,
        },
        {
            title: 'Loại báo cáo',
            dataIndex: 'reportType',
            key: 'reportType',
            render: (type: ReportType) => {
                let text = 'Báo cáo ngày'
                let color = '#52c41a'
                if (type === 'WEEKLY') {
                    text = 'Báo cáo tuần'
                    color = '#1890ff'
                } else if (type === 'MONTHLY') {
                    text = 'Báo cáo tháng'
                    color = '#fa8c16'
                }
                return <span style={{ color, fontWeight: 600 }}>{text}</span>
            }
        },
        {
            title: 'Thời gian thống kê',
            key: 'timeRange',
            render: (record: Report) => {
                const start = dayjs(record.startTime).format('DD/MM/YYYY HH:mm')
                const end = dayjs(record.endTime).format('DD/MM/YYYY HH:mm')
                return `${start} - ${end}`
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record: Report) => (
                <Button 
                    type="link" 
                    icon={<FileTextOutlined />} 
                    onClick={(e) => {
                        e.stopPropagation()
                        onSelectReport(record.reportId)
                    }}
                    style={{ padding: 0 }}
                >
                    Xem chi tiết
                </Button>
            )
        }
    ]

    return (
        <Card 
            className="chart-card-dark" 
            title={
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#132f3e' }}>
                    Danh sách báo cáo 
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
                        ({reports.length} báo cáo)
                    </Text>
                </span>
            }
            extra={
                <div className="request-filter-tabs">
                    <Segmented
                        value={timePeriod}
                        onChange={(val) => onTimePeriodChange(val as 'today' | 'week' | 'month')}
                        options={[
                            { label: 'Hôm nay', value: 'today' },
                            { label: 'Tuần này', value: 'week' },
                            { label: 'Tháng này', value: 'month' }
                        ]}
                    />
                </div>
            }
            style={{ marginBottom: '24px' }}
        >
            <Table 
                dataSource={reports} 
                columns={columns} 
                rowKey="reportId"
                loading={loading}
                pagination={{ pageSize: 5 }}
                onRow={(record) => ({
                    onClick: () => onSelectReport(record.reportId),
                    style: { cursor: 'pointer' }
                })}
            />
        </Card>
    )
}
