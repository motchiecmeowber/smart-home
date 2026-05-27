import { authStore } from "./authStore";

const BASE = import.meta.env.VITE_API_URL

export interface LocationDTO {
    locationId: string
    locationName: string
    customerId?: string
}

export async function apiCreateLocation(locationName: string): Promise<LocationDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/locations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ locationName })
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo địa điểm mới (${res.status})`)
    }

    return json.data
}

export async function apiGetLocations(): Promise<LocationDTO[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/locations`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error (json.message ?? `Lỗi lấy danh sách địa điểm (${res.status})`)
    }

    return json.data ?? []
}

export async function apiGetLocationDetail(locationId: string): Promise<LocationDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/locations/${locationId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error (json.message ?? `Lỗi lấy thông tin địa điểm (${res.status})`)
    }

    return json.data
}

export async function apiUpdateLocation(locationId: string, locationName: string): Promise<LocationDTO> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/locations/${locationId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ locationName })
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi cập nhật địa điểm (${res.status})`)
    }

    return json.data
}

export async function apiDeleteLocation(locationId: string): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/locations/${locationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error (json.message ?? `Lỗi xóa địa điểm (${res.status})`)
    }
}