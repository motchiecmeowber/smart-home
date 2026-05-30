import { Button, Card, Col, message, Row, Spin, Typography, Segmented, Table, Tag, Space, Collapse, Badge, Pagination } from 'antd'
import type { TableProps } from 'antd'
import {
    PlusOutlined, ProfileOutlined, CheckCircleOutlined,
    ClockCircleOutlined, AppstoreOutlined, DownOutlined
} from '@ant-design/icons'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { apiGetRequests, type RequestItemDto, type PaginationMeta } from '../../../lib/requestApi'
import { AddRequestModal } from './components/AddRequestModal'
import { RequestDetailModal } from './components/RequestDetailModal'
import '../CustomerPages.css'
import './RequestsPage.css'

const { Text, Title } = Typography

// ---- Helpers ----
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Đang chờ duyệt', className: 'PENDING' },
    APPROVED: { label: 'Đã chấp thuận', className: 'APPROVED' },
    REJECTED: { label: 'Bị từ chối', className: 'REJECTED' },
}

const TYPE_COLOR: Record<string, string> = {
    ADD: 'blue',
    UPDATE: 'orange',
    DELETE: 'red',
}

const TYPE_LABEL: Record<string, string> = {
    ADD: 'Thêm thiết bị',
    UPDATE: 'Cập nhật',
    DELETE: 'Gỡ bỏ',
}

interface BatchGroup {
    batchKey: string
    batchId: string | null
    items: RequestItemDto[]
    requestType: string
    /** MIXED = có PENDING lẫn APPROVED/REJECTED; DONE_MIXED = chỉ APPROVED+REJECTED không còn PENDING */
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MIXED' | 'DONE_MIXED'
    createdAt: string
    title: string
}

function groupByBatch(requests: RequestItemDto[]): BatchGroup[] {
    const map = new Map<string, RequestItemDto[]>()
    requests.forEach(r => {
        const key = r.batchId ?? r.requestId
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(r)
    })

    return Array.from(map.entries()).map(([batchKey, items]) => {
        const statuses = new Set(items.map(i => i.status))
        let status: BatchGroup['status']
        if (statuses.size === 1) {
            status = items[0].status as BatchGroup['status']
        } else if (items.some(i => i.status === 'PENDING')) {
            status = 'MIXED'       // có request chưa xử lý
        } else {
            status = 'DONE_MIXED'  // tất cả đã xử lý (một số approve, một số reject)
        }
        return {
            batchKey,
            batchId: items[0].batchId ?? null,
            items,
            requestType: items[0].requestType ?? '',
            status,
            createdAt: items[0].createdAt,
            title: items[0].note ?? `Yêu cầu ${items[0].requestType?.toLowerCase() ?? ''} ${items.length} thiết bị`,
        }
    })
}

const PAGE_SIZE = 20

