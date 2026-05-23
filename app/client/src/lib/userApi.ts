/**
 * HTTP client for the /api/users endpoints.
 */

import type { UserDto } from './authApi'
import { authStore } from './authStore'

const BASE = import.meta.env.VITE_API_URL

export interface UserDetailInfo extends UserDto {
    firstName?: string;
    lastName?: string;
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