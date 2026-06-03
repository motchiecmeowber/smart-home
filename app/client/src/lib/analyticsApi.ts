import { authStore } from "./authStore";

const BASE = import.meta.env.VITE_API_URL

export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'

export interface SummaryData {
    metricName: string
    reportId: string
    sensorId: string
    value: number
}

export interface Report {
    reportId: string
    reportType: ReportType
    createdAt: string
    startTime: string
    endTime: string
    targetDate?: string
    customerId: string
    summaryData?: SummaryData[]
}

export interface ChartDataPoint {
    timestamp: string
    value: number
}

export interface ChartDataResponse {
    sensorId: string
    metricName: string
    points: ChartDataPoint[]
}

export async function apiGenerateReport(data: {
    reportType: ReportType
    targetTime?: string
    startTime?: string
    endTime?: string
    sensorIds?: string[]
}): Promise<Report> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/generate-report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message ?? `Lỗi tạo báo cáo (${res.status})`)
    }

    return json.data
}

export async function apiGetReports(filters?: {
    reportType?: ReportType
    startDate?: string
    endDate?: string
}): Promise<Report[]> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const params = new URLSearchParams()
    if (filters?.reportType) params.append('reportType', filters.reportType)
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)

    const queryStr = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${BASE}/reports${queryStr}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message || `Lỗi lấy danh sách báo cáo (${res.status})`)
    }

    return json.data || []
}

export async function apiGetReportDetail(id: string): Promise<Report> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const res = await fetch(`${BASE}/reports/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`}
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message || `Lỗi lấy danh sách báo cáo (${res.status})`)
    }

    return json.data
}

export async function apiGetChartData(
    sensorId: string,
    startTime: string,
    endTime: string,
    bucketTimes?: number
): Promise<ChartDataResponse> {
    const token = authStore.getToken()
    if (!token) {
        throw new Error('Yêu cầu xác thực tài khoản')
    }

    const params = new URLSearchParams()
    params.append('sensorId', sensorId)
    params.append('startTime', startTime)
    params.append('endTime', endTime)
    
    if (bucketTimes) {
        params.append('bucketTimes', bucketTimes.toString())
    }

    const queryStr = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${BASE}/chart-data${queryStr}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        throw new Error(json.message || `Lỗi lấy dữ liệu biểu đồ (${res.status})`)
    }

    return json.data
}