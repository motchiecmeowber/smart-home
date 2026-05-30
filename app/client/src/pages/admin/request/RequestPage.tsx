import { useEffect, useMemo, useState, useCallback } from 'react'
import {
    Badge, Button, Collapse, message, Pagination,
    Popconfirm, Segmented, Space, Spin, Table, Tag, Typography,
} from 'antd'
import type { TableProps } from 'antd'
import {
    AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined,
    CloseCircleOutlined, DeleteOutlined, DownOutlined, ProfileOutlined,
} from '@ant-design/icons'
import {
    apiApproveByIds, apiRejectByIds,
    apiGetRequests, apiDeleteRequest,
    type RequestItemDto, type PaginationMeta,
} from '../../../lib/requestApi'
import { RequestDetailModal } from '../../customer/requests/components/RequestDetailModal'
import '../AdminPages.css'
import '../../customer/requests/RequestsPage.css'

const { Text, Title } = Typography

// ── Shared helpers ────────────────────────────────────────────────────────────

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
            title: items[0].note ?? `Yêu cầu ${items[0].requestType === 'ADD' 
                ? 'thêm' : items[0].requestType === 'UPDATE' 
                ? 'cập nhật' : 'xóa'} ${items.length} thiết bị`,
        }
    })
}

const PAGE_SIZE = 20   // requests per page sent to server

// ── Main Component ────────────────────────────────────────────────────────────
export function RequestManagementPage() {
    // ── List state ────────────────────────────────────────────────────────────
    const [requests, setRequests] = useState<RequestItemDto[]>([])
    const [pagination, setPagination] = useState<PaginationMeta>({
        page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1,
        hasNextPage: false, hasPrevPage: false,
    })
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    // ── Filter / page state ───────────────────────────────────────────────────
    // 'ALL' | 'PENDING' | 'DONE'  (UI)
    const [filter, setFilter] = useState<string>('ALL')
    const [currentPage, setCurrentPage] = useState(1)

    // ── Stats (fetched once, unfiltered) ──────────────────────────────────────
    const [totalAll, setTotalAll] = useState(0)
    const [totalDone, setTotalDone] = useState(0)   // APPROVED + REJECTED
    const [totalPending, setTotalPending] = useState(0)

    // ── Detail modal ──────────────────────────────────────────────────────────
    const [selectedRequest, setSelectedRequest] = useState<RequestItemDto | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // ── Selection ─────────────────────────────────────────────────────────────
    const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})

    // ── Map filter → API status param ─────────────────────────────────────────
    type StatusParam = 'PENDING' | 'APPROVED' | 'REJECTED' | undefined

    // For DONE we need two separate fetches or we leave status undefined and
    // filter client-side on the current page items (acceptable since page is small).
    const statusParam = (f: string): StatusParam =>
        f === 'PENDING' ? 'PENDING' : undefined

    // ── Fetch helpers ─────────────────────────────────────────────────────────
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
            // stats non-critical — silently ignore
        }
    }, [])

    const fetchList = useCallback(async (page: number, f: string) => {
        setLoading(true)
        try {
            const res = await apiGetRequests({
                page,
                pageSize: PAGE_SIZE,
                status: statusParam(f),
            })
            setRequests(res.data)
            setPagination(res.pagination)
        } catch (err: any) {
            message.error(err.message || 'Lỗi tải danh sách yêu cầu')
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load
    useEffect(() => {
        fetchStats()
        fetchList(1, 'ALL')
    }, [fetchStats, fetchList])

    // When filter changes → reset to page 1 and re-fetch
    const handleFilterChange = (f: string) => {
        setFilter(f)
        setCurrentPage(1)
        setSelectedIds({})
        fetchList(1, f)
    }

    // When page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedIds({})
        fetchList(page, filter)
    }

    const refresh = () => {
        fetchStats()
        fetchList(currentPage, filter)
    }

    // ── Client-side filter for DONE (APPROVED | REJECTED on current page) ─────
    const visibleRequests = useMemo(() => {
        if (filter === 'DONE')
            return requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED')
        return requests
    }, [requests, filter])

    // ── Group visible requests into batches ───────────────────────────────────
    const batches = useMemo(() =>
        groupByBatch(visibleRequests).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        [visibleRequests]
    )

    // ── Selection helpers ─────────────────────────────────────────────────────
    const pendingIdsInBatch = (batch: BatchGroup) =>
        batch.items.filter(r => r.status === 'PENDING').map(r => r.requestId)

    const selectedCountInBatch = (batch: BatchGroup) =>
        batch.items.filter(r => selectedIds[r.requestId]).length

    const toggleSelectBatch = (batch: BatchGroup, checked: boolean) => {
        const ids = pendingIdsInBatch(batch)
        setSelectedIds(prev => {
            const next = { ...prev }
            ids.forEach(id => { next[id] = checked })
            return next
        })
    }

    const toggleSelectRow = (requestId: string, checked: boolean) => {
        setSelectedIds(prev => ({ ...prev, [requestId]: checked }))
    }

    const allSelectedInBatch = (batch: BatchGroup) => {
        const ids = pendingIdsInBatch(batch)
        return ids.length > 0 && ids.every(id => selectedIds[id])
    }

    const allSelectedIds = Object.entries(selectedIds)
        .filter(([, v]) => v)
        .map(([k]) => k)

    // ── Bulk actions ──────────────────────────────────────────────────────────
    const handleApprove = async (ids: string[]) => {
        if (!ids.length) { message.warning('Chưa chọn yêu cầu nào'); return }
        setActionLoading(true)
        try {
            await apiApproveByIds(ids)
            message.success(`Đã phê duyệt ${ids.length} yêu cầu`)
            setSelectedIds({})
            refresh()
        } catch (err: any) {
            message.error(err.message || 'Phê duyệt thất bại')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (ids: string[]) => {
        if (!ids.length) { message.warning('Chưa chọn yêu cầu nào'); return }
        setActionLoading(true)
        try {
            await apiRejectByIds(ids)
            message.success(`Đã từ chối ${ids.length} yêu cầu`)
            setSelectedIds({})
            refresh()
        } catch (err: any) {
            message.error(err.message || 'Từ chối thất bại')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async (requestId: string) => {
        setDeleteLoading(true)
        try {
            await apiDeleteRequest(requestId)
            message.success('Xóa yêu cầu thành công')
            setSelectedRequest(null)
            refresh()
        } catch (err: any) {
            message.error(err.message || 'Xóa yêu cầu thất bại')
        } finally {
            setDeleteLoading(false)
        }
    }

    // ── Inner table columns ───────────────────────────────────────────────────
    const buildInnerColumns = (_batch: BatchGroup): TableProps<RequestItemDto>['columns'] => [
        {
            title: '',
            key: 'select',
            width: 40,
            render: (_, r) => {
                if (r.status !== 'PENDING') return null
                return (
                    <input
                        type="checkbox"
                        checked={!!selectedIds[r.requestId]}
                        onChange={e => toggleSelectRow(r.requestId, e.target.checked)}
                        onClick={e => e.stopPropagation()}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                )
            }
        },
        {
            title: 'Thiết bị',
            key: 'device',
            width: '25%',
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
            title: 'Khách hàng',
            key: 'customer',
            width: '25%',
            render: (_, r) => (
                <Space orientation="vertical" size={0}>
                    <Text strong style={{ fontSize: 13 }}>{r.customer?.user.username ?? '—'}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{r.customer?.user.email ?? ''}</Text>
                </Space>
            )
        },
        {
            title: 'Thời gian',
            key: 'time',
            align: 'center',
            width: 130,
            render: (_, r) => {
                const d = new Date(r.createdAt)
                return (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {d.toLocaleDateString('vi-VN')},{' '}
                        {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                )
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            align: 'center',
            width: 140,
            render: (_, r) => {
                const cfg = STATUS_CONFIG[r.status]
                return <div className={`request-status-badge ${cfg.className}`}>{cfg.label}</div>
            }
        },
        {
            title: '',
            key: 'actions',
            align: 'center',
            render: (_, r) => (
                <Space onClick={e => e.stopPropagation()}>
                    {r.status === 'PENDING' && (
                        <>
                            <Button
                                size="small"
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                loading={actionLoading}
                                onClick={() => handleApprove([r.requestId])}
                            >
                                Duyệt
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<CloseCircleOutlined />}
                                loading={actionLoading}
                                onClick={() => handleReject([r.requestId])}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    {r.status !== 'PENDING' && (
                        <Popconfirm
                            title="Xóa yêu cầu này?"
                            description="Hành động không thể hoàn tác."
                            onConfirm={() => handleDelete(r.requestId)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                        >
                            <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                loading={deleteLoading}
                            />
                        </Popconfirm>
                    )}
                </Space>
            )
        },
    ]

    const fmt = (n: number) => n === 0 ? '00' : n < 10 ? `0${n}` : `${n}`

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <section className="admin-page" aria-labelledby="request-mgmt-title">
            <div className="admin-heading">
                <div className="admin-heading-left">
                    <Title id="request-mgmt-title" level={1} className="admin-title">
                        Phê Duyệt Yêu Cầu
                    </Title>
                </div>

                {/* Global bulk actions */}
                {allSelectedIds.length > 0 && (
                    <Space>
                        <Text type="secondary">{allSelectedIds.length} đã chọn</Text>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            loading={actionLoading}
                            onClick={() => handleApprove(allSelectedIds)}
                        >
                            Duyệt tất cả
                        </Button>
                        <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            loading={actionLoading}
                            onClick={() => handleReject(allSelectedIds)}
                        >
                            Từ chối tất cả
                        </Button>
                    </Space>
                )}
            </div>

            {/* ── Summary cards ── */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                {[
                    { icon: <ProfileOutlined />, label: 'Tổng yêu cầu', value: totalAll, cls: 'summary-total' },
                    { icon: <CheckCircleOutlined />, label: 'Đã xử lý', value: totalDone, cls: 'summary-approved' },
                    { icon: <ClockCircleOutlined />, label: 'Đang xử lý', value: totalPending, cls: 'summary-pending' },
                ].map(card => (
                    <div
                        key={card.label}
                        className={`request-summary-card ant-card ${card.cls}`}
                        style={{ flex: '1 1 180px', borderRadius: 12, border: '1px solid #e1e9ee', padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 14px rgba(30,50,62,.05)' }}
                    >
                        <div className="request-summary-icon">{card.icon}</div>
                        <div className="request-summary-info">
                            <Text>{card.label}</Text>
                            <Title level={2}>{fmt(card.value)}</Title>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Batch list ── */}
            <div className="request-list-container">
                <div className="request-list-header">
                    <h3>
                        Danh sách yêu cầu
                        {!loading && (
                            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
                                ({pagination.total} yêu cầu — trang {pagination.page}/{pagination.totalPages})
                            </Text>
                        )}
                    </h3>
                    <div className="request-filter-tabs">
                        <Segmented
                            value={filter}
                            onChange={val => handleFilterChange(val as string)}
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
                            items={batches.map(batch => {
                                const typeColor = TYPE_COLOR[batch.requestType] ?? 'default'
                                const typeLabel = TYPE_LABEL[batch.requestType] ?? batch.requestType
                                const pendingCnt = pendingIdsInBatch(batch).length
                                const selCount = selectedCountInBatch(batch)

                                const batchStatusLabel =
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
                                                {batchStatusLabel}
                                            </div>
                                        </div>
                                    ),
                                    children: (
                                        <div>
                                            {/* Per-batch bulk toolbar */}
                                            {pendingCnt > 0 && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelectedInBatch(batch)}
                                                        onChange={e => toggleSelectBatch(batch, e.target.checked)}
                                                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                                                        title="Chọn tất cả trong batch"
                                                    />
                                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                                        {selCount > 0 ? `${selCount} / ${pendingCnt} đã chọn` : `Chọn tất cả (${pendingCnt})`}
                                                    </Text>
                                                    {selCount > 0 && (
                                                        <Space>
                                                            <Button
                                                                size="small"
                                                                type="primary"
                                                                icon={<CheckCircleOutlined />}
                                                                loading={actionLoading}
                                                                onClick={() => {
                                                                    const ids = batch.items
                                                                        .filter(r => r.status === 'PENDING' && selectedIds[r.requestId])
                                                                        .map(r => r.requestId)
                                                                    handleApprove(ids)
                                                                }}
                                                            >
                                                                Duyệt đã chọn
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                danger
                                                                icon={<CloseCircleOutlined />}
                                                                loading={actionLoading}
                                                                onClick={() => {
                                                                    const ids = batch.items
                                                                        .filter(r => r.status === 'PENDING' && selectedIds[r.requestId])
                                                                        .map(r => r.requestId)
                                                                    handleReject(ids)
                                                                }}
                                                            >
                                                                Từ chối đã chọn
                                                            </Button>
                                                        </Space>
                                                    )}
                                                </div>
                                            )}

                                            <Table<RequestItemDto>
                                                columns={buildInnerColumns(batch)}
                                                dataSource={batch.items}
                                                rowKey="requestId"
                                                pagination={false}
                                                size="small"
                                                rowClassName={r =>
                                                    r.status === 'PENDING' && selectedIds[r.requestId]
                                                        ? 'ant-table-row-selected'
                                                        : ''
                                                }
                                                onRow={r => ({
                                                    onClick: () => setSelectedRequest(r),
                                                    style: { cursor: 'pointer' },
                                                })}
                                            />
                                        </div>
                                    )
                                }
                            })}
                        />

                        {/* ── Server-side Pagination ── */}
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

            <RequestDetailModal
                visible={!!selectedRequest}
                request={selectedRequest}
                onClose={() => setSelectedRequest(null)}
                onDelete={handleDelete}
                deleteLoading={deleteLoading}
            />
        </section>
    )
}