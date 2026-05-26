import {
  Button,
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PlusOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import '../CustomerPages.css'
import './RequestsPage.css'

const { Text, Title } = Typography

type RequestStatus = 'pending' | 'approved' | 'rejected'

type RequestGroup = {
  status: RequestStatus
  title: string
  count: number
  latest: {
    id: string
    room: string
    action: string
    quantity: number
    time: string
  }
}

const requestGroups: RequestGroup[] = [
  {
    status: 'pending',
    title: 'Yêu cầu đang chờ duyệt',
    count: 3,
    latest: {
      id: 'ID#213',
      room: 'Phòng khách',
      action: 'Thêm đèn trần',
      quantity: 1,
      time: 'Hôm nay',
    },
  },
  {
    status: 'approved',
    title: 'Yêu cầu được chấp thuận',
    count: 15,
    latest: {
      id: 'ID#210',
      room: 'Phòng ngủ',
      action: 'Xóa quạt trần',
      quantity: 1,
      time: 'Hôm qua',
    },
  },
  {
    status: 'rejected',
    title: 'Yêu cầu bị từ chối',
    count: 1,
    latest: {
      id: 'ID#136',
      room: 'Phòng khách',
      action: 'Xóa quạt trần',
      quantity: 3,
      time: '3 ngày trước',
    },
  },
]

const statusMeta = {
  pending: {
    icon: <ClockCircleOutlined />,
    label: 'Chờ duyệt',
    note: 'Đang chờ quản trị viên kiểm tra',
  },
  approved: {
    icon: <CheckCircleOutlined />,
    label: 'Đã duyệt',
    note: 'Yêu cầu đã được xử lý thành công',
  },
  rejected: {
    icon: <CloseCircleOutlined />,
    label: 'Từ chối',
    note: 'Cần xem lại nội dung yêu cầu',
  },
}

const totalRequests = requestGroups.reduce((total, group) => total + group.count, 0)
const approvedRequests =
  requestGroups.find((group) => group.status === 'approved')?.count ?? 0
const pendingRequests =
  requestGroups.find((group) => group.status === 'pending')?.count ?? 0

export function RequestsPage() {
  return (
    <section className="customer-page" aria-labelledby="requests-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="requests-title" level={1} className="customer-title">
            Yêu cầu của tôi
          </Title>
        </div>

        <Button icon={<PlusOutlined />} size="large" type="primary">
          Thêm yêu cầu
        </Button>
      </div>

      <Row className="requests-summary" gutter={[14, 14]}>
        <Col lg={8} sm={12} xs={24}>
          <Card className="request-summary-card" size="small">
            <Text>Tổng yêu cầu</Text>
            <Title level={2}>{totalRequests}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={12} xs={24}>
          <Card className="request-summary-card" size="small">
            <Text>Đã chấp thuận</Text>
            <Title level={2}>{approvedRequests}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={24} xs={24}>
          <Card className="request-summary-card" size="small">
            <Text>Đang chờ duyệt</Text>
            <Title level={2}>{pendingRequests}</Title>
          </Card>
        </Col>
      </Row>

      <div className="request-status-list">
        {requestGroups.map((group) => {
          const meta = statusMeta[group.status]

          return (
            <Card
              className={`request-status-card ${group.status}`}
              extra={<Tag>{meta.label}</Tag>}
              key={group.status}
              title={
                <Space className="request-status-title" size={12}>
                  <span className="request-status-icon">{meta.icon}</span>
                  <span>{group.title}</span>
                </Space>
              }
            >
              <Row gutter={[22, 18]}>
                <Col md={7} xs={24}>
                  <div className="request-count-box">
                    <Text>Số lượng yêu cầu</Text>
                    <Title level={3}>{group.count}</Title>
                    <Text type="secondary">{meta.note}</Text>
                  </div>
                </Col>

                <Col md={17} xs={24}>
                  <div className="request-latest-card">
                    <Text className="request-latest-label">
                      Yêu cầu gần nhất
                    </Text>

                    <div className="request-detail-grid">
                      <span>
                        <FileTextOutlined /> {group.latest.id}
                      </span>
                      <span>
                        <EnvironmentOutlined /> {group.latest.room}
                      </span>
                      <span>
                        <ToolOutlined /> {group.latest.action}
                      </span>
                      <span>
                        SL: {group.latest.quantity}
                      </span>
                    </div>

                    <div className="request-latest-footer">
                      <Text type="secondary">{group.latest.time}</Text>
                      <Button size="small">Xem chi tiết</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
