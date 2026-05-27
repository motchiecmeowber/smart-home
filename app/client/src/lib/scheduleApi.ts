import { authStore } from "./authStore";

const BASE = import.meta.env.VITE_API_URL

export interface ScheduleDTO {
    scheduleId: string
    duration?: number
    action?: 'ON' | 'OFF'
    frequency?: 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM'
    startTime?: string
    customerId: string
    actuatorId: string
}

export async function apiCreateSchedule(info: Omit<ScheduleDTO, 'scheduleId'>): Promise<ScheduleDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/schedules`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(info)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo lịch trình mới (${res.status})`)
    }

    return json.data
}

export async function apiGetSchedules(): Promise<ScheduleDTO[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/schedules`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi lấy danh sách lịch trình (${res.status})`)
    }

    return json.data || []
}

export async function apiGetScheduleDetail(scheduleId: string): Promise<ScheduleDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/schedules/${scheduleId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi lấy chi tiết lịch trình (${res.status})`)
    }

    return json.data
}

export async function apiUpdateSchedule(updates: Partial<ScheduleDTO> & { scheduleId: string }): Promise<ScheduleDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/schedules/${updates.scheduleId}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi cập nhật lịch trình (${res.status})`)
    }

    return json.data
}

export async function apiDeleteSchedule(scheduleId: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi xóa lịch trình (${res.status})`)
    }
}