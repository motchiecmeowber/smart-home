import { useEffect, useState } from 'react'
import { message, Typography, Spin, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { apiGetUsers } from '../../../lib/userApi'
import { apiGetDevices } from '../../../lib/deviceApi'
import { apiGetRequests, apiGetRequestDetail, apiUpdateRequest, apiDeleteRequest, type RequestItemDto } from '../../../lib/requestApi'
import { apiGetUserDetail } from '../../../lib/userApi'
import { StatCards, type DashboardStats } from './components/StatCards'
import { RecentRequests } from './components/RecentRequests'
import { useAuth } from '../../../hooks/useAuth'
import { RequestDetailModal } from '../request/components/RequestDetailModel'
import '../AdminPages.css'

const { Title, Text } = Typography

export function AdminDashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalDevices: 0,
        onlineDevices: 0,
        pendingRequests: 0,
    })
    const [recentRequests, setRecentRequests] = useState<RequestItemDto[]>([])
    
    // Modal state
    const [selectedRequest, setSelectedRequest] = useState<RequestItemDto | null>(null)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)

    const currentDate = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                const [users, devices, requests] = await Promise.all([
                    apiGetUsers(),
                    apiGetDevices(),
                    apiGetRequests(),
                ])

                const customerUsers = users.filter(u => u.role === 'CUSTOMER')
                const pendingReqs = requests.filter(r => r.status === 'PENDING')

                setStats({
                    totalUsers: customerUsers.length,
                    totalDevices: devices.length,
                    onlineDevices: devices.filter(d => d.status === 'ONLINE').length,
                    pendingRequests: pendingReqs.length,
                })

                // Top 5 recent pending requests enriched
                const top5Pending = pendingReqs.slice(0, 5)
                const enrichedRecentRequests = top5Pending.map((req: any) => {
                    const reqUser = users.find(u => u.userId === req.customerId)
                    return {
                        ...req,
                        customer: reqUser ? { username: reqUser.username, email: reqUser.email } : req.customer
                    }
                })

                setRecentRequests(enrichedRecentRequests)
            } catch (error) {
                message.error('Lỗi khi tải dữ liệu')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const handleNavigateToRequests = () => {
        window.history.pushState(null, '', '/admin/requests')
        window.dispatchEvent(new PopStateEvent('popstate'))
    }

    const handleOpenDetail = async (record: RequestItemDto) => {
        setModalVisible(true)
        
        try {
            const data: any = await apiGetRequestDetail(record.requestId)
            let customerInfo = data.customer;
            let adminInfo = data.admin;
            if (data.customerId) {
                const user = await apiGetUserDetail(data.customerId).catch(() => null);
                if (user) customerInfo = { username: user.username, email: user.email };
            }
            if (data.adminId) {
                const adminUser = await apiGetUserDetail(data.adminId).catch(() => null);
                if (adminUser) adminInfo = { username: adminUser.username, email: adminUser.email };
            }
            setSelectedRequest({ ...data, customer: customerInfo, admin: adminInfo })
        } catch (error) {
            message.error('Không thể lấy thông tin chi tiết')
            setModalVisible(false)
        }
    }

    const handleProcessRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setBtnLoading(true)
        try {
            await apiUpdateRequest(id, status)
            message.success('Đã cập nhật yêu cầu thành công')
            setRecentRequests(prev => prev.map(r => r.requestId === id ? { ...r, status } : r))
            setModalVisible(false)
            setSelectedRequest(null)
        } catch (error) {
            message.error('Xử lý thất bại')
        } finally {
            setBtnLoading(false)
        }
    }

    return (
        <section className="admin-page" aria-labelledby="dashboard-title">
            <div className="admin-heading" style={{ marginBottom: 8 }}>
                <div className="admin-heading-left">
                    <Text className="admin-subtitle" style={{ fontStyle: "italic" }}>
                        Xin chào, <span style={{ fontWeight: 700 }}>{user?.username || 'Admin'}</span>
                    </Text>
                    <Title id="dashboard-title" level={1} className="admin-title">
                        Dashboard
                    </Title>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Space>
                        <CalendarOutlined style={{ color: '#595959', fontSize: 16 }} />
                        <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                            {currentDate}
                        </Text>
                    </Space>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <Spin size="large" description="Đang tải dữ liệu tổng quan..." />
                </div>
            ) : (
                <>
                    <StatCards stats={stats} />
                    <RecentRequests 
                        requests={recentRequests} 
                        onNavigateToRequests={handleNavigateToRequests} 
                        onRowClick={handleOpenDetail}
                    />
                </>
            )}

            <RequestDetailModal
                visible={modalVisible}
                request={selectedRequest}
                actionLoading={btnLoading}
                onAction={handleProcessRequest}
                onClose={() => {
                    setModalVisible(false)
                    setSelectedRequest(null)
                }}
                onDelete={async (id) => {
                    try {
                        await apiDeleteRequest(id)
                        message.success('Đã xóa yêu cầu thành công')

                        setRecentRequests(prev => prev.filter(r => r.requestId !== id))
                        setModalVisible(false)
                        setSelectedRequest(null)
                    } catch (error) {
                        message.error('Xóa yêu cầu thất bại')
                    }
                }}
            />
        </section>
    )
}