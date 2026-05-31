import { Table, Tag, Typography, Button, Space, Avatar } from 'antd'
import { ArrowRightOutlined, RobotOutlined, BulbOutlined } from '@ant-design/icons'
import type { RequestItemDto } from '../../../../lib/requestApi'

const { Title, Text } = Typography

interface RecentRequestsProps {
  requests: RequestItemDto[]
  onNavigateToRequests: () => void
}

export function RecentRequests({ requests, onNavigateToRequests }: RecentRequestsProps) {
  const columns = [
    {
      title: 'Thiết bị',
      dataIndex: ['device', 'deviceName'],
      key: 'deviceName',
      render: (text: string, record: RequestItemDto) => {
        const isSensor = record.device?.deviceType === 'SENSOR'
        return (
          <Space size={12}>
            <Avatar 
              shape="square" 
              size="large" 
              icon={isSensor ? <BulbOutlined /> : <RobotOutlined />} 
              style={{ backgroundColor: isSensor ? '#E6F7FF' : '#FFF7E6', color: isSensor ? '#1890FF' : '#FA8C16', borderRadius: 8 }} 
            />
            <Space orientation="vertical" size={0}>
              <Text strong>{text || 'Thiết bị không tên'}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.device?.deviceId?.substring(0, 8).toUpperCase() || '—'}</Text>
            </Space>
          </Space>
        )
      },
    },
    {
      title: 'Tài khoản',
      dataIndex: ['customer', 'username'],
      key: 'customer',
      render: (_: any, record: RequestItemDto) => (
        <Space orientation="vertical" size={0}>
          <Text style={{ fontWeight: 500 }}>{record.customer?.user?.username || 'Không rõ'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.customer?.user?.email || ''}</Text>
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (dateStr: string) => {
        const d = new Date(dateStr)
        return <Text>{d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {d.toLocaleDateString('vi-VN')}</Text>
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default'
        let label = 'CHỜ DUYỆT'
        
        if (status === 'APPROVED') {
          color = 'success'
          label = 'ĐÃ DUYỆT'
        } else if (status === 'REJECTED') {
          color = 'error'
          label = 'TỪ CHỐI'
        }
        
        return <Tag color={color}>{label}</Tag>
      },
    },
  ]

  return (
    <div style={{ marginTop: 24, background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: '#122D3A', fontWeight: 700 }}>Yêu cầu mới nhất</Title>
        <Button type="link" onClick={onNavigateToRequests} style={{ fontWeight: 600 }}>
          Xem tất cả <ArrowRightOutlined />
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="requestId"
        pagination={false}
        size="middle"
        locale={{ emptyText: 'Không có yêu cầu chờ duyệt nào' }}
      />
    </div>
  )
}