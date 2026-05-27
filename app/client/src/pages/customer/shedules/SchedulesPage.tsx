import { useEffect, useState } from 'react'
import { Button, Form, Typography, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { apiGetDevices, type DeviceInfo } from '../../../lib/deviceApi'
import { apiCreateSchedule, apiDeleteSchedule, apiGetSchedules, apiUpdateSchedule, type ScheduleDTO } from '../../../lib/scheduleApi'
import { SchedulesSummary } from './components/SchedulesSummary'
import { SchedulesTable } from './components/SchedulesTable'
import { AddScheduleModal } from './components/AddScheduleModal'
import { ScheduleDetailModal } from './components/ScheduleDetailModal'
import '../CustomerPages.css'
import './SchedulesPage.css'

const { Title } = Typography

export function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleDTO[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [actuators, setActuators] = useState<DeviceInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDTO | null>(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [schData, devData] = await Promise.all([
        apiGetSchedules(),
        apiGetDevices()
      ])

      setSchedules(schData)
      setActuators(devData.filter(d => d.deviceType === 'ACTUATOR'))
    } catch (error: any) {
      message.error(error.message || 'Lỗi lấy danh sách lịch trình')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      await apiUpdateSchedule({ scheduleId: id})
      setSchedules(
        prev => prev.map(s => s.scheduleId === id ? { ...s, enabled: checked} : s)
      )

      message.success(`Đã ${checked ? 'bật' : 'tắt'} lịch trình thành công!`)
    } catch (error: any) {
      message.error('Cập nhật thất bại')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.scheduleId !== id))
      message.success('Đã xóa lịch trình thành công!')
    } catch (error: any) {
      message.error(error.message || 'Lỗi xóa lịch trình')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      let formattedStartTime = undefined

      if (values.startHour !== undefined && values.startMinute !== undefined) {
        const today = new Date()
        today.setHours(values.startHour, values.startMinute, 0, 0)
        formattedStartTime = today.toISOString()
      }

      const payload = {
        actuatorId: values.actuatorId,
        action: values.action,
        frequency: values.frequency,
        startTime: formattedStartTime,
        duration: values.duration
      }

      if (editingSchedule) {
        const updated = await apiUpdateSchedule({ scheduleId: editingSchedule.scheduleId, ...payload })
        setSchedules((prev) => prev.map((s) => s.scheduleId === updated.scheduleId ? updated : s))
        message.success('Cập nhật lịch trình thành công!')
      } else {
        const newSchedule = await apiCreateSchedule(payload)
        setSchedules((prev) => [...prev, newSchedule])
        message.success('Thêm lịch trình mới thành công!')
      }

      setModalVisible(false)
      setEditingSchedule(null)
      form.resetFields()
    } catch (error: any) {
      message.error(error.message || 'Lỗi lưu lịch trình')
    }
  }

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

      <SchedulesSummary schedules={schedules} />

      <div className="request-list-container">
        <div className="request-list-header">
          <h3>Danh sách lịch trình</h3>
        </div>

        <SchedulesTable
          schedules={schedules}
          actuators={actuators}
          loading={loading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onView={(id) => {
            setSelectedScheduleId(id)
            setDetailModalVisible(true)
          }}
        />
      </div>

      <AddScheduleModal
        open={modalVisible}
        form={form}
        actuators={actuators}
        initialData={editingSchedule}
        onCancel={() => {
          setModalVisible(false)
          setEditingSchedule(null)
          form.resetFields()
        }}
        onAdd={handleSubmit}
      />

      <ScheduleDetailModal
        open={detailModalVisible}
        scheduleId={selectedScheduleId}
        actuators={actuators}
        onClose={() => {
          setDetailModalVisible(false)
          setSelectedScheduleId(null)
        }}
        onDelete={(id) => {
          handleDelete(id)
          setDetailModalVisible(false)
          setSelectedScheduleId(null)
        }}
        onEdit={(schedule) => {
          setEditingSchedule(schedule)
          setDetailModalVisible(false)
          setModalVisible(true)
        }}
      />
    </section>
  )
}
