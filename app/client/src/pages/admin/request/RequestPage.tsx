import { useState, useEffect } from 'react'
import { Typography, message } from 'antd'
import { RequestFilters } from './components/RequestFilters'
import { RequestTable } from './components/RequestTable'
import { apiGetRequestDetail, apiGetRequests, apiUpdateRequest, type RequestItemDto } from '../../../lib/requestApi'
import { apiGetUserDetail } from '../../../lib/userApi'
import { RequestDetailModal } from './components/RequestDetailModel'
import '../AdminPages.css'

const { Title, Text } = Typography

export function RequestManagementPage() {
    const [requests, setRequests] = useState<RequestItemDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [btnLoading, setBtnLoading] = useState<boolean>(false)
    
    // Filter & Sort
    const [selectedStatus, setSelectedStatus] = useState<string>('')
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

    // detail request
    const [selectedRequest, setSelectedRequest] = useState<RequestItemDto | null>(null)
    const [modalVisible, setModalVisible] = useState<boolean>(false)

    const fetchRequests = async () => {
        setLoading(true)
        
        try {
            const data = await apiGetRequests()
            
            // Enrich data with user info via separate API calls since BE is not modified
            const enrichedData = await Promise.all(data.map(async (req: any) => {
                let customerInfo = req.customer;
                let adminInfo = req.admin;
                
                if (req.customerId) {
                    const user = await apiGetUserDetail(req.customerId).catch(() => null);
                    if (user) customerInfo = { username: user.username, email: user.email };
                }
                if (req.adminId) {
                    const adminUser = await apiGetUserDetail(req.adminId).catch(() => null);
                    if (adminUser) adminInfo = { username: adminUser.username, email: adminUser.email };
                }

                return {
                    ...req,
                    customer: customerInfo,
                    admin: adminInfo
                }
            }))

            setRequests(enrichedData)
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Không thể tải danh sách yêu cầu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    // Approval
    const handleProcessRequest = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setBtnLoading(true)

        try {
            await apiUpdateRequest(id, status)
            message.success(status === 'APPROVED' ? 'Đã phê duyệt yêu cầu thành công' : 'Đã từ chối yêu cầu')
            fetchRequests()
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Xử lý yêu cầu thất bại')
        } finally {
            setBtnLoading(false)
        }
    }

    const handleOpenDetail = async (requestId: string) => {
        setModalVisible(true)

        try {
            const data: any = await apiGetRequestDetail(requestId)
            
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

            setSelectedRequest({
                ...data,
                customer: customerInfo,
                admin: adminInfo
            })
        } catch (error) {
            message.error('Không thể lấy thông tin chi tiết của yêu cầu này')
            setModalVisible(false)
        }
    }

    const processedRequests = requests
        .filter((req) => (selectedStatus ? req.status === selectedStatus : true))
        .sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime()
            const timeB = new Date(b.createdAt).getTime()
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
        })

    return (
        <section className="admin-page" aria-labelledby="request-mgmt-title">
            <div className="admin-heading">
                <div className="admin-heading-left">
                    <Title id="request-mgmt-title" level={1} className="admin-title">
                        Phê Duyệt Yêu Cầu
                    </Title>
                    <Text className="admin-subtitle">
                        Quản lý việc sử dụng các thiết bị IoT
                    </Text>
                </div>
            </div>

            <RequestFilters
                onStatusChange={(val) => setSelectedStatus(val ?? '')}
                onSortChange={setSortOrder}
                sortValue={sortOrder}
            />

            <RequestTable
                loading={loading}
                data={processedRequests}
                onRowClick={(record) => handleOpenDetail(record.requestId)}
            />

            <RequestDetailModal
                visible={modalVisible}
                request={selectedRequest}
                actionLoading={btnLoading}
                onAction={handleProcessRequest}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedRequest(null);
                }}
            />
        </section>
    )
}