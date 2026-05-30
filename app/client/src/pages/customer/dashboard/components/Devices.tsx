import { Card } from "antd";
import { useUserDevices } from "../../../../hooks/useUserDevices";
import { DesktopOutlined, RightOutlined } from "@ant-design/icons";

export function Devices() {
    const { devices } = useUserDevices()
    const navigate = (path: string) => {
        window.history.pushState(null, '', path)
        window.dispatchEvent(new Event('popstate'))
    }

    const onlineCount = devices.filter(d => d.status === 'ONLINE').length
    const offlineCount = devices.filter(d => d.status === 'OFFLINE' || d.status === 'DISCONNECTED').length

    return (
        <Card className="dashboard-card" variant="borderless" title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DesktopOutlined style={{ color: '#1890FF' }} />

                <span>Thiết Bị</span>
            </div>
        }>
            <div className="device-stat-list">
                <div className="device-stat-row">
                    <span className="device-stat-label">Đang hoạt động</span>
                    <span className="device-stat-value online">{onlineCount}</span>
                </div>

                <div className="device-stat-row">
                    <span className="device-stat-label">Ngoại tuyến</span>
                    <span className="device-stat-value offline">{offlineCount}</span>
                </div>
            </div>

            <div className="dashboard-card-link" onClick={() => navigate('/devices')}>
                Quản lý thiết bị <RightOutlined style={{ fontSize: 12, marginTop: 2 }} />
            </div>
        </Card>
    )
}