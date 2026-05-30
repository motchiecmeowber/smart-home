import { SearchOutlined } from "@ant-design/icons"
import { Input, Select, Space } from "antd"

type UserFiltersProps = {
    onSearchChange: (value: string) => void
    onRoleChange: (value: string) => void
}

export function UserFilters({
    onSearchChange,
    onRoleChange
}: UserFiltersProps) {
    return (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20}}>
            <Space wrap size={12} style={{ width: '100%' }}>
                {/* find by username or email */}
                <Input
                    placeholder="Tìm theo tên, username hoặc mail"
                    prefix={<SearchOutlined style={{ color: '#BFBFBF' }} />}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: 280 }}
                    allowClear
                />

                {/* Filter by role */}
                <Select
                    placeholder="Vai trò"
                    onChange={onRoleChange}
                    style={{ width: 180 }}
                    allowClear
                    options={[
                        {value: 'CUSTOMER', label: 'Khách hàng'},
                        {value: 'ADMIN', label: 'Quản trị viên'}
                    ]}
                />
            </Space>
        </div>
    )
}