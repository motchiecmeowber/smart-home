/**
 * HTTP client for the /api/requests endpoints.
 */

import { authStore } from './authStore'

const BASE = import.meta.env.VITE_API_URL

export interface RequestItemDto {
    requestId: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    createdAt: string
    customerId: string
    adminId?: string | null
    requestType?: 'ADD' | 'UPDATE' | 'DELETE'
    note?: string | null
    customer: {
        username: string
        email: string
    }
    device?: {
        deviceName: string
        deviceId: string
        tbDeviceId?: string | null
        deviceType: 'SENSOR' | 'ACTUATOR'
    } | null
    admin?: {
        username: string
        email: string
    } | null
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

export async function apiGetRequests(): Promise<RequestItemDto[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/requests`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    return json.data || []
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

// ------------ CUSTOMER -----------------------
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