import { Card, Col, Row, Typography } from 'antd'
import { UserOutlined, AppstoreAddOutlined, CheckCircleOutlined, FormOutlined, ThunderboltOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export interface DashboardStats {
  totalUsers: number
  totalDevices: number
  onlineDevices: number
  pendingRequests: number
}

interface StatCardsProps {
  stats: DashboardStats
}

export function StatCards({ stats }: StatCardsProps) {
  const onlineRate = stats.totalDevices > 0 ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0;

  return (
    <Row gutter={[24, 24]} align="stretch">
      {/* Users Card */}
      <Col xs={24} sm={12} xl={6}>
        <Card variant="borderless"
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #1890FF', height: '100%' }} 
          styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Tổng khách hàng</Text>
              <Title level={2} style={{ margin: '8px 0 16px 0', fontWeight: 700, color: '#122D3A' }}>
                {stats.totalUsers.toLocaleString()}
              </Title>
            </div>
            <div style={{ background: '#F0F5FF', padding: 8, borderRadius: 8 }}>
              <UserOutlined style={{ fontSize: 20, color: '#1890FF' }} />
            </div>
          </div>
        </Card>
      </Col>

      {/* Devices Card */}
      <Col xs={24} sm={12} xl={6}>
        <Card variant="borderless" 
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #FA8C16', height: '100%' }}
          styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Tổng thiết bị</Text>
              <Title level={2} style={{ margin: '8px 0 16px 0', fontWeight: 700, color: '#122D3A' }}>
                {stats.totalDevices.toLocaleString()}
              </Title>
            </div>
            <div style={{ background: '#FFF7E6', padding: 8, borderRadius: 8 }}>
              <AppstoreAddOutlined style={{ fontSize: 20, color: '#FA8C16' }} />
            </div>
          </div>
        </Card>
      </Col>

      {/* Online Devices Card */}
      <Col xs={24} sm={12} xl={6}>
        <Card variant="borderless" 
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #52C41A', height: '100%' }}
          styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
          >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Thiết bị hoạt động</Text>
              <Title level={2} style={{ margin: '8px 0 16px 0', fontWeight: 700, color: '#122D3A' }}>
                {stats.onlineDevices.toLocaleString()}
              </Title>
            </div>
            <div style={{ background: '#F6FFED', padding: 8, borderRadius: 8 }}>
              <CheckCircleOutlined style={{ fontSize: 20, color: '#52C41A' }} />
            </div>
          </div>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            <ThunderboltOutlined style={{ marginRight: 4 }} /> {onlineRate}% tỷ lệ trực tuyến
          </Text>
        </Card>
      </Col>

      {/* Pending Requests Card */}
      <Col xs={24} sm={12} xl={6}>
        <Card variant="borderless" 
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderLeft: '4px solid #F5222D', height: '100%' }} 
          styles={{ body: { padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' } }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>Yêu cầu chờ duyệt</Text>
              <Title level={2} style={{ margin: '8px 0 16px 0', fontWeight: 700, color: '#122D3A' }}>
                {stats.pendingRequests.toLocaleString()}
              </Title>
            </div>
            <div style={{ background: '#FFF1F0', padding: 8, borderRadius: 8 }}>
              <FormOutlined style={{ fontSize: 20, color: '#F5222D' }} />
            </div>
          </div>
          <Text style={{ fontSize: 13, color: '#F5222D', fontWeight: 500 }}>
            <ExclamationCircleOutlined style={{ marginRight: 4 }} /> Cần xử lý ngay
          </Text>
        </Card>
      </Col>
    </Row>
  )
}