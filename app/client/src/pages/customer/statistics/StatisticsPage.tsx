import { useEffect, useState } from 'react'
import { Button, Typography, message } from 'antd'
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { FilterBar } from './components/FilterBar'
import type { SensorFilterType } from './components/FilterBar'
import { ReportDisplay } from './components/ReportDisplay'
import { ReportDetailModal } from './components/ReportDetailModal'
import { ReportList } from './components/ReportList'
import { apiGetLocations, type LocationDTO } from '../../../lib/locationApi'
import { apiGetMyDevices, type DeviceInfo } from '../../../lib/deviceApi'
import { apiGenerateReport, apiGetReports, apiGetReportDetail, type Report, type ReportType } from '../../../lib/analyticsApi'
import '../CustomerPages.css'
import './StatisticsPage.css'

const { Text, Title } = Typography

export function StatisticsPage() {
    const [timePeriod, setTimePeriod] = useState<'today' | 'week' | 'month'>('today')
    const [filterType, setFilterType] = useState<SensorFilterType>('ALL')
    const [selectedRoom, setSelectedRoom] = useState<string>('ALL')
    const [selectedDevice, setSelectedDevice] = useState<string>('ALL')
    const [reportSensorsFilter, setReportSensorsFilter] = useState<string[] | null>(null)
  
    // Data lists
    const [locations, setLocations] = useState<LocationDTO[]>([])
    const [devices, setDevices] = useState<DeviceInfo[]>([])
    const [reportsList, setReportsList] = useState<Report[]>([])
    
    // Loading, Selection & Modal states
    const [loading, setLoading] = useState<boolean>(false)
    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [exporting, setExporting] = useState<boolean>(false)

    // Fetch initial data: rooms, devices, reports
    async function initData() {
        setLoading(true)
        try {
            const [locs, devs, reports] = await Promise.all([
                apiGetLocations(),
                apiGetMyDevices(),
                apiGetReports()
            ])
            setLocations(locs)

            // Only keep SENSOR devices
            const sensors = devs.filter((d) => d.deviceType === 'SENSOR')
            setDevices(sensors)

            // Sort reports by createdAt descending
            const sortedReports = reports.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setReportsList(sortedReports)
        } catch (error: any) {
            message.error(error.message ?? 'Lỗi tải dữ liệu ban đầu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initData()
    }, [])


    const handleCreateReport = async (values: any) => {
        setLoading(true)
        try {
            const reportType: ReportType = values.reportType
            const targetTime = values.targetDate ? values.targetDate.toISOString() : new Date().toISOString()

            // Generate report
            const newReport = await apiGenerateReport({
                reportType,
                targetTime,
                sensorIds: values.sensors && values.sensors.length > 0 ? values.sensors : undefined
            })

            message.success('Tạo báo cáo thống kê thành công!')
            setModalVisible(false)
            
            // Set filter to only display selected sensors in report details
            setReportSensorsFilter(values.sensors || null)

            // Refresh reports list
            const updatedReports = await apiGetReports()
            const sorted = updatedReports.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            setReportsList(sorted)

            // Auto-select the newly generated report
            setSelectedReport(newReport)
        } catch (error: any) {
            message.error(error.message ?? 'Lỗi khi tạo báo cáo thống kê')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectReport = async (reportId: string) => {
        setLoading(true)
        try {
            const detail = await apiGetReportDetail(reportId)
            setSelectedReport(detail)
            setReportSensorsFilter(null)
        } catch (error: any) {
            message.error(error.message ?? 'Lỗi tải thông tin chi tiết báo cáo')
        } finally {
            setLoading(false)
        }
    }

    const handleExport = () => {
        if (!selectedReport) return

        setExporting(true)
        try {
            // Group metrics by sensor
            const summaryData = selectedReport.summaryData ?? []
            const sensorDataGroups = summaryData.reduce((acc, item) => {
                if (!acc[item.sensorId]) { acc[item.sensorId] = [] }
                acc[item.sensorId].push(item)
                return acc
            }, {} as Record<string, typeof summaryData>)

            // UTF-8 BOM to ensure Excel opens Vietnamese characters correctly
            let csvContent = '\uFEFF'
            csvContent += 'Mã báo cáo,Loại báo cáo,Thời gian bắt đầu,Thời gian kết thúc\n'
            csvContent += `"${selectedReport.reportId}","${selectedReport.reportType}","${dayjs(selectedReport.startTime).format('DD/MM/YYYY HH:mm')}","${dayjs(selectedReport.endTime).format('DD/MM/YYYY HH:mm')}"\n\n`
            
            csvContent += 'Mã cảm biến,Tên cảm biến,Vị trí,Chỉ số theo dõi,Thấp nhất,Trung bình,Cao nhất\n'

            Object.entries(sensorDataGroups).forEach(([sensorId, metrics]) => {
                const device = devices.find((d) => d.deviceId === sensorId)
                const sensorName = device?.deviceName ?? `Cảm biến (${sensorId.slice(0, 6)})`
                const roomName = device?.location ?? 'Chưa gán vị trí'

                const metricsByType = metrics.reduce((acc, m) => {
                    let type = ''
                    if (m.metricName.startsWith('TEMPERATURE')) type = 'TEMPERATURE'
                    else if (m.metricName.startsWith('HUMIDITY')) type = 'HUMIDITY'
                    else if (m.metricName.startsWith('GAS')) type = 'GAS'

                    if (type) {
                        if (!acc[type]) acc[type] = {}
                        if (m.metricName.endsWith('_MIN')) acc[type].min = m.value
                        if (m.metricName.endsWith('_MAX')) acc[type].max = m.value
                        if (m.metricName.endsWith('_AVG')) acc[type].avg = m.value
                    }
                    return acc
                }, {} as Record<string, { min?: number; max?: number; avg?: number }>)

                Object.entries(metricsByType).forEach(([type, stats]) => {
                    const metricLabel = type === 'TEMPERATURE' ? 'Nhiệt độ' : type === 'HUMIDITY' ? 'Độ ẩm' : type === 'GAS' ? 'Nồng độ Gas' : type
                    const minVal = stats.min !== undefined ? stats.min.toFixed(1) : 'N/A'
                    const avgVal = stats.avg !== undefined ? stats.avg.toFixed(1) : 'N/A'
                    const maxVal = stats.max !== undefined ? stats.max.toFixed(1) : 'N/A'

                    csvContent += `"${sensorId}","${sensorName}","${roomName}","${metricLabel}",${minVal},${avgVal},${maxVal}\n`
                })
            })

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `BaoCaoThongKe_${selectedReport.reportId.slice(0, 8)}_${dayjs().format('YYYYMMDD')}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            message.success('Đã xuất và tải xuống báo cáo CSV thành công!')
        } catch (error: any) {
            message.error('Lỗi khi xuất file báo cáo')
            console.error(error)
        } finally {
            setExporting(false)
        }
    }

    // Filter reports based on when they were created (createdAt)
    const filteredReports = reportsList.filter((r) => {
        const createdDate = dayjs(r.createdAt)
        const now = dayjs()

        if (timePeriod === 'today') {
            return createdDate.isSame(now, 'day')
        }
        if (timePeriod === 'week') {
            return createdDate.isSame(now, 'week')
        }
        if (timePeriod === 'month') {
            return createdDate.isSame(now, 'month')
        }
        return true
    })

    // Room options for the filter dropdown
    const roomOptions = locations.map((loc) => ({
        value: loc.locationId,
        label: loc.locationName
    }))

    // Device options based on currently selected room
    const deviceOptions = devices
        .filter((d) => selectedRoom === 'ALL' || d.locationId === selectedRoom)
        .map((d) => ({
            value: d.deviceId,
            label: `${d.deviceName} (${d.location ?? 'Chưa gán vị trí'})`
        }))

    const handleRoomChange = (roomId: string) => {
        setSelectedRoom(roomId)
        setSelectedDevice('ALL')
    }

    return (
        <section className="customer-page statistics-dark-theme" aria-labelledby="statistics-title">
            {/* Header controls with Create Report Button */}
            <div className="statistics-header">
                <div className="statistics-title-section">
                    <Title id="statistics-title" level={1} className="customer-title">
                        Báo cáo thống kê
                    </Title>
                    <Text className="statistics-subtitle">
                        Theo dõi các chỉ số môi trường trong ngôi nhà của bạn
                    </Text>
                </div>

                <div className="statistics-header-controls">
                    {selectedReport ? (
                        <>
                            <Button 
                                onClick={() => setSelectedReport(null)}
                                size='large'
                            >
                                Quay lại danh sách
                            </Button>
                            <span className="control-separator">|</span>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                size='large'
                                loading={exporting}
                                onClick={handleExport}
                                style={{ fontSize: 15, fontWeight: 600, background: '#0b5f95', borderColor: '#0b5f95' }}
                            >
                                Xuất file
                            </Button>
                        </>
                    ) : (
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            size="large"
                            onClick={() => setModalVisible(true)}
                            style={{ fontSize: 15, fontWeight: 600, background: '#0b5f95', borderColor: '#0b5f95' }}
                        >
                            Tạo báo cáo
                        </Button>
                    )}
                </div>
            </div>

            {/* Table of created reports (Preview panel) OR Detailed display section */}
            {!selectedReport ? (
                <ReportList
                    reports={filteredReports}
                    loading={loading}
                    timePeriod={timePeriod}
                    onTimePeriodChange={setTimePeriod}
                    onSelectReport={handleSelectReport}
                />
            ) : (
                <>
                    {/* Filter component only for Details view */}
                    <FilterBar
                        filterType={filterType}
                        onFilterTypeChange={setFilterType}
                        selectedRoom={selectedRoom}
                        onRoomChange={handleRoomChange}
                        rooms={roomOptions}
                        devices={deviceOptions}
                        selectedDevice={selectedDevice}
                        onDeviceChange={setSelectedDevice}
                    />

                    <div style={{  }}>
                        <ReportDisplay
                            report={selectedReport}
                            devices={devices}
                            filterType={filterType}
                            selectedRoom={selectedRoom}
                            selectedDevice={selectedDevice}
                            allowedSensors={reportSensorsFilter}
                        />
                    </div>
                </>
            )}

            <ReportDetailModal
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSubmit={handleCreateReport}
                devices={devices}
                loading={loading}
            />
        </section>
    )
}