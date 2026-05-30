import { ClockCircleOutlined, FilterOutlined } from "@ant-design/icons"
import { Select, Space } from "antd"

type RequestFiltersProps = {
    onStatusChange: (value: string) => void
    onSortChange: (value: 'desc' | 'asc') => void
    sortValue: 'desc' | 'asc'
}

export function RequestFilters({
    onStatusChange,
    onSortChange,
    sortValue
}: RequestFiltersProps) {
    return (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <Space wrap size={12} style={{ width: '100%' }}>
                {/* Filter */}
                <Select
                    placeholder="Trạng thái yêu cầu"
                    style={{ width: 200 }}
                    onChange={onStatusChange}
                    allowClear
                    suffixIcon={<FilterOutlined />}
                    options={[
                        {value: 'PENDING', label: 'Chờ xử lý'},
                        {value: 'APPROVED', label: 'Phê duyệt'},
                        {value: 'REJECTED', label: 'Từ chối'}
                    ]}
                />

                {/* Sort */}
                <Select
                    placeholder="Sắp xếp theo thời gian"
                    style={{ width: 200 }}
                    value={sortValue}
                    onChange={onSortChange}
                    suffixIcon={<ClockCircleOutlined />}
                    allowClear
                    options={[
                        {value: 'desc', label: 'Mới nhất xếp trước'},
                        {value: 'asc', label: 'Cũ nhất xếp trước'}
                    ]}
                />
            </Space>
        </div>
    )
}