import { Breadcrumb, Card, Col, Row, Statistic, Typography } from 'antd'
import type { RoomDeviceSummary } from '../../types/dashboard'
import './DevicesPage.css'

const { Text, Title } = Typography

const roomDeviceSummaries: RoomDeviceSummary[] = [
  {
    id: 'living-room',
    roomName: 'Phòng khách',
    devices: [
      { id: 'living-light', name: 'Đèn trần', count: 4, shortName: 'Đ' },
      { id: 'living-sensor', name: 'Nhiệt ẩm kế', count: 1, shortName: 'N' },
    ],
  },
  {
    id: 'kitchen',
    roomName: 'Phòng bếp',
    devices: [
      { id: 'kitchen-light', name: 'Đèn trần', count: 2, shortName: 'Đ' },
      { id: 'kitchen-sensor', name: 'Nhiệt ẩm kế', count: 1, shortName: 'N' },
    ],
  },
  {
    id: 'bedroom',
    roomName: 'Phòng ngủ',
    devices: [
      { id: 'bedroom-light', name: 'Đèn trần', count: 2, shortName: 'Đ' },
      { id: 'bedroom-sensor', name: 'Nhiệt ẩm kế', count: 1, shortName: 'N' },
      { id: 'bedroom-gas', name: 'Máy đo khí gas', count: 1, shortName: 'G' },
    ],
  },
]

const totalRooms = roomDeviceSummaries.length
const totalDevices = roomDeviceSummaries.reduce(
  (total, room) =>
    total + room.devices.reduce((roomTotal, device) => roomTotal + device.count, 0),
  0,
)

export function DevicesPage() {
  return (
    <section className="devices-page" aria-labelledby="devices-title">
      <div className="devices-heading">
        <div>
          <Breadcrumb
            className="breadcrumb"
            items={[{ title: 'Dashboard' }, { title: 'Thiết bị' }]}
          />
          <Title id="devices-title" level={1}>
            Quản lý thiết bị
          </Title>
        </div>

        <Row className="devices-summary" gutter={12}>
          <Col>
            <Card className="summary-box" size="small">
              <Statistic title="Phòng" value={totalRooms} />
            </Card>
          </Col>
          <Col>
            <Card className="summary-box" size="small">
              <Statistic title="Thiết bị" value={totalDevices} />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="rooms-list">
        {roomDeviceSummaries.map((room) => {
          const roomTotal = room.devices.reduce(
            (total, device) => total + device.count,
            0,
          )

          return (
            <Card
              className="room-card"
              extra={<span className="room-count">{roomTotal}</span>}
              key={room.id}
              title={
                <div>
                  <Title level={2}>{room.roomName}</Title>
                  <Text type="secondary">
                    {roomTotal} thiết bị đang được quản lý
                  </Text>
                </div>
              }
            >
              <Row className="room-devices" gutter={[14, 14]}>
                {room.devices.map((device) => (
                  <Col key={device.id} lg={8} md={12} xs={24}>
                    <Card className="device-card" size="small">
                      <div className="device-item">
                        <span className="device-icon" aria-hidden="true">
                          {device.shortName}
                        </span>
                        <div>
                          <Title level={3}>{device.name}</Title>
                          <Text type="secondary">Số lượng: {device.count}</Text>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