export function RequestsPage() {
    const [requests, setRequests] = useState<RequestItemDto[]>([])
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1,
        hasNextPage: false, hasPrevPage: false,
    })
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState<string>('ALL')
    const [currentPage, setCurrentPage] = useState(1)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<RequestItemDto | null>(null)

    // Stats – fetched once unfiltered via pagination totals
    const [totalAll, setTotalAll] = useState(0)
    const [totalDone, setTotalDone] = useState(0)   // APPROVED + REJECTED
    const [totalPending, setTotalPending] = useState(0)

    const fetchStats = useCallback(async () => {
        try {
            const [all, approved, rejected, pending] = await Promise.all([
                apiGetRequests({ page: 1, pageSize: 1 }),
                apiGetRequests({ page: 1, pageSize: 1, status: 'APPROVED' }),
                apiGetRequests({ page: 1, pageSize: 1, status: 'REJECTED' }),
                apiGetRequests({ page: 1, pageSize: 1, status: 'PENDING' }),
            ])
            setTotalAll(all.pagination.total)
            setTotalDone(approved.pagination.total + rejected.pagination.total)
            setTotalPending(pending.pagination.total)
        } catch {
            // stats non-critical
        }
    }, [])

    const fetchList = useCallback(async (page: number, f: string) => {
        setLoading(true)
        try {
            const statusParam =
                f === 'PENDING' ? 'PENDING' as const : undefined
            const res = await apiGetRequests({ page, pageSize: PAGE_SIZE, status: statusParam })
            setRequests(res.data)
            setPagination(res.pagination)
        } catch (err: any) {
            message.error(err.message || 'Lỗi tải danh sách yêu cầu')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchStats()
        fetchList(1, 'ALL')
    }, [fetchStats, fetchList])

    const handleFilterChange = (f: string) => {
        setFilter(f)
        setCurrentPage(1)
        fetchList(1, f)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        fetchList(page, filter)
    }

    const refresh = () => {
        fetchStats()
        fetchList(currentPage, filter)
    }

    // Client-side filter for DONE tab (APPROVED | REJECTED on current page)
    const visibleRequests = useMemo(() => {
        if (filter === 'DONE')
            return requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED')
        return requests
    }, [requests, filter])

    // Group into batches
    const batches = useMemo(() =>
        groupByBatch(visibleRequests).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        [visibleRequests]
    )

    // Inner table columns (per device)
    const innerColumns: TableProps<RequestItemDto>['columns'] = [
        {
            title: 'Thiết bị',
            key: 'device',
            render: (_, r) => (
                <Space>
                    <AppstoreOutlined />
                    <Text strong>{r.device?.deviceName ?? '—'}</Text>
                    {r.device?.deviceType && (
                        <Tag color={r.device.deviceType === 'SENSOR' ? 'cyan' : 'orange'}>
                            {r.device.deviceType}
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Thời gian',
            key: 'time',
            width: 150,
            render: (_, r) => {
                const d = new Date(r.createdAt)
                return (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {d.toLocaleDateString('vi-VN')}, {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            width: 180,
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status]
                return <div className={`request-status-badge ${cfg.className}`}>{cfg.label}</div>
            }
        }
    ]

    const fmt = (n: number) => n === 0 ? '00' : n < 10 ? `0${n}` : `${n}`

    return (
        <section className="customer-page" aria-labelledby="requests-title" style={{ margin: '0 auto', width: '100%' }}>
            <div className="customer-heading">
                <div className="customer-heading-left">
                    <Title id="requests-title" level={1} className="customer-title">Yêu cầu của tôi</Title>
                </div>
                <Button
                    icon={<PlusOutlined />}
                    size="large" 
                    type="primary"
                    onClick={() => setIsAddModalOpen(true)}
                    style={{ fontSize: 15, fontWeight: 600, background: '#0b5f95', borderColor: '#0b5f95' }}
                >
                    Thêm yêu cầu
                </Button>
            </div>

            <Spin spinning={loading}>
                <Row className="requests-summary" gutter={[16, 16]}>
                    <Col lg={8} sm={12} xs={24}>
                        <Card className="request-summary-card summary-total" size="small" variant='borderless'>
                            <div className="request-summary-icon"><ProfileOutlined /></div>
                            <div className="request-summary-info">
                                <Text>Tổng yêu cầu</Text>
                                <Title level={2}>{fmt(totalAll)}</Title>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={8} sm={12} xs={24}>
                        <Card className="request-summary-card summary-approved" size="small" variant='borderless'>
                            <div className="request-summary-icon"><CheckCircleOutlined /></div>
                            <div className="request-summary-info">
                                <Text>Đã xử lý</Text>
                                <Title level={2}>{fmt(totalDone)}</Title>
                            </div>
                        </Card>
                    </Col>
                    <Col lg={8} sm={24} xs={24}>
                        <Card className="request-summary-card summary-pending" size="small" variant='borderless'>
                            <div className="request-summary-icon"><ClockCircleOutlined /></div>
                            <div className="request-summary-info">
                                <Text>Đang xử lý</Text>
                                <Title level={2}>{fmt(totalPending)}</Title>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Spin>

            <div className="request-list-container" style={{ marginTop: 24 }}>
                <div className="request-list-header">
                    <h3>
                        Danh sách yêu cầu
                        {!loading && (
                            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
                                ({pagination.total} yêu cầu)
                            </Text>
                        )}
                    </h3>
                    <div className="request-filter-tabs">
                        <Segmented
                            value={filter}
                            onChange={(val) => handleFilterChange(val as string)}
                            options={[
                                { label: 'Tất cả', value: 'ALL' },
                                { label: 'Đang chờ', value: 'PENDING' },
                                { label: 'Đã xử lý', value: 'DONE' },
                            ]}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}><Spin /></div>
                ) : batches.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0', color: '#999' }}>
                        <AppstoreOutlined style={{ fontSize: 40, marginBottom: 12 }} />
                        <div>Chưa có yêu cầu nào</div>
                    </div>
                ) : (
                    <>
                        <Collapse
                            accordion={false}
                            expandIconPlacement="end"
                            expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                            style={{ background: 'transparent' }}
                            items={batches.map((batch) => {
                                const typeColor = TYPE_COLOR[batch.requestType] ?? 'default'
                                const typeLabel = TYPE_LABEL[batch.requestType] ?? batch.requestType

                                const batchStatus =
                                    batch.status === 'APPROVED' ? 'Đã chấp thuận'
                                        : batch.status === 'REJECTED' ? 'Bị từ chối'
                                            : batch.status === 'DONE_MIXED' ? 'Đã xử lý'
                                                : batch.status === 'MIXED' ? 'Đang xử lý (một phần)'
                                                    : 'Đang chờ duyệt'
                                const batchStatusClass =
                                    batch.status === 'APPROVED' ? 'APPROVED'
                                        : batch.status === 'REJECTED' ? 'REJECTED'
                                            : batch.status === 'DONE_MIXED' ? 'APPROVED'
                                                : 'PENDING'

                                return {
                                    key: batch.batchKey,
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                            <Badge count={batch.items.length} color="#1677ff" />
                                            <Tag color={typeColor}>{typeLabel}</Tag>
                                            <Text strong style={{ flex: 1 }}>{batch.title}</Text>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(batch.createdAt).toLocaleDateString('vi-VN')}{' '}
                                                {new Date(batch.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <div className={`request-status-badge ${batchStatusClass}`} style={{ fontSize: 12 }}>
                                                {batchStatus}
                                            </div>
                                        </div>
                                    ),
                                    children: (
                                        <Table
                                            columns={innerColumns}
                                            dataSource={batch.items}
                                            rowKey="requestId"
                                            pagination={false}
                                            size="small"
                                            showHeader={batch.items.length > 1}
                                            onRow={(r) => ({
                                                onClick: () => setSelectedRequest(r),
                                                style: { cursor: 'pointer' }
                                            })}
                                        />
                                    )
                                }
                            })}
                        />

                        {/* Server-side Pagination */}
                        {pagination.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={PAGE_SIZE}
                                    total={pagination.total}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    showTotal={(total, range) =>
                                        `${range[0]}–${range[1]} trong ${total} yêu cầu`
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <AddRequestModal
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                onSuccess={() => { setIsAddModalOpen(false); refresh() }}
            />

            <RequestDetailModal
                visible={!!selectedRequest}
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
            />
        </section>
    )
}