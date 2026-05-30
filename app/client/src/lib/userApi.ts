/**
 * HTTP client for the /api/users endpoints.
 */

import type { UserDto } from './authApi'
import { authStore } from './authStore'

const BASE = import.meta.env.VITE_API_URL

export interface UserDetailInfo extends UserDto {
    firstName?: string;
    lastName?: string;
    emailNotification?: boolean;
}

export async function apiGetUsers(): Promise<UserDto[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    return json.data || []
}

export async function apiGetUserDetail(userId: string): Promise<UserDetailInfo> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/users/${userId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    return json.data
}

export async function apiDeleteUser(userId: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Không thể xóa người dùng này`)
    }

    return json.data
}

export async function apiGetProfile(): Promise<UserDetailInfo> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/profile`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `HTTP Error ${res.status}`)
    }

    return json.data
}

export async function apiUpdateProfile(updates: { firstName?: string; lastName?: string; emailNotification?: boolean }): Promise<UserDetailInfo> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/profile`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi cập nhật hồ sơ cá nhân (${res.status})`)
    }

    return json.data
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi thay đổi mật khẩu (${res.status})`)
    }
}