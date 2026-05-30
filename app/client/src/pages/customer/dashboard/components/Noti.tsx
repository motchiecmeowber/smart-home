import { useEffect, useState } from "react";
import { apiGetNotis, type NotiDTO } from "../../../../lib/notiApi";
import { Badge, Card, Spin } from "antd";
import { BellOutlined, WarningOutlined, CheckCircleOutlined, InfoCircleOutlined, RightOutlined } from "@ant-design/icons";

export function Notification() {
    const [notis, setNotis] = useState<NotiDTO[]>([])
    const [loading, setLoading] = useState(true)
    const navigate = (path: string) => {
        window.history.pushState(null, '', path)
        window.dispatchEvent(new Event('popstate'))
    }

    const getTone = (title: string) => {
        const t = title.toLowerCase()
        if (t.includes('cảnh báo') || t.includes('vượt ngưỡng') || t.includes('nguy hiểm')) return 'warning'
        if (t.includes('thành công') || t.includes('chấp nhận')) return 'success'
        return 'info'
    }

    useEffect(() => {
        apiGetNotis()
            .then(data => {
                setNotis(data.slice(0, 3)); // Get 3 newest noti
            })
            .finally(() => setLoading(false));
    }, []);

    const unreadCount = notis.filter(n => !n.isRead).length;

    return (
        <Card 
            className="dashboard-card" 
            variant="borderless" 
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Badge count={unreadCount} size="small" offset={[2, 0]}>
                        <BellOutlined style={{ color: '#faad14', fontSize: 18 }} />
                    </Badge>
                    <span style={{ marginLeft: 4 }}>Thông Báo</span>
                </div>
            }
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
            ) : (
                <div className="notification-list">
                    {notis.map(noti => {
                        const tone = getTone(noti.title);
                        return (
                            <div key={noti.notiId} className={`notification-item ${tone}`}>
                                <div className={`notification-icon ${tone}`}>
                                    {tone === 'warning' ? <WarningOutlined /> : 
                                     tone === 'success' ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
                                </div>
                                <div className="notification-content">
                                    <span className="notification-title">{noti.title}</span>
                                    <span className="notification-time">
                                        {new Date(noti.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="dashboard-card-link" onClick={() => navigate('/notifications')}>
                Xem tất cả <RightOutlined style={{ fontSize: 12, marginTop: 2 }} />
            </div>
        </Card>
    );
}