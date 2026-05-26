import { message, Typography } from "antd";
import { useEffect, useState } from "react";
import { apiGetDevices, apiSyncDevices, type DeviceInfo } from "../../../lib/deviceApi";
import { DeviceFilters } from "./components/DeviceFilters";
import { DeviceTable } from "./components/DeviceTable";
import { DeviceDetailModal } from "./components/DeviceDetailModal";
import '../AdminPages.css'

const {Title, Text} = Typography

export function DeviceManagementPage() {
    const [devices, setDevices] = useState<DeviceInfo[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [syncLoading, setSyncLoading] = useState<boolean>(false)

    // state for filters
    const [searchText, setSearchText] = useState<string>('')
    const [selectedType, setSelectedType] = useState<string>('')
    const [selectedOwnership, setSelectedOwnership] = useState<string>('')

    // state for detail
    const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)
    const [modalVisible, setModalVisible] = useState<boolean>(false)

    // sync-devices
    const fetchDevices = async () => {
        setLoading(true)

        try {
            const data = await apiGetDevices()
            setDevices(data)
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Không thể tải danh sách thiết bị')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDevices()
    }, [])

    const handleSyncDevices = async () => {
        setSyncLoading(true)

        try {
            const data = await apiSyncDevices()
            message.success(`Đồng bộ thành công! Đã thêm mới ${data.createdCount} thiết bị.`)
            fetchDevices()
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Lỗi trong quá trình đồng bộ')
        } finally {
            setSyncLoading(false)
        }
    }

    // client-side filtering
    const filterDevices = devices.filter((device) => {
        const matchSearch = (device.deviceName ?? '').toLowerCase().includes(searchText.toLocaleLowerCase())
        const matchType = selectedType ? device.deviceType === selectedType : true
        const matchOwnership = selectedOwnership
                                ? selectedOwnership === 'ASSIGNED' ? device.hasOwner === true : device.hasOwner === false
                                : true
        
        return matchSearch && matchType && matchOwnership
    })

    const handleOpenDetail = (device: DeviceInfo) => {
        setSelectedDevice(device)
        setModalVisible(true)
    }

    return (
        <section className="admin-page" aria-labelledby="device-mgmt-title">
            <div className="admin-heading">
                <div className="admin-heading-left">
                    <Title id="device-mgmt-title" level={1} className="admin-title">
                        Quản Lý Thiết Bị
                    </Title>
                    <Text className="admin-subtitle">
                        Đồng bộ kho phần cứng từ ThingsBoard và phân quyền sở hữu
                    </Text>
                </div>
            </div>

            <DeviceFilters
                onSearchChange={setSearchText}
                onTypeChange={setSelectedType}
                onOwnershipChange={setSelectedOwnership}
                onSync={handleSyncDevices}
                syncLoading={syncLoading}
            />

            <DeviceTable
                loading={loading}
                data={filterDevices}
                onViewDetail={handleOpenDetail}
            />

            <DeviceDetailModal
                visible={modalVisible}
                device={selectedDevice}
                onClose={() => {
                    setModalVisible(false)
                    setSelectedDevice(null)
                }}
            />
        </section>
    )
}