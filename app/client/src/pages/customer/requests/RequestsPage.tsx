import { Button, Card, Col, message, Row, Spin, Typography, Segmented, Table } from 'antd'
import type { TableProps } from 'antd'
import { PlusOutlined, ProfileOutlined, CheckCircleOutlined, ClockCircleOutlined, BulbOutlined, LockOutlined, ThunderboltOutlined, AppstoreOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { apiGetRequests, type RequestItemDto } from '../../../lib/requestApi'
import { AddRequestModal } from './components/AddRequestModal'
import { RequestDetailModal } from './components/RequestDetailModal'
import '../CustomerPages.css'
import './RequestsPage.css'

const { Text, Title } = Typography

// Helper to get icon based on device name
function getDeviceIcon(deviceName: string) {
  const name = (deviceName || '').toLowerCase()
  if (name.includes('đèn') || name.includes('light')) return <BulbOutlined />
  if (name.includes('khóa') || name.includes('lock')) return <LockOutlined />
  if (name.includes('điều hòa') || name.includes('quạt') || name.includes('fan')) return <ThunderboltOutlined />
  return <AppstoreOutlined />
}

export function RequestsPage() {
  const [requests, setRequests] = useState<RequestItemDto[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RequestItemDto | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = await apiGetRequests()
      setRequests(data)
    } catch (error: any) {
      message.error(error.message || 'Lỗi tải danh sách yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const { totalRequests, approvedRequests, pendingRequests } = useMemo(() => {
    return {
      totalRequests: requests.length,
      approvedRequests: requests.filter((r) => r.status === 'APPROVED').length,
      pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
    }
  }, [requests])

  // Filter requests for the table
  const filteredRequests = useMemo(() => {
    if (filter === 'PENDING') {
      return requests.filter(r => r.status === 'PENDING')
    }
    if (filter === 'DONE') {
      return requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED')
    }
    return requests
  }, [requests, filter])

  // Table Columns
  const columns: TableProps<RequestItemDto>['columns'] = [
    {
      title: 'THIẾT BỊ & LOẠI YÊU CẦU',
      key: 'device',
      width: '45%',
      render: (_, record) => {
        const deviceName = record.device?.deviceName || 'Yêu cầu hệ thống'
        const action = record.requestType === 'ADD' 
                    ? 'Thêm thiết bị mới' : record.requestType === 'UPDATE' 
                    ? 'Cập nhật thiết bị' : record.requestType === 'DELETE' 
                    ? 'Gỡ bỏ thiết bị' : 'Yêu cầu hệ thống'
        
        return (
          <div className="request-device-cell">
            <div className="request-device-icon">
              {getDeviceIcon(deviceName)}
            </div>
            <div className="request-device-info">
              <span className="request-device-name">{deviceName}</span>
              <span className="request-device-action">{action}</span>
            </div>
          </div>
        )
      }
    },
    {
      title: 'THỜI GIAN',
      key: 'time',
      width: '30%',
      render: (_, record) => {
        const date = new Date(record.createdAt)
        return (
          <span className="request-time-cell">
            {date.toLocaleDateString('vi-VN')}, {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      }
    },
    {
      title: 'TRẠNG THÁI',
      key: 'status',
      align: 'right',
      width: '25%',
      render: (_, record) => {
        let label = ''
        if (record.status === 'PENDING') label = 'Đang chờ duyệt'
        if (record.status === 'APPROVED') label = 'Đã chấp thuận'
        if (record.status === 'REJECTED') label = 'Bị từ chối'
        return (
          <div className={`request-status-badge ${record.status}`}>
            {label}
          </div>
        )
      }
    }
  ]

  return (
    <section className="customer-page" aria-labelledby="requests-title" style={{ maxWidth: 1000, margin: '0 auto', width: '100%'}}>
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="requests-title" level={1} className="customer-title">
            Yêu cầu của tôi
          </Title>
        </div>

        <Button 
          icon={<PlusOutlined />} 
          size="large" 
          type="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Thêm yêu cầu
        </Button>
      </div>

      <Spin spinning={loading}>
        <Row className="requests-summary" gutter={[16, 16]}>
          <Col lg={8} sm={12} xs={24}>
            <Card className="request-summary-card summary-total" size="small" variant='borderless'>
              <div className="request-summary-icon">
                <ProfileOutlined />
              </div>
              <div className="request-summary-info">
                <Text>Tổng yêu cầu</Text>
                <Title level={2}>{totalRequests === 0 ? totalRequests : totalRequests < 10 ? `0${totalRequests}` : totalRequests}</Title>
              </div>
            </Card>
          </Col>
          <Col lg={8} sm={12} xs={24}>
            <Card className="request-summary-card summary-approved" size="small" variant='borderless'>
              <div className="request-summary-icon">
                <CheckCircleOutlined />
              </div>
              <div className="request-summary-info">
                <Text>Đã chấp thuận</Text>
                <Title level={2}>{approvedRequests === 0 ? approvedRequests : approvedRequests < 10 ? `0${approvedRequests}` : approvedRequests }</Title>
              </div>
            </Card>
          </Col>
          <Col lg={8} sm={24} xs={24}>
            <Card className="request-summary-card summary-pending" size="small" variant='borderless'>
              <div className="request-summary-icon">
                <ClockCircleOutlined />
              </div>
              <div className="request-summary-info">
                <Text>Đang xử lý</Text>
                <Title level={2}>{pendingRequests === 0 ? pendingRequests : pendingRequests < 10 ? `0${pendingRequests}` : pendingRequests}</Title>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>

      <div className="request-list-container" style={{ marginTop: 24 }}>
        <div className="request-list-header">
          <h3>Danh sách yêu cầu</h3>
          <div className="request-filter-tabs">
            <Segmented
              value={filter}
              onChange={(val) => setFilter(val as string)}
              options={[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Đang chờ', value: 'PENDING' },
                { label: 'Đã xử lý', value: 'DONE' }
              ]}
            />
          </div>
        </div>

        <Table 
          className="request-table"
          columns={columns} 
          dataSource={filteredRequests}
          rowKey="requestId"
          pagination={false}
          loading={loading}
          showHeader={true}
          tableLayout="fixed"
          onRow={(record) => ({
            onClick: () => setSelectedRequest(record),
            style: { cursor: 'pointer' }
          })}
        />
        
        {filteredRequests.length > 5 && (
          <div className="request-load-more">
            <Button type="link">Xem thêm yêu cầu cũ</Button>
          </div>
        )}
      </div>

      <AddRequestModal 
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false)
          fetchRequests()
        }}
      />

      <RequestDetailModal
        visible={!!selectedRequest}
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </section>
  )
}