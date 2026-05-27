import { Card, Col, Row, Typography } from "antd";
import type { ScheduleDTO } from "../../../../lib/scheduleApi";

const { Text, Title } = Typography

type SchedulesSummaryProps = {
    schedules: ScheduleDTO[]
}

export function SchedulesSummary({ schedules }: SchedulesSummaryProps) {
    const activeCount = schedules.filter((s: any) => s.enabled).length

    return (
        <Row className="schedules-summary" gutter={[14, 14]}>
            <Col lg={12} sm={12} xs={24}>
                <Card className="schedule-summary-card" size="small">
                    <Text>Tổng lịch trình</Text>
                    <Title level={2}>{schedules.length}</Title>
                </Card>
            </Col>

            <Col lg={12} sm={12} xs={24}>
                <Card className="schedule-summary-card" size="small">
                    <Text>Đang hoạt động</Text>
                    <Title level={2}>{activeCount}</Title>
                </Card>
            </Col>
        </Row>
    )
}