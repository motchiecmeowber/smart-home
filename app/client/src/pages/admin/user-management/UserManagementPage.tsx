import { message, Typography } from "antd";
import { useEffect, useState } from "react";
import { apiDeleteUser, apiGetUserDetail, apiGetUsers, type UserDetailInfo } from "../../../lib/userApi";
import type { UserDto } from "../../../lib/authApi";
import { UserFilters } from "./components/UserFilters";
import { UserTable } from "./components/UserTable";
import { UserDetailModal } from "./components/UserDetailModal";
import '../AdminPages.css'

const {Title, Text} = Typography

export function UserManagementPage() {
    const [users, setUsers] = useState<UserDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Filter
    const [searchText, setSearchText] = useState<string>('')
    const [selectedRole, setSelectedRole] = useState<string>('')

    // Modal
    const [detailVisible, setDetailVisible] = useState<boolean>(false)
    const [detailLoading, setDetailLoading] = useState<boolean>(false)
    const [selectedUser, setSelectedUser] = useState<UserDetailInfo | null>(null)

    // Api
    const fecthUsers = async () => {
        setLoading(true)

        try {
            const data = await apiGetUsers()
            setUsers(data)
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Không thể tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fecthUsers()
    }, [])
    
    const handleOpenDetail = async (userId: string) => {
        setDetailVisible(true)
        setDetailLoading(true)
        
        try {
            const data = await apiGetUserDetail(userId)
            setSelectedUser(data)
        } catch (error) {
            message.error('Không thể lấy thông tin chi tiết của người dùng này')
            setDetailVisible(false)
        } finally {
            setDetailLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        try {
            await apiDeleteUser(userId)
            message.success('Đã xóa tài khoản người dùng thành công')
        } catch (error) {
            message.error(error instanceof Error ? error.message : 'Xóa tài khoản thất bại')
        }
    }

    const filteredUsers = users.filter((user) => {
        const matchSearch =
            (user.username || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchText.toLowerCase())
        const matchRole = selectedRole ? user.role === selectedRole : true
        return matchSearch && matchRole
    })

    return (
        <section className="admin-page" aria-labelledby="user-mgmt-title">
            <div className="admin-heading">
                <div className="admin-heading-left">
                    <Title id="user-mgmt-title" level={1} className="admin-title">
                        Quản Lý Người Dùng
                    </Title>
                    <Text className="admin-subtitle">
                        Quản lý và giám sát tài khoản người dùng
                    </Text>
                </div>
            </div>

            <UserFilters
                onSearchChange={setSearchText}
                onRoleChange={(val) => setSelectedRole(val ?? '')}
            />

            <UserTable
                loading={loading}
                data={filteredUsers}
                onViewDetail={handleOpenDetail}
                onDeleteUser={handleDeleteUser}
            />

            <UserDetailModal
                visible={detailVisible}
                loading={detailLoading}
                user={selectedUser}
                onClose={() => {
                    setDetailVisible(false)
                    setSelectedUser(null)
                }}
            />
        </section>
    )
}