/**
 * HTTP client for the /api/requests endpoints.
 */

import { authStore } from './authStore'

const BASE = import.meta.env.VITE_API_URL

export interface RequestItemDto {
    requestId: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
    customerId?: string | null
    adminId?: string | null
    requestType?: 'ADD' | 'UPDATE' | 'DELETE'
    note?: string | null
    batchId?: string | null
    content?: string | null
    customer?: {
        user: {
            username: string
            email: string
        }
    } | null
    device?: {
        deviceName: string
        deviceId: string
        tbDeviceId?: string | null
        deviceType: 'SENSOR' | 'ACTUATOR'
    } | null
    admin?: {
        username: string
        user: {
            username: string
            email: string
        }
    } | null
}

export interface PaginationMeta {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
}

export interface PaginatedRequestsResponse {
    data: RequestItemDto[]
    pagination: PaginationMeta
}

export interface GetRequestsParams {
    page?: number
    pageSize?: number
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
    type?: 'ADD' | 'UPDATE' | 'DELETE'
}


export interface RequestAddPayload {
    deviceId?: string
    deviceName: string
    deviceType: 'SENSOR' | 'ACTUATOR'
    locationId: string
    unit?: string
    threshold?: number
    note?: string
}

export interface RequestUpdatePayload {
    content?: string
    note?: string
}

export interface CreateRequestPayload {
    title: string
    requestType: 'ADD' | 'UPDATE' | 'DELETE'
    serial_list: string[]
    content?: string
}

export async function apiGetRequests(params?: GetRequestsParams): Promise<PaginatedRequestsResponse> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.pageSize) query.set('pageSize', String(params.pageSize))
    if (params?.status) query.set('status', params.status)
    if (params?.type) query.set('type', params.type)

    const url = query.toString() ? `${BASE}/requests?${query}` : `${BASE}/requests`

    const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    // Server wraps response as { data: { data: [...], pagination: {...} } }
    const payload = json.data ?? json
    return {
        data: Array.isArray(payload.data) ? payload.data : (Array.isArray(payload) ? payload : []),
        pagination: payload.pagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 1, hasNextPage: false, hasPrevPage: false }
    }
}

export async function apiGetRequestDetail(requestId: string): Promise<RequestItemDto> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/requests/${requestId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    return json.data
}

export async function apiUpdateRequest(
    requestId: string,
    status: 'APPROVED' | 'REJECTED'
): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Cập nhật trạng thái yêu cầu thất bại`)
    }
}

export async function apiDeleteRequest(requestId: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/requests/${requestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Xóa yêu cầu thất bại`)
    }
}

// ------------ ADMIN BULK ACTIONS -----------------------
export async function apiApproveByIds(list_id: string[]): Promise<void> {
    const token = authStore.getToken()
    if (!token) throw new Error('Yêu cầu xác thực tài khoản')

    const res = await fetch(`${BASE}/requests/approve-by-ids`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ list_id })
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message ?? `Phê duyệt yêu cầu thất bại (${res.status})`)
}

export async function apiRejectByIds(list_id: string[]): Promise<void> {
    const token = authStore.getToken()
    if (!token) throw new Error('Yêu cầu xác thực tài khoản')

    const res = await fetch(`${BASE}/requests/reject-by-ids`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ list_id })
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.message ?? `Từ chối yêu cầu thất bại (${res.status})`)
}

// ------------ CUSTOMER -----------------------
export async function apiCreateRequest(payload: CreateRequestPayload): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/requests/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo yêu cầu (${res.status})`)
    }
}

export async function apiRequestAdd(payload: RequestAddPayload): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/devices/request-add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo yêu cầu thêm thiết bị (${res.status})`)
    }
}

export async function apiRequestUpdate(deviceId: string, payload: RequestUpdatePayload): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/devices/${deviceId}/request-update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo yêu cầu cập nhật thiết bị (${res.status})`)
    }
}

export async function apiRequestDelete(deviceId: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/devices/${deviceId}/request-delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo yêu cầu xóa thiết bị (${res.status})`)
    }
}