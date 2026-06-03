import { useEffect, useState } from 'react'
import { Spin, Typography, message } from 'antd'
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts'
import dayjs from 'dayjs'
import { apiGetChartData, type ChartDataPoint } from '../../../../lib/analyticsApi'

const { Text } = Typography

interface SensorChartProps {
    sensorId: string
    startTime: string
    endTime: string
    metricType: string
}

export function SensorChart({ sensorId, startTime, endTime, metricType }: SensorChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        let isMounted = true
        async function fetchChartData() {
            setLoading(true)
            try {
                // Request 30 data points (buckets) for a smooth chart
                const res = await apiGetChartData(sensorId, startTime, endTime, 30)
                if (isMounted) {
                    setData(res.points)
                }
            } catch (error: any) {
                if (isMounted) {
                    message.error(error.message || 'Lỗi tải dữ liệu biểu đồ')
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        
        fetchChartData()

        return () => {
            isMounted = false
        }
    }, [sensorId, startTime, endTime])

    if (loading) {
        return (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin tip="Đang tải dữ liệu biểu đồ..." />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">Không đủ dữ liệu để vẽ biểu đồ trong khoảng thời gian này.</Text>
            </div>
        )
    }

    // Determine colors based on metric type
    let strokeColor = '#0b5f95' // default blue
    let unit = ''

    if (metricType.includes('TEMPERATURE')) {
        strokeColor = '#fa8c16'
        unit = '°C'
    } else if (metricType.includes('HUMIDITY')) {
        strokeColor = '#177ddc'
        unit = '%'
    } else if (metricType.includes('GAS')) {
        strokeColor = '#52c41a'
        unit = '%'
    }

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ 
                    background: '#fff', 
                    padding: '8px 12px', 
                    border: '1px solid #e1e9ee', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <Text style={{ display: 'block', color: '#8c8c8c', marginBottom: 4, fontSize: 12 }}>
                        {dayjs(label).format('DD/MM/YYYY HH:mm')}
                    </Text>
                    <Text style={{ fontWeight: 700, color: strokeColor }}>
                        {payload[0].value} {unit}
                    </Text>
                </div>
            )
        }
        return null
    }

    // Format X-axis tick
    const formatXAxis = (tickItem: string) => {
        // If data spans multiple days, show Date. If same day, show Time.
        const start = dayjs(startTime)
        const end = dayjs(endTime)
        if (end.diff(start, 'day') >= 1) {
            return dayjs(tickItem).format('DD/MM')
        }
        return dayjs(tickItem).format('HH:mm')
    }

    return (
        <div style={{ height: 250, width: '100%', marginTop: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id={`color${sensorId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="timestamp" 
                        tickFormatter={formatXAxis} 
                        tick={{ fill: '#8c8c8c', fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <YAxis 
                        tick={{ fill: '#8c8c8c', fontSize: 12 }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={strokeColor} 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill={`url(#color${sensorId})`} 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
