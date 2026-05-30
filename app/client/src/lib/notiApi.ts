import { authStore } from "./authStore";

const BASE = import.meta.env.VITE_API_URL

export interface NotiDTO {
    notiId: string
    title: string
    content: string
    isRead: boolean
    createdAt: string
    userId: string
    deviceId: string
}

export async function apiGetNotis(): Promise<NotiDTO[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/notifications`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi lấy danh sách thông báo ${res.status}`)
    }

    return json.data || []
}

export async function apiReadNoti(notiId: string): Promise<NotiDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/notifications/${notiId}/read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isRead: true })
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi đánh dấu đã đọc thông báo ${res.status}`)
    }

    return json.data
}