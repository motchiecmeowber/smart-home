import { Select } from 'antd'

export type SensorFilterType = 'TEMPERATURE' | 'HUMIDITY' | 'GAS' | 'ALL';

interface FilterBarProps {
    filterType: SensorFilterType
    onFilterTypeChange: (type: SensorFilterType) => void
    selectedRoom: string
    onRoomChange: (roomId: string) => void
    rooms: { value: string; label: string }[]
    devices: { value: string; label: string }[]
    selectedDevice: string
    onDeviceChange: (deviceId: string) => void
}

export function FilterBar({
    filterType,
    onFilterTypeChange,
    selectedRoom,
    onRoomChange,
    rooms,
    devices,
    selectedDevice,
    onDeviceChange,
}: FilterBarProps) {
    return (
        <div className="filter-card ant-card">
            <div className="filter-card-body ant-card-body" style={{ padding: '16px 20px' }}>
                <div className="filter-bar-detail">
                    <div className="filter-item">
                        <span className="filter-item-label">Loại chỉ số:</span>
                        <Select
                            value={filterType}
                            onChange={onFilterTypeChange}
                            className="room-select-dark"
                            size="middle"
                            style={{ minWidth: '150px' }}
                            options={[
                                { value: 'ALL', label: 'Tất cả chỉ số' },
                                { value: 'TEMPERATURE', label: 'Nhiệt độ' },
                                { value: 'HUMIDITY', label: 'Độ ẩm' },
                                { value: 'GAS', label: 'Khí Gas' }
                            ]}
                        />
                    </div>

                    <div className="filter-item">
                        <span className="filter-item-label">Phòng:</span>
                        <Select
                            value={selectedRoom}
                            onChange={onRoomChange}
                            className="room-select-dark"
                            size="middle"
                            style={{ minWidth: '150px' }}
                            options={[{ value: 'ALL', label: 'Tất cả vị trí' }, ...rooms]}
                        />
                    </div>

                    <div className="filter-item">
                        <span className="filter-item-label">Thiết bị:</span>
                        <Select
                            value={selectedDevice}
                            onChange={onDeviceChange}
                            className="room-select-dark"
                            size="middle"
                            style={{ minWidth: '220px' }}
                            options={[{ value: 'ALL', label: 'Tất cả cảm biến' }, ...devices]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}