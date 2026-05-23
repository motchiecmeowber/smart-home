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
    customer: {
        username: string
        email: string
    }
    device?: {
        deviceName: string
        deviceId: string
        deviceType: 'SENSOR' | 'ACTUATOR'
    } | null
    admin?: {
        username: string
        email: string
    } | null
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