import { SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space } from "antd";

type DeviceFiltersProps = {
    onSearchChange: (value: string) => void
    onTypeChange: (value: string) => void
    onOwnershipChange: (value: string) => void
    onSync: () => void
    syncLoading: boolean
}

export function DeviceFilters({
    onSearchChange,
    onTypeChange,
    onOwnershipChange,
    onSync,
    syncLoading
}: DeviceFiltersProps) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20}}>
            <Space wrap size={12}>
                {/* Search by name */}
                <Input
                    placeholder="Tìm theo tên thiết bị..."
                    prefix={<SearchOutlined style={{ color: '#BFBFBF' }} />}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: 240}}
                    allowClear
                />

                {/* Search by deviceType */}
                <Select
                    placeholder="Loại thiết bị"
                    onChange={onTypeChange}
                    style={{ width: 160 }}
                    allowClear
                    options={[
                        { value: 'SENSOR', label: 'CẢM BIẾN' },
                        { value: 'ACTUATOR', label: 'CHẤP HÀNH' }
                    ]}
                />

                {/* Search by ownership */}
                <Select
                    placeholder="Trạng thái sở hữu"
                    onChange={onOwnershipChange}
                    style={{ width: 200 }}
                    allowClear
                    options={[
                        { value: 'ASSIGNED', label: 'Đã có người sử dùng' },
                        { value: 'UNASSIGNED', label: 'Chưa có người sử dụng' }
                    ]}
                />
            </Space>

            {/* Button sync-devices from TB */}
            <Button
                type="primary"
                icon={<SyncOutlined spin={syncLoading} />}
                loading={syncLoading}
                onClick={onSync}
                style={{ background: '#0B5F95', fontWeight: 700 }}
            >
                Đồng bộ từ ThingsBoard
            </Button>
        </div>
    )
}