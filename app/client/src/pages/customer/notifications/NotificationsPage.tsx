import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  List,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import '../CustomerPages.css'
import './NotificationsPage.css'

const { Text, Title } = Typography

type NotificationTone = 'success' | 'warning' | 'info'

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  area: string
  unread?: boolean
  tone: NotificationTone
}

const notificationIconByTone = {
  success: <CheckCircleOutlined />,
  warning: <WarningOutlined />,
  info: <BellOutlined />,
}

const notifications: NotificationItem[] = [
  {
    id: 'request-approved',
    title: 'Yêu cầu ID#212 đã được chấp thuận',
    description: 'Yêu cầu cấp quyền điều khiển thiết bị phòng khách đã được duyệt.',
    time: '1 phút trước',
    area: 'Yêu cầu',
    unread: true,
    tone: 'success',
  },
  {
    id: 'gas-alert',
    title: 'Cảnh báo khí gas vượt ngưỡng',
    description: 'Cảm biến bếp ghi nhận nồng độ gas cao hơn mức an toàn đã đặt.',
    time: '4 phút trước',
    area: 'Cảnh báo',
    unread: true,
    tone: 'warning',
  },
  {
    id: 'report-exported',
    title: 'Yêu cầu xuất báo cáo thành công',
    description: 'Báo cáo thống kê thiết bị trong tháng đã sẵn sàng để xem.',
    time: '57 phút trước',
    area: 'Báo cáo',
    tone: 'success',
  },
  {
    id: 'device-offline',
    title: 'Thiết bị phòng ngủ mất kết nối',
    description: 'Nhiệt ẩm kế phòng ngủ chưa gửi dữ liệu trong 2 giờ gần đây.',
    time: '10 giờ trước',
    area: 'Thiết bị',
    tone: 'info',
  },
  {
    id: 'system-check',
    title: 'Hoàn tất kiểm tra hệ thống',
    description: 'Bộ điều khiển trung tâm đã kiểm tra trạng thái các phòng.',
    time: '15 giờ trước',
    area: 'Hệ thống',
    tone: 'info',
  },
]

const unreadCount = notifications.filter((item) => item.unread).length
const warningCount = notifications.filter((item) => item.tone === 'warning').length

export function NotificationsPage() {
  return (
    <section className="customer-page" aria-labelledby="notifications-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="notifications-title" level={1} className="customer-title">
            Thông báo
          </Title>
        </div>

        <Button size="large" type="primary">
          Đánh dấu đã đọc
        </Button>
      </div>

      <Row className="notifications-summary" gutter={[14, 14]}>
        <Col lg={8} sm={12} xs={24}>
          <Card className="notification-stat-card" size="small">
            <Text>Tổng thông báo</Text>
            <Title level={2}>{notifications.length}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={12} xs={24}>
          <Card className="notification-stat-card" size="small">
            <Text>Chưa đọc</Text>
            <Title level={2}>{unreadCount}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={24} xs={24}>
          <Card className="notification-stat-card" size="small">
            <Text>Cảnh báo cần chú ý</Text>
            <Title level={2}>{warningCount}</Title>
          </Card>
        </Col>
      </Row>

      <Alert
        className="notifications-alert"
        description="Có cảnh báo khí gas mới từ phòng bếp. Vui lòng kiểm tra thiết bị khi có thể."
        icon={<SafetyCertificateOutlined />}
        message="Ưu tiên kiểm tra an toàn"
        showIcon
        type="warning"
      />

      <Card className="notifications-card">
        <List
          dataSource={notifications}
          itemLayout="horizontal"
          renderItem={(notification) => (
            <List.Item className={notification.unread ? 'is-unread' : undefined}>
              <List.Item.Meta
                avatar={
                  <Badge dot={notification.unread} offset={[-4, 4]}>
                    <Avatar
                      className={`notification-avatar ${notification.tone}`}
                      icon={notificationIconByTone[notification.tone]}
                      size={58}
                    />
                  </Badge>
                }
                description={
                  <Space className="notification-meta" direction="vertical" size={8}>
                    <Text>{notification.description}</Text>
                    <Space className="notification-extra" size={8} wrap>
                      <Tag>{notification.area}</Tag>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {notification.time}
                      </Text>
                    </Space>
                  </Space>
                }
                title={
                  <Space className="notification-title" size={10} wrap>
                    <Text strong>{notification.title}</Text>
                    {notification.unread && <Tag color="blue">Mới</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </section>
  )
}
