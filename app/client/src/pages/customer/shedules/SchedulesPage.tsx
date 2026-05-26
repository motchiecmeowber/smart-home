import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  ClockCircleOutlined,
  DeleteOutlined,
  PlusOutlined,
  PoweroffOutlined,
  DashboardOutlined,
  FireOutlined,
} from '@ant-design/icons'
import '../CustomerPages.css'
import './SchedulesPage.css'

const { Text, Title } = Typography

type DeviceCategory = 'BULB' | 'SENSOR' | 'GAS'

type ScheduleItem = {
  id: string
  deviceType: DeviceCategory
  deviceName: string
  action: string
  time: string
  repeat: string
  enabled: boolean
}

const initialSchedules: ScheduleItem[] = [
  {
    id: 'sch-1',
    deviceType: 'BULB',
    deviceName: 'Bóng đèn thông minh (Phòng khách)',
    action: 'Bật thiết bị',
    time: '18:00',
    repeat: 'Hàng ngày',
    enabled: true,
  },
  {
    id: 'sch-2',
    deviceType: 'SENSOR',
    deviceName: 'Nhiệt ẩm kế (Phòng ngủ)',
    action: 'Ghi nhận nhiệt ẩm',
    time: '08:00',
    repeat: 'Thứ 2 - Thứ 6',
    enabled: true,
  },
  {
    id: 'sch-3',
    deviceType: 'GAS',
    deviceName: 'Máy đo khí gas (Phòng bếp)',
    action: 'Quét an toàn khí gas',
    time: 'Mỗi 30 phút',
    repeat: 'Hàng ngày',
    enabled: true,
  },
  {
    id: 'sch-4',
    deviceType: 'BULB',
    deviceName: 'Bóng đèn thông minh (Phòng ngủ)',
    action: 'Tắt thiết bị',
    time: '23:00',
    repeat: 'Hàng ngày',
    enabled: false,
  },
]

