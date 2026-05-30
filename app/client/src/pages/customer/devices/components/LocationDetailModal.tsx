import { Modal, Descriptions, Button, Space, Popconfirm, Input } from 'antd'
import { useState, useEffect } from 'react'
import type { LocationDTO } from '../../../../lib/locationApi'

type LocationDetailModalProps = {
    location: LocationDTO | null
    open: boolean
    onClose: () => void
    onDelete?: (locationId: string) => void
    onUpdate?: (locationId: string, newName: string) => Promise<void>
}

export function LocationDetailModal({ location, open, onClose, onDelete, onUpdate }: LocationDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState('')
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (open && location) {
            setIsEditing(false)
            setEditName(location.locationName)
        }
    }, [open, location])
    const handleDelete = () => {
        if (location && onDelete) {
            onDelete(location.locationId)
        }
    }

    const handleUpdate = async () => {
        if (location && onUpdate && editName.trim()) {
            try {
                setUpdating(true)
                await onUpdate(location.locationId, editName.trim())
                setIsEditing(false)
            } finally {
                setUpdating(false)
            }
        }
    }

    return (
        <Modal
            title="Chi tiết khu vực"
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnHidden
            centered
        >
            {!location ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</div>
            ) : (
                <>
                    <Descriptions bordered column={1} styles={{ label: { width: '130px' } }}>
                        <Descriptions.Item label="Mã khu vực">{location.locationId}</Descriptions.Item>
                        <Descriptions.Item label="Tên khu vực">
                            {isEditing ? (
                                <Input 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)} 
                                    onPressEnter={handleUpdate}
                                    autoFocus
                                />
                            ) : (
                                <b>{location.locationName}</b>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <Space>
                            {isEditing ? (
                                <>
                                    <Button onClick={() => setIsEditing(false)} disabled={updating}>Hủy</Button>
                                    <Button type="primary" onClick={handleUpdate} loading={updating}>Lưu</Button>
                                </>
                            ) : (
                                <>
                                    <Button type="primary" ghost onClick={() => setIsEditing(true)}>Đổi tên</Button>
                                    {/* <Button type="default" onClick={onClose}>Đóng</Button> */}
                                    <Popconfirm
                                        title="Xóa khu vực này?"
                                        description="Tất cả thiết bị bên trong sẽ chuyển về 'Chưa có vị trí'."
                                        onConfirm={handleDelete}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button danger>Xóa khu vực</Button>
                                    </Popconfirm>
                                </>
                            )}
                        </Space>
                    </div>
                </>
            )}
        </Modal>
    )
}