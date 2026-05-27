import { Modal, Form, Select, Input, InputNumber, Radio, message, Typography, Space } from "antd"
import { useEffect, useState, useMemo } from "react"
import { apiGetLocations, type LocationDTO } from "../../../../lib/locationApi"
import { apiGetDevices, type DeviceInfo } from "../../../../lib/deviceApi"
import { apiRequestAdd, apiRequestUpdate, apiRequestDelete } from "../../../../lib/requestApi"

const { Text } = Typography
const { TextArea } = Input

type AddRequestModalProps = {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function AddRequestModal({ open, onCancel, onSuccess }: AddRequestModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  
  const [requestType, setRequestType] = useState<'ADD' | 'UPDATE' | 'DELETE'>('ADD')
  const [locations, setLocations] = useState<LocationDTO[]>([])
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [loadingData, setLoadingData] = useState(false)

  const selectedDeviceId = Form.useWatch('deviceId', form)

  useEffect(() => {
    if (open) {
      form.resetFields()
      setRequestType('ADD')
      fetchFormData()
    }
  }, [open, form])

  const fetchFormData = async () => {
    try {
      setLoadingData(true)
      const [locs, devs] = await Promise.all([
        apiGetLocations(),
        apiGetDevices()
      ])
      setLocations(locs)
      setDevices(devs)
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoadingData(false)
    }
  }

  // Lọc thiết bị trống (Chưa có chủ)
  const unassignedDevices = useMemo(() => {
    return devices.filter(d => !d.hasOwner)
  }, [devices])

  // Lọc thiết bị của người dùng
  const myDevices = useMemo(() => {
    return devices.filter(d => d.hasOwner)
  }, [devices])

  // Lấy thông tin thiết bị đang chọn
  const selectedDevice = useMemo(() => {
    if (!selectedDeviceId) return null
    return devices.find(d => d.deviceId === selectedDeviceId)
  }, [selectedDeviceId, devices])

  // Cập nhật lại deviceType khi chọn thiết bị (đối với ADD)
  const handleDeviceChange = (deviceId: string) => {
    const dev = devices.find(d => d.deviceId === deviceId)
    if (dev) {
      form.setFieldsValue({ deviceType: dev.deviceType })
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)
      const dev = devices.find(d => d.deviceId === values.deviceId)
      
      if (requestType === 'ADD') {
        if (!dev) throw new Error('Không tìm thấy thông tin thiết bị')
        await apiRequestAdd({
          deviceId: dev.deviceId,
          deviceName: dev.deviceName,
          deviceType: dev.deviceType,
          locationId: values.locationId,
          unit: values.unit,
          threshold: values.threshold,
          note: values.note
        })
        message.success('Gửi yêu cầu thêm thiết bị thành công')
      } 
      else if (requestType === 'UPDATE') {
        if (!dev) throw new Error('Không tìm thấy thông tin thiết bị')
        await apiRequestUpdate(dev.deviceId, {
          content: values.content,
          note: values.note
        })
        message.success('Gửi yêu cầu cập nhật thiết bị thành công')
      }
      else if (requestType === 'DELETE') {
        if (!dev) throw new Error('Không tìm thấy thông tin thiết bị')
        await apiRequestDelete(dev.deviceId)
        message.success('Gửi yêu cầu gỡ bỏ thiết bị thành công')
      }
      
      onSuccess()
    } catch (error: any) {
      message.error(error.message || 'Lỗi gửi yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Tạo yêu cầu mới"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Gửi yêu cầu"
      cancelText="Hủy"
      width={600}
      centered
    >
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Radio.Group 
          value={requestType} 
          onChange={e => {
            setRequestType(e.target.value)
            form.resetFields()
          }}
          buttonStyle="solid"
        >
          <Radio.Button value="ADD">Thêm thiết bị</Radio.Button>
          <Radio.Button value="UPDATE">Cập nhật thiết bị</Radio.Button>
          <Radio.Button value="DELETE">Gỡ thiết bị</Radio.Button>
        </Radio.Group>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loadingData}
      >
        {requestType === 'ADD' && (
          <>
            <Form.Item 
              name="deviceId" 
              label="Chọn thiết bị (Danh sách thiết bị trống)" 
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select 
                placeholder="Chọn thiết bị để lắp đặt"
                onChange={handleDeviceChange}
                loading={loadingData}
                showSearch={{
                  filterOption: (input, option) =>
                    (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }}
                options={unassignedDevices.map(d => ({
                  label: `${d.deviceName} (${d.tbDeviceId})`,
                  value: d.deviceId
                }))}
              />
            </Form.Item>

            {selectedDevice && (
              <Form.Item 
                name="locationId" 
                label="Phòng / Khu vực" 
                rules={[{ required: true, message: 'Vui lòng chọn phòng/khu vực' }]}
              >
                <Select 
                  placeholder="Chọn nơi lắp đặt"
                  options={locations.map(loc => ({
                    label: loc.locationName,
                    value: loc.locationId
                  }))}
                />
              </Form.Item>
            )}

            {/* Chỉ hiện cấu hình khi thiết bị là Cảm biến (SENSOR) */}
            {selectedDevice?.deviceType === 'SENSOR' && (
              <Space style={{ display: 'flex' }} size={16}>
                <Form.Item 
                  name="unit" 
                  label="Đơn vị đo"
                >
                  <Input placeholder="Ví dụ: °C, %, ppm..." />
                </Form.Item>
                
                <Form.Item 
                  name="threshold" 
                  label="Ngưỡng cảnh báo"
                >
                  <InputNumber controls={false} placeholder="Nhập ngưỡng..." style={{ width: '100%' }} />
                </Form.Item>
              </Space>
            )}

            <Form.Item name="note" label="Ghi chú thêm">
              <TextArea placeholder="Mô tả cụ thể vị trí lắp hoặc yêu cầu khác..." rows={3} />
            </Form.Item>
          </>
        )}

        {requestType === 'UPDATE' && (
          <>
            <Form.Item 
              name="deviceId" 
              label="Thiết bị cần cập nhật" 
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select 
                placeholder="Chọn thiết bị của bạn"
                loading={loadingData}
                showSearch={{
                  filterOption: (input, option) =>
                    (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }}
                options={myDevices.map(d => ({
                  label: `${d.deviceName} - ${d.location || 'Chưa gán phòng'}`,
                  value: d.deviceId
                }))}
              />
            </Form.Item>

            <Form.Item 
              name="content" 
              label="Nội dung cần cập nhật" 
              rules={[{ required: true, message: 'Vui lòng ghi rõ nội dung cần cập nhật' }]}
            >
              <Input placeholder="Ví dụ: Đổi tên thiết bị..." />
            </Form.Item>

            <Form.Item name="note" label="Ghi chú thêm">
              <TextArea placeholder="Chi tiết yêu cầu cập nhật..." rows={3} />
            </Form.Item>
          </>
        )}

        {requestType === 'DELETE' && (
          <>
            <Form.Item 
              name="deviceId" 
              label="Thiết bị cần gỡ bỏ" 
              rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}
            >
              <Select 
                placeholder="Chọn thiết bị của bạn"
                loading={loadingData}
                showSearch={{
                  filterOption: (input, option) =>
                    (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
                }}
                options={myDevices.map(d => ({
                  label: `${d.deviceName} - ${d.location || 'Chưa gán phòng'}`,
                  value: d.deviceId
                }))}
              />
            </Form.Item>

            <div style={{ padding: '16px 20px', background: '#fff1f0', border: '1px solid #ffa39e', borderRadius: 8, marginBottom: 16 }}>
              <Text type="danger" strong>Cảnh báo:</Text>
              <br />
              <Text type="danger">
                Gửi yêu cầu xóa thiết bị sẽ thông báo cho quản trị viên gỡ thiết bị khỏi tài khoản của bạn. 
                Sau khi quản trị viên duyệt, bạn sẽ mất quyền truy cập vào thiết bị này.
              </Text>
            </div>
          </>
        )}
      </Form>
    </Modal>
  )
}