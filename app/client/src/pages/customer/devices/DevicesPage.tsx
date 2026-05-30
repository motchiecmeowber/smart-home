import { Col, message, Row, Typography, Spin, Button, Divider, Space } from 'antd'
import { PlusOutlined, HomeOutlined, RestOutlined, CoffeeOutlined,
  InboxOutlined, AppstoreOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { apiGetMyDevices, type DeviceInfo } from '../../../lib/deviceApi'
import { DeviceFilters } from './components/DeviceFilters'
import { DeviceDetailModal } from './components/DeviceDetailModal'
import { DeviceCard } from './components/DeviceCard'
import { AddLocationModal } from './components/AddLocationModal'
import { LocationDetailModal } from './components/LocationDetailModal'
import { apiGetLocations, apiCreateLocation, apiDeleteLocation, apiUpdateLocation, type LocationDTO } from '../../../lib/locationApi'
import '../CustomerPages.css'
import './DevicesPage.css'

const { Text, Title } = Typography

export function DevicesPage() {
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [locations, setLocations] = useState<LocationDTO[]>([])
  const [loading, setLoading] = useState(true)

  // state for filters
  const [searchText, setSearchText] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')

  // state for detail
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [locationModalVisible, setLocationModalVisible] = useState<boolean>(false)

  // state for location detail
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [locationDetailVisible, setLocationDetailVisible] = useState<boolean>(false)

  const fetchDevices = async () => {
    setLoading(true)

    try {
      const [devicesData, locationsData] = await Promise.all([
        apiGetMyDevices(),
        apiGetLocations()
      ])

      setDevices(devicesData)
      setLocations(locationsData)

      setSelectedDevice(prev => {
        if (!prev) return null;
        const updated = devicesData.find(d => d.deviceId === prev.deviceId);
        return updated || prev;
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [])

  const filterDevices = devices.filter((device) => {
    const matchSearch = (device.deviceName ?? '').toLowerCase().includes(searchText.toLowerCase())
    const matchType = selectedType ? device.deviceType === selectedType : true
    return matchSearch && matchType
  })

  // Grouped device by room and sorted
  const sortedRooms = useMemo(() => {
    const map = new Map<string, DeviceInfo[]>()
    
    // 1. Group active devices by location
    filterDevices.forEach((device) => {
      const roomName = device.location || 'Chưa có vị trí'

      if (!map.has(roomName)) {
        map.set(roomName, [])
      }

      map.get(roomName)!.push(device)
    })

    // 2. Add empty locations
    locations.forEach(loc => {
      if (!map.has(loc.locationName)) {
        map.set(loc.locationName, [])
      }
    })

    // 3. Sort: Active Rooms (1) -> Chưa có vị trí (2) -> Empty Rooms (3)
    const result = Array.from(map.entries())
    result.sort((a, b) => {
      const nameA = a[0]
      const nameB = b[0]
      const countA = a[1].length
      const countB = b[1].length

      const isUnassignedA = nameA === 'Chưa có vị trí'
      const isUnassignedB = nameB === 'Chưa có vị trí'
      const isEmptyA = countA === 0
      const isEmptyB = countB === 0

      const scoreA = isEmptyA ? 3 : (isUnassignedA ? 2 : 1)
      const scoreB = isEmptyB ? 3 : (isUnassignedB ? 2 : 1)

      if (scoreA !== scoreB) {
        return scoreA - scoreB
      }
      return nameA.localeCompare(nameB)
    })

    return result
  }, [filterDevices, locations])

  const totalDevices = devices.length

  const getRoomIcon = (roomName: string) => {
    const name = roomName.toLowerCase()
    if (name.includes('khách') || name.includes('living')) return <HomeOutlined style={{ fontSize: '24px', color: '#0b5f95' }} />
    if (name.includes('ngủ') || name.includes('bed') || name.includes('sleep')) return <RestOutlined style={{ fontSize: '24px', color: '#0b5f95' }} />
    if (name.includes('bếp') || name.includes('ăn') || name.includes('kitchen') || name.includes('eat')) return <CoffeeOutlined style={{ fontSize: '24px', color: '#0b5f95' }} />
    if (name === 'chưa có vị trí') return <InboxOutlined style={{ fontSize: '24px', color: '#0b5f95' }} />
    return <AppstoreOutlined style={{ fontSize: '24px', color: '#0b5f95' }} />
  }

  const handleOpenDetail = (device: DeviceInfo) => {
    setSelectedDevice(device)
    setModalVisible(true)
  }

  const handleAddLocation = async (values: { locationName: string }) => {
    try {
      const newLocation = await apiCreateLocation(values.locationName)

      setLocations(prev => [...prev, newLocation])
      setLocationModalVisible(false)
      
      message.success('Thêm khu vực mới thành công!')
    } catch (error: any) {
      message.error(error.message || 'Lỗi thêm khu vực')
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await apiDeleteLocation(locationId)
      message.success(`Đã xóa khu vực thành công`)

      setLocationDetailVisible(false)
      setSelectedLocationId(null)
      fetchDevices() // Refresh devices to update "orphaned" devices
    } catch (error: any) {
      message.error(error.message || 'Lỗi xóa khu vực')
    }
  }

  const handleOpenLocationDetail = (roomName: string) => {
    const loc = locations.find(l => l.locationName === roomName)
    if (loc) {
      setSelectedLocationId(loc.locationId)
      setLocationDetailVisible(true)
    }
  }

  const handleUpdateLocation = async (locationId: string, newName: string) => {
    try {
      // Find the old name to update devices
      const oldLocation = locations.find(l => l.locationId === locationId)
      const oldName = oldLocation?.locationName || ''

      await apiUpdateLocation(locationId, newName)
      message.success('Đã cập nhật tên khu vực thành công')
      
      // Update local state without fetching again to avoid layout shift
      setLocations(prev => prev.map(loc => 
        loc.locationId === locationId ? { ...loc, locationName: newName } : loc
      ))

      // Update devices state immediately to prevent grouping UI glitch
      setDevices(prev => prev.map(dev => 
        dev.location === oldName ? { ...dev, location: newName } : dev
      ))
      
      fetchDevices() // Background refresh just in case
    } catch (error: any) {
      message.error(error.message || 'Lỗi cập nhật tên khu vực')
    }
  }

  return (
    <section className="customer-page" aria-labelledby="devices-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="devices-title" level={1} className="customer-title">
            Quản lý thiết bị
          </Title>
        </div>

        <Button
          icon={<PlusOutlined />}
          size="large"
          type="primary"
          onClick={() => setLocationModalVisible(true)}
        >
          Thêm khu vực
        </Button>
      </div>

      {/* Wrapper ghim bộ lọc lên trên cùng */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: '#f4f7f8',
        paddingTop: '16px',
        margin: '0 -2px'
      }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: '16px', fontSize: '14px', fontWeight: 400, color: '#8c8c8c' }}>
          Tổng cộng {totalDevices} thiết bị đang kết nối trong hệ thống của bạn.
        </Text>
        <DeviceFilters
          searchText={searchText}
          selectedType={selectedType}
          onSearchChange={setSearchText}
          onTypeChange={setSelectedType}
        />
      </div>

      <Spin spinning={loading}>
        <div className='rooms-list'>
          {sortedRooms.map(([roomName, roomDevices]) => {
            const roomTotal = roomDevices.length

            return (
              <div key={roomName} className="room-section" style={{ opacity: roomTotal === 0 ? 0.6 : 1 }}>
                <div className="room-header">
                  <Space align="center" size={8}>
                    {getRoomIcon(roomName)}
                    <Title level={3} style={{ margin: 0, fontWeight: 600 }}>{roomName}</Title>
                    <Text type='secondary' style={{ fontSize: '13px', marginLeft: '8px' }}>
                      {roomTotal === 0 ? 'Không có thiết bị' : `${roomTotal} Thiết bị`}
                    </Text>
                  </Space>
                  
                  {roomName !== 'Chưa có vị trí' && (
                    <Button 
                      type="text" 
                      icon={<InfoCircleOutlined />} 
                      onClick={() => handleOpenLocationDetail(roomName)}
                    />
                  )}
                </div>
                <Divider style={{ margin: '12px 0 24px 0' }} />
                
                {roomTotal > 0 ? (
                  <Row className='room-devices' gutter={[14, 14]}>
                    {roomDevices.map((device) => (
                      <Col key={device.deviceId} lg={8} md={12} xs={24}>
                        <DeviceCard device={device} onClick={() => handleOpenDetail(device)} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#bfbfbf', background: '#fafafa', borderRadius: '8px' }}>
                    Khu vực này hiện chưa có thiết bị nào.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Spin>

      <DeviceDetailModal
        visible={modalVisible}
        device={selectedDevice}
        locations={locations}
        onClose={() => setModalVisible(false)}
        onUpdateSuccess={() => {
          fetchDevices() // refresh list
        }}
      />

      <AddLocationModal
        open={locationModalVisible}
        onCancel={() => setLocationModalVisible(false)}
        onAdd={handleAddLocation}
      />

      <LocationDetailModal
        open={locationDetailVisible}
        location={locations.find(l => l.locationId === selectedLocationId) || null}
        onClose={() => setLocationDetailVisible(false)}
        onDelete={handleDeleteLocation}
        onUpdate={handleUpdateLocation}
      />
    </section>
  )
}