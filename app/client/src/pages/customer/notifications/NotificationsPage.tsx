import { Alert, Avatar, Badge, Button, Card, Col,
  List, message, Row, Space, Spin, Tag, Typography,
} from 'antd'
import { apiGetNotis, apiReadNoti, type NotiDTO } from '../../../lib/notiApi'
import { useEffect, useState } from 'react'
import { BellOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import '../CustomerPages.css'
import './NotificationsPage.css'

const { Text, Title } = Typography

type NotificationTone = 'success' | 'warning' | 'info'

const notificationIconByTone = {
  success: <CheckCircleOutlined />,
  warning: <WarningOutlined />,
  info: <BellOutlined />,
}

const getToneFromTitle = (title: string): NotificationTone => {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes('cảnh báo') || lowerTitle.includes('nguy hiểm') || lowerTitle.includes('vượt ngưỡng')) {
    return 'warning'
  }

  if (lowerTitle.includes('thành công') || lowerTitle.includes('chấp nhận') || lowerTitle.includes('chấp thuận')) {
    return 'success'
  }

  return 'info'
}

export function NotificationsPage() {
  const [notis, setNotis] = useState<NotiDTO[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotis = async () => {
    try {
      setLoading(true)
      
      const data = await apiGetNotis()
      setNotis(data)
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải danh sách thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotis()
  }, [])

  const handleRead = async (notiId: string) => {
    try {
      await apiReadNoti(notiId)
      message.success('Đã đánh dấu đọc')

      setNotis((prev) => prev.map((n) => (n.notiId === notiId ? {...n, isRead: true} : n)))
    } catch (error: any) {
      message.error(error.message || 'Không thể đánh dấu đã đọc')
    }
  }

  const unreadCount = notis.filter((item) => !item.isRead).length
  const warningCount = notis.filter((item) => getToneFromTitle(item.title) === 'warning').length
  const latestWarning = notis.find((item) => getToneFromTitle(item.title) === 'warning')

  if (loading) {
    return (
      <section className='customer-page' aria-labelledby='notifications-title'>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          <Spin size='large' />
        </div>
      </section>
    )
  }

  return (
    <section className="customer-page" aria-labelledby="notifications-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="notifications-title" level={1} className="customer-title">
            Thông báo
          </Title>
        </div>
      </div>

      <Row className="notifications-summary" gutter={[14, 14]}>
        <Col lg={8} sm={12} xs={24}>
          <Card className="notification-stat-card" size="small">
            <Text>Tổng thông báo</Text>
            <Title level={2}>{notis.length}</Title>
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

      {warningCount > 0 && latestWarning && (
        <Alert
          className="notifications-alert"
          title="Ưu tiên kiểm tra an toàn"
          description={
            <span>
              Có cảnh báo hệ thống cần bạn kiểm tra: <strong>{latestWarning.title}</strong> - {latestWarning.content}
            </span>
          }
          showIcon
          type="warning"
        />
      )}

      <Card className="notifications-card">
        <List
          dataSource={notis}
          itemLayout="horizontal"
          renderItem={(notification) => {
            const tone = getToneFromTitle(notification.title)
            const isUnread = !notification.isRead

            return (
              <List.Item
                className={isUnread ? 'is-unread' : undefined}
                actions={isUnread ?
                  [
                    <Button type='link' size='small' onClick={()=> handleRead(notification.notiId)}>
                      Đánh dấu đã đọc
                    </Button>
                  ] : undefined
              }>
                <List.Item.Meta
                  avatar={
                    <Badge dot={isUnread} offset={[-4, 4]}>
                      <Avatar
                        className={`notification-avatar ${tone}`}
                        icon={notificationIconByTone[tone]}
                        size={58}
                      />
                    </Badge>
                  }
                  description={
                    <Space className="notification-meta" orientation="vertical" size={8}>
                      <Text>{notification.content}</Text>
                      <Space className="notification-extra" size={8} wrap>
                        <Tag>Hệ thống</Tag>
                        <Text type="secondary">
                          <ClockCircleOutlined /> {new Date(notification.createdAt).toLocaleString('vi-VN')}
                        </Text>
                      </Space>
                    </Space>
                  }
                  title={
                    <Space className="notification-title" size={10} wrap>
                      <Text strong>{notification.title}</Text>
                      {isUnread && <Tag color="blue">Mới</Tag>}
                    </Space>
                  }
                />
              </List.Item>
            )            
          }}
        />
      </Card>
    </section>
  )
}