export function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const activeCount = schedules.filter((s) => s.enabled).length

  const handleToggle = (id: string, checked: boolean) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: checked } : s))
    )
    message.success(
      `Đã ${checked ? 'bật' : 'tắt'} lịch trình thành công!`
    )
  }

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    message.success('Đã xóa lịch trình thành công!')
  }

  const handleAddSchedule = (values: any) => {
    const newSchedule: ScheduleItem = {
      id: `sch-${Date.now()}`,
      deviceType: values.deviceType,
      deviceName: `${values.deviceName} (${values.room})`,
      action: values.action,
      time: values.time,
      repeat: values.repeat,
      enabled: true,
    }

    setSchedules((prev) => [...prev, newSchedule])
    setModalVisible(false)
    form.resetFields()
    message.success('Thêm lịch trình mới thành công!')
  }

  const columns = [
    {
      title: 'Thiết bị & Phòng',
      key: 'device',
      render: (_: any, record: ScheduleItem) => {
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
              <Text strong>{record.deviceName}</Text>
              <br />
              <Tag color={color} style={{ marginTop: 4 }}>
                {record.deviceType === 'BULB'
                  ? 'Bóng đèn'
                  : record.deviceType === 'SENSOR'
                  ? 'Nhiệt ẩm kế'
                  : 'Máy đo khí gas'}
              </Tag>
            </div>
          </Space>
        )
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_: any, record: ScheduleItem) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text strong>{record.time}</Text>
        </Space>
      ),
    },
    {
      title: 'Tần suất lặp',
      dataIndex: 'repeat',
      key: 'repeat',
      render: (repeat: string) => <Text>{repeat}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'enabled',
      render: (_: any, record: ScheduleItem) => (
        <Switch
          checked={record.enabled}
          onChange={(checked) => handleToggle(record.id, checked)}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: ScheduleItem) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ]

  return (
    <section className="customer-page" aria-labelledby="schedules-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="schedules-title" level={1} className="customer-title">
            Lịch trình thiết bị
          </Title>
        </div>

        <Button
          icon={<PlusOutlined />}
          size="large"
          type="primary"
          onClick={() => setModalVisible(true)}
        >
          Thêm lịch trình
        </Button>
      </div>

      <Row className="schedules-summary" gutter={[14, 14]}>
        <Col lg={8} sm={12} xs={24}>
          <Card className="schedule-summary-card" size="small">
            <Text>Tổng lịch trình</Text>
            <Title level={2}>{schedules.length}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={12} xs={24}>
          <Card className="schedule-summary-card" size="small">
            <Text>Đang hoạt động</Text>
            <Title level={2}>{activeCount}</Title>
          </Card>
        </Col>
        <Col lg={8} sm={24} xs={24}>
          <Card className="schedule-summary-card" size="small">
            <Text>Lượt kích hoạt tiếp theo</Text>
            <Title level={2} style={{ fontSize: '18px', marginTop: '10px' }}>
              08:00 - Quét nhiệt ẩm
            </Title>
          </Card>
        </Col>
      </Row>

      <Card className="schedules-list-card">
        <Table
          columns={columns}
          dataSource={schedules}
          rowKey="id"
          pagination={false}
          className="schedules-table"
        />
      </Card>

      <Modal
        title="Thêm lịch trình mới"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="Lưu lịch trình"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddSchedule}
          initialValues={{
            deviceType: 'BULB',
            action: 'Bật thiết bị',
            repeat: 'Hàng ngày',
          }}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="deviceType"
            label="Loại thiết bị"
            rules={[{ required: true }]}
          >
            <Select
              onChange={(val) => {
                if (val === 'BULB') {
                  form.setFieldsValue({ action: 'Bật thiết bị' })
                } else if (val === 'SENSOR') {
                  form.setFieldsValue({ action: 'Ghi nhận nhiệt ẩm' })
                } else {
                  form.setFieldsValue({ action: 'Quét an toàn khí gas' })
                }
              }}
            >
              <Select.Option value="BULB">Bóng đèn thông minh</Select.Option>
              <Select.Option value="SENSOR">Nhiệt ẩm kế</Select.Option>
              <Select.Option value="GAS">Máy đo khí gas</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="deviceName"
            label="Tên thiết bị"
            rules={[{ required: true, message: 'Vui lòng nhập tên thiết bị!' }]}
          >
            <Input placeholder="Ví dụ: Bóng đèn trần, Cảm biến đo gas" />
          </Form.Item>

          <Form.Item
            name="room"
            label="Khu vực / Phòng"
            rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
          >
            <Select>
              <Select.Option value="Phòng khách">Phòng khách</Select.Option>
              <Select.Option value="Phòng ngủ">Phòng ngủ</Select.Option>
              <Select.Option value="Phòng bếp">Phòng bếp</Select.Option>
              <Select.Option value="Phòng tắm">Phòng tắm</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="action"
            label="Hành động thiết lập"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Bật thiết bị">Bật thiết bị</Select.Option>
              <Select.Option value="Tắt thiết bị">Tắt thiết bị</Select.Option>
              <Select.Option value="Ghi nhận nhiệt ẩm">Ghi nhận nhiệt ẩm</Select.Option>
              <Select.Option value="Quét an toàn khí gas">Quét an toàn khí gas</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="Thời gian thực thi"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
          >
            <Input placeholder="Ví dụ: 08:00, 22:30, Mỗi 30 phút" />
          </Form.Item>

          <Form.Item
            name="repeat"
            label="Tần suất lập lại"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Hàng ngày">Hàng ngày</Select.Option>
              <Select.Option value="Thứ 2 - Thứ 6">Thứ 2 - Thứ 6</Select.Option>
              <Select.Option value="Cuối tuần">Cuối tuần</Select.Option>
              <Select.Option value="Chỉ một lần">Chỉ một lần</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
