import { Col, Input, Row, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export type DeviceFilterProps = {
    searchText: string
    selectedType: string
    onSearchChange: (value: string) => void
    onTypeChange: (value: string) => void
}

export function DeviceFilters({
    searchText,
    selectedType,
    onSearchChange,
    onTypeChange,
}: DeviceFilterProps) {
    return (
        <div style={{ marginBottom: 12 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                    <Input
                        placeholder="Tìm kiếm theo tên thiết bị..."
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                </Col>
                <Col xs={24} sm={12}>
                    <Select
                        placeholder="Loại thiết bị"
                        value={selectedType || undefined}
                        onChange={(value) => onTypeChange(value || '')}
                        style={{ width: '100%' }}
                        allowClear
                        options={[
                            { label: 'CẢM BIẾN', value: 'SENSOR' },
                            { label: 'ĐIỀU KHIỂN', value: 'ACTUATOR' },
                        ]}
                    />
                </Col>
            </Row>
        </div>
    )
}