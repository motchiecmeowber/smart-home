import { useEffect, useState } from "react";
import { Card, Spin } from "antd";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons";
import { apiGetSchedules, type ScheduleDTO } from "../../../../lib/scheduleApi";

export function Schedule() {
    const [schedules, setSchedules] = useState<ScheduleDTO[]>([]);
    const [loading, setLoading] = useState(true);

    const navigate = (path: string) => {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('popstate'));
    };

    useEffect(() => {
        apiGetSchedules()
            .then(data => {
                setSchedules(data.slice(0, 3));
            })
            .finally(() => setLoading(false));
    }, []);

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '--:--';
        try {
            return new Date(timeStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return timeStr;
        }
    };

    return (
        <Card 
            className="dashboard-card" 
            variant="borderless" 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarOutlined style={{ color: '#1890ff' }} />
                    <span>Lịch Trình Sắp Tới</span>
                </div>
            }
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
            ) : schedules.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8c8c8c', padding: 20 }}>
                    Không có lịch trình nào sắp tới
                </div>
            ) : (
                <div className="schedule-list">
                    {schedules.map(schedule => (
                        <div key={schedule.scheduleId} className="schedule-item">
                            <div className="schedule-info-wrapper">
                                <div className="schedule-dot active"></div>
                                <div className="schedule-content">
                                    <div className="schedule-time-row">
                                        <span className="schedule-time">{formatTime(schedule.startTime)}</span>
                                    </div>
                                    <span className="schedule-title">
                                        {schedule.action === 'ON' ? 'Bật thiết bị' : 'Tắt thiết bị'}
                                    </span>
                                    <div className="schedule-desc">
                                        Chu kỳ: {schedule.frequency || 'Một lần'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="dashboard-card-link" onClick={() => navigate('/schedules')}>
                Cài đặt lịch <RightOutlined style={{ fontSize: 12, marginTop: 2 }} />
            </div>
        </Card>
    );
}