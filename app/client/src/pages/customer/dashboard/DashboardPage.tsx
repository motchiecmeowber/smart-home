import { Col, Row, Space, Typography } from 'antd'
import { useAuth } from '../../../hooks/useAuth'
import '../CustomerPages.css'
import './DashboardPage.css'

import { Env } from './components/Env'
import { Devices } from './components/Devices'
import { Notification } from './components/Noti'
import { Schedule } from './components/Schedules'
import { Request } from './components/Requests'
import { CalendarOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export function DashboardPage() {
  const { user } = useAuth()
  const currentDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

  return (
    <section className="customer-page dashboard-page" aria-labelledby="dashboard-title">
      {/* Header */}
      <div className="customer-heading" style={{ marginBottom: 16 }}>
        <div className="customer-heading-left">
          <Text className="customer-subtitle" style={{ fontStyle: "italic", fontSize: 16 }}>
            Xin chào, <span style={{ fontWeight: 700 }}>{user?.username || 'Khách hàng'}</span>
          </Text>
          <Title id="dashboard-title" level={1} className="customer-title">
            Bảng điều khiển
          </Title>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Space>
            <CalendarOutlined style={{ color: '#595959', fontSize: 16 }} />
            <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                {currentDate}
            </Text>
          </Space>
        </div>
      </div>

      {/* Top Row: Environment Overview */}
      <Env />

      {/* Middle Row: Devices, Notifications, Schedules */}
      <div style={{ marginBottom: 24 }}>
        <div className="dashboard-section-title">Trạng Thái Hệ Thống</div>
        <Row gutter={[16, 16]} style={{ display: 'flex', alignItems: 'stretch' }}>
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
            <Devices />
          </Col>
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
            <Notification />
          </Col>
          <Col xs={24} lg={8} style={{ display: 'flex', flexDirection: 'column' }}>
            <Schedule />
          </Col>
        </Row>
      </div>

      {/* Bottom Row: Support Requests */}
      <Request />
    </section>
  )
}