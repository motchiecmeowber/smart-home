import { Modal, Form, Select, Input, Radio, message, Typography } from "antd"
import { useEffect, useState } from "react"
import { apiGetMyDevices, apiGetAvailableDevices, type DeviceInfo } from "../../../../lib/deviceApi"
import { apiCreateRequest } from "../../../../lib/requestApi"

const { Text } = Typography
const { TextArea } = Input

type RequestType = 'ADD' | 'UPDATE' | 'DELETE'

type AddRequestModalProps = {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function AddRequestModal({ open, onCancel, onSuccess }: AddRequestModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const [requestType, setRequestType] = useState<RequestType>('ADD')
  const [myDevices, setMyDevices] = useState<DeviceInfo[]>([])
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([])
  const [loadingData, setLoadingData] = useState(false)

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
      const [myDevs, availDevs] = await Promise.all([
        apiGetMyDevices(),
        apiGetAvailableDevices(),
      ])
      setMyDevices(myDevs)
      setAvailableDevices(availDevs)
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true)

      const selectedSerials: string[] = values.serials ?? []
      const sourceList = requestType === 'ADD' ? availableDevices : myDevices
      const selectedDevices = sourceList.filter(d => selectedSerials.includes(d.serial))
      const names = selectedDevices.map(d => d.deviceName)

      if (selectedSerials.length === 0) {
        message.warning('Vui lòng chọn ít nhất một thiết bị hợp lệ')
        return
      }

      const titleMap: Record<RequestType, string> = {
        ADD: names.length === 1 ? `Yêu cầu thêm thiết bị ${names[0]}` : `Yêu cầu thêm ${names.length} thiết bị`,
        UPDATE: names.length === 1 ? `Yêu cầu cập nhật thiết bị ${names[0]}` : `Yêu cầu cập nhật ${names.length} thiết bị`,
        DELETE: names.length === 1 ? `Yêu cầu gỡ bỏ thiết bị ${names[0]}` : `Yêu cầu gỡ bỏ ${names.length} thiết bị`,
      }

      await apiCreateRequest({
        title: titleMap[requestType],
        requestType,
        serial_list: selectedSerials,
        content: values.content || undefined,
      })

      const successMsg: Record<RequestType, string> = {
        ADD: 'Gửi yêu cầu thêm thiết bị thành công',
        UPDATE: 'Gửi yêu cầu cập nhật thiết bị thành công',
        DELETE: 'Gửi yêu cầu gỡ bỏ thiết bị thành công',
      }
      message.success(successMsg[requestType])
      onSuccess()
    } catch (error: any) {
      message.error(error.message || 'Lỗi gửi yêu cầu')
    } finally {
      setSubmitting(false)
    }
  }

  const addOptions = availableDevices.map(d => ({
    label: `${d.deviceName} (${d.serial})`,
    value: d.serial,
  }))

  const myOptions = myDevices.map(d => ({
    label: `${d.deviceName} – ${d.location ?? 'Chưa gán phòng'} (${d.serial})`,
    value: d.serial,
  }))

  const deviceOptions = requestType === 'ADD' ? addOptions : myOptions

  const deviceSelectLabel: Record<RequestType, string> = {
    ADD: 'Chọn thiết bị muốn thêm',
    UPDATE: 'Chọn thiết bị cần cập nhật',
    DELETE: 'Chọn thiết bị muốn gỡ bỏ',
  }

  const deviceSelectPlaceholder: Record<RequestType, string> = {
    ADD: 'Chọn thiết bị có sẵn...',
    UPDATE: 'Chọn từ thiết bị của bạn...',
    DELETE: 'Chọn từ thiết bị của bạn...',
  }

  const notFoundContent: Record<RequestType, string> = {
    ADD: loadingData ? 'Đang tải...' : 'Không có thiết bị khả dụng',
    UPDATE: loadingData ? 'Đang tải...' : 'Bạn chưa có thiết bị nào',
    DELETE: loadingData ? 'Đang tải...' : 'Bạn chưa có thiết bị nào',
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
      destroyOnHidden
    >
      {/* Request type selector */}
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Radio.Group
          value={requestType}
          onChange={e => {
            setRequestType(e.target.value as RequestType)
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
        <Form.Item
          name="serials"
          label={deviceSelectLabel[requestType]}
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất một thiết bị' }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder={deviceSelectPlaceholder[requestType]}
            loading={loadingData}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={deviceOptions}
            notFoundContent={notFoundContent[requestType]}
          />
        </Form.Item>

        {/* Nội dung / ghi chú */}
        {requestType === 'ADD' && (
          <Form.Item name="content" label="Ghi chú thêm">
            <TextArea
              placeholder="Mô tả cụ thể vị trí lắp hoặc yêu cầu khác..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}

        {requestType === 'UPDATE' && (
          <Form.Item
            name="content"
            label="Nội dung cần cập nhật"
            rules={[{ required: true, message: 'Vui lòng ghi rõ nội dung cần cập nhật' }]}
          >
            <TextArea
              placeholder="Ví dụ: Đổi tên thiết bị, thay đổi cấu hình..."
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}

        {requestType === 'DELETE' && (
          <>
            <Form.Item name="content" label="Lý do gỡ bỏ (tuỳ chọn)">
              <TextArea
                placeholder="Ghi rõ lý do nếu cần..."
                rows={2}
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Warning box – giữ nguyên style cũ */}
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