import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import { ProfileOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { apiGetRequests } from "../../../../lib/requestApi";

export function Request() {
    const [totalAll, setTotalAll] = useState(0);
    const [totalDone, setTotalDone] = useState(0);
    const [totalPending, setTotalPending] = useState(0);

    const navigate = (path: string) => {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new Event('popstate'));
    };

    useEffect(() => {
        Promise.all([
            apiGetRequests({ page: 1, pageSize: 1 }),
            apiGetRequests({ page: 1, pageSize: 1, status: 'APPROVED' }),
            apiGetRequests({ page: 1, pageSize: 1, status: 'REJECTED' }),
            apiGetRequests({ page: 1, pageSize: 1, status: 'PENDING' })
        ])
        .then(([all, approved, rejected, pending]) => {
            setTotalAll(all.pagination.total);
            setTotalDone(approved.pagination.total + rejected.pagination.total);
            setTotalPending(pending.pagination.total);
        })
        .catch(() => {});
    }, []);

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="dashboard-section-title" style={{ marginBottom: 0 }}>Tổng Quan Yêu Cầu Hỗ Trợ</div>
                <span 
                    className="ant-card-extra" 
                    style={{ fontSize: 14, cursor: 'pointer', color: '#1890ff', fontWeight: 500 }} 
                    onClick={() => navigate('/requests')}
                >
                    Xem chi tiết tất cả yêu cầu
                </span>
            </div>
            
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <div className="request-stat-card">
                        <div className="request-stat-header">
                            <span style={{ textTransform: 'uppercase' }}>Tổng yêu cầu</span>
                            <ProfileOutlined className="request-stat-icon" style={{ color: '#1890ff' }} />
                        </div>
                        <h2 className="request-stat-value">{totalAll.toString().padStart(2, '0')}</h2>
                        <span className="request-stat-desc">Tất cả yêu cầu</span>
                    </div>
                </Col>

                <Col xs={24} sm={8}>
                    <div className="request-stat-card">
                        <div className="request-stat-header">
                            <span style={{ textTransform: 'uppercase' }}>Đã xử lý</span>
                            <CheckCircleOutlined className="request-stat-icon" style={{ color: '#52c41a' }} />
                        </div>
                        <h2 className="request-stat-value">{totalDone.toString().padStart(2, '0')}</h2>
                        <span className="request-stat-desc">Hoàn thành & Từ chối</span>
                    </div>
                </Col>

                <Col xs={24} sm={8}>
                    <div className="request-stat-card">
                        <div className="request-stat-header">
                            <span style={{ textTransform: 'uppercase' }}>Đang xử lý</span>
                            <ClockCircleOutlined className="request-stat-icon" style={{ color: '#faad14' }} />
                        </div>
                        <h2 className="request-stat-value">{totalPending.toString().padStart(2, '0')}</h2>
                        <span className="request-stat-desc">Đợi phản hồi</span>
                    </div>
                </Col>
            </Row>
        </div>
    );
}