import { useState } from 'react'
import {
  Card,
  Col,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  List,
  Badge,
  message,
} from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  BellOutlined,
  FireOutlined,
  BulbOutlined,
  RightOutlined,
} from '@ant-design/icons'
import '../CustomerPages.css'
import './OverviewPage.css'

const { Text, Title } = Typography

type BulbState = {
  id: string
  name: string
  room: string
  on: boolean
}

type ClimateFeed = {
  room: string
  temp: number
  humid: number
  gas?: string
  status: 'safe' | 'warning'
}

type NotificationFeed = {
  id: string
  title: string
  time: string
  tone: 'info' | 'warning' | 'success'
}

export function OverviewPage() {
  const [bulbs, setBulbs] = useState<BulbState[]>([
    { id: 'b1', name: 'Đèn trần', room: 'Phòng khách', on: true },
    { id: 'b2', name: 'Đèn ngủ', room: 'Phòng ngủ', on: false },
    { id: 'b3', name: 'Đèn bếp', room: 'Phòng bếp', on: true },
  ])

  const [climates] = useState<ClimateFeed[]>([
    { room: 'Phòng khách', temp: 28.4, humid: 62, status: 'safe' },
    { room: 'Phòng ngủ', temp: 26.8, humid: 58, status: 'safe' },
    { room: 'Phòng bếp', temp: 29.5, humid: 60, gas: 'Bình thường', status: 'safe' },
  ])

  const [notifications] = useState<NotificationFeed[]>([
    { id: '1', title: 'Hệ thống đo gas hoạt động ổn định', time: '10 phút trước', tone: 'success' },
    { id: '2', title: 'Nhiệt độ phòng khách vượt quá 28°C', time: '1 giờ trước', tone: 'info' },
  ])

  const handleBulbToggle = (id: string, checked: boolean) => {
    setBulbs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, on: checked } : b))
    )
    message.success(
      `Đã ${checked ? 'bật' : 'tắt'} ${
        bulbs.find((b) => b.id === id)?.name
      } thành công!`
    )
  }

  const onlineDevicesCount = 6
  const totalDevicesCount = 6

  return (
    <section className="customer-page" aria-labelledby="overview-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="overview-title" level={1} className="customer-title">
            Tổng quan hệ thống
          </Title>
        </div>
      </div>

      <Row className="overview-summary" gutter={[14, 14]}>
        <Col lg={6} sm={12} xs={24}>
          <Card className="overview-stat-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Thiết bị trực tuyến</Text>
                <Title level={2}>
                  {onlineDevicesCount}/{totalDevicesCount}
                </Title>
              </div>
              <div className="overview-stat-icon devices">
                <DesktopOutlined />
              </div>
            </div>
            <div className="card-footer">
              <Badge status="success" /> <Text type="secondary">Hoạt động bình thường</Text>
            </div>
          </Card>
        </Col>

        <Col lg={6} sm={12} xs={24}>
          <Card className="overview-stat-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Nhiệt độ phòng bếp</Text>
                <Title level={2}>29.5 °C</Title>
              </div>
              <div className="overview-stat-icon temp">
                <DashboardOutlined />
              </div>
            </div>
            <div className="card-footer">
              <Tag color="orange">Trung bình cao</Tag>
            </div>
          </Card>
        </Col>

        <Col lg={6} sm={12} xs={24}>
          <Card className="overview-stat-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Điện năng hôm nay</Text>
                <Title level={2}>8.5 kWh</Title>
              </div>
              <div className="overview-stat-icon energy">
                <ThunderboltOutlined />
              </div>
            </div>
            <div className="card-footer">
              <Tag color="green">-5.1% so với hôm qua</Tag>
            </div>
          </Card>
        </Col>

        <Col lg={6} sm={12} xs={24}>
          <Card className="overview-stat-card" size="small">
            <div className="card-inner">
              <div>
                <Text>Cảnh báo khí gas</Text>
                <Title level={2}>An toàn</Title>
              </div>
              <div className="overview-stat-icon gas">
                <FireOutlined />
              </div>
            </div>
            <div className="card-footer">
              <Badge status="processing" color="green" /> <Text type="secondary">Đang quét liên tục</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} className="overview-grid">
        {/* Quick controls (Bulbs) */}
        <Col lg={12} xs={24}>
          <Card
            title={
              <Space>
                <span className="overview-card-header-icon bulb"><BulbOutlined /></span>
                <span>Điều khiển nhanh bóng đèn</span>
              </Space>
            }
            className="overview-card"
          >
            <div className="quick-controls-list">
              {bulbs.map((b) => (
                <div key={b.id} className="control-item">
                  <div className="control-info">
                    <Text strong>{b.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {b.room}
                    </Text>
                  </div>
                  <Switch
                    checked={b.on}
                    onChange={(checked) => handleBulbToggle(b.id, checked)}
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Real-time climate monitor */}
        <Col lg={12} xs={24}>
          <Card
            title={
              <Space>
                <span className="overview-card-header-icon climate"><DashboardOutlined /></span>
                <span>Thông số khí hậu & Gas</span>
              </Space>
            }
            className="overview-card"
          >
            <div className="overview-climates-list">
              {climates.map((c) => (
                <div key={c.room} className="climate-item">
                  <div className="climate-room-info">
                    <Text strong>{c.room}</Text>
                  </div>
                  <div className="climate-readings">
                    <span className="reading-tag temp">{c.temp}°C</span>
                    <span className="reading-tag humid">{c.humid}% RH</span>
                    {c.gas && (
                      <span className="reading-tag gas-ok">
                        <FireOutlined /> {c.gas}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: '20px' }} className="overview-grid-secondary">
        {/* Schedule timeline */}
        <Col lg={12} xs={24}>
          <Card
            title={
              <Space>
                <span className="overview-card-header-icon schedules"><ClockCircleOutlined /></span>
                <span>Lịch trình tiếp theo hôm nay</span>
              </Space>
            }
            className="overview-card"
          >
            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-time">18:00</div>
                <div className="timeline-dot blue"></div>
                <div className="timeline-content">
                  <Text strong>Bóng đèn thông minh (Phòng khách)</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Hành động: Bật thiết bị</Text>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-time">23:00</div>
                <div className="timeline-dot gray"></div>
                <div className="timeline-content">
                  <Text strong>Bóng đèn thông minh (Phòng ngủ)</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Hành động: Tắt thiết bị</Text>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-time">Hàng giờ</div>
                <div className="timeline-dot orange"></div>
                <div className="timeline-content">
                  <Text strong>Máy đo khí gas (Phòng bếp)</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Hành động: Kiểm tra an toàn</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Notifications and messages */}
        <Col lg={12} xs={24}>
          <Card
            title={
              <Space>
                <span className="overview-card-header-icon notifications"><BellOutlined /></span>
                <span>Thông báo & Yêu cầu</span>
              </Space>
            }
            className="overview-card"
          >
            <List
              dataSource={notifications}
              renderItem={(n) => (
                <List.Item className="overview-notification-item">
                  <List.Item.Meta
                    avatar={
                      <div className={`notification-dot-avatar ${n.tone}`}>
                        <BellOutlined />
                      </div>
                    }
                    title={<Text strong>{n.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: 11 }}>{n.time}</Text>}
                  />
                  <RightOutlined style={{ color: '#bfbfbf' }} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </section>
  )
}
