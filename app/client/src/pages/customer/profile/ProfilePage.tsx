import { useEffect, useState } from 'react'
import { Avatar, Button, Card, Descriptions, Typography, Spin, message,
  Modal, Form, Input, Row, Col
} from 'antd'
import { EditOutlined, UserOutlined, LockOutlined } from '@ant-design/icons'
import { apiGetProfile, apiUpdateProfile, apiChangePassword, type UserDetailInfo } from '../../../lib/userApi'
import '../CustomerPages.css'
import './ProfilePage.css'

const { Title } = Typography

export function ProfilePage() {
  const [profile, setProfile] = useState<UserDetailInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiGetProfile()

      setProfile(data)
      form.setFieldsValue({
        firstName: data.firstName,
        lastName: data.lastName
      })
    } catch (error: any) {
      message.error(error.message || 'Lỗi lấy thông tin cá nhân')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (values: { firstName: string, lastName: string }) => {
    try {
      setUpdating(true)

      await apiUpdateProfile(values)
      message.success('Cập nhật thông tin thành công')
      
      setIsEditModalVisible(false)
      fetchProfile()
    } catch (error: any) {
      message.error(error.message || 'Lỗi cập nhật thông tin')
    } finally {
      setUpdating(false)
    }
  }

  const handleChangePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp')
      return
    }

    if (values.currentPassword === values.newPassword) {
      message.error('Mật khẩu mới không được trùng với mật khẩu hiện tại')
      return
    }

    try {
      setUpdating(true)

      await apiChangePassword(values.currentPassword, values.newPassword)
      message.success('Thay đổi mật khẩu thành công')

      setIsPasswordModalVisible(false)
      passwordForm.resetFields()
    } catch (error: any) {
      message.error(error.message || 'Lỗi thay đổi mật khẩu')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <section className="customer-page" aria-labelledby="profile-title">
         <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Spin size="large" />
         </div>
      </section>
    )
  }

  if (!profile) return null

  const fullName = [profile.lastName, profile.firstName].filter(Boolean).join(' ') || profile.username

  return (
    <section className="customer-page" aria-labelledby="profile-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="profile-title" level={1} className="customer-title">
            Thông tin cá nhân
          </Title>
        </div>
      </div>

      <Card className="profile-card">
        <Row gutter={[48, 32]} style={{ width: '100%', alignItems: 'center' }}>
          {/* Cột trái: Avatar + Tên */}
          <Col xs={24} md={8} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e7eef2' }}>
            <Avatar
              className="profile-avatar"
              icon={<UserOutlined />}
              size={140}
              style={{ marginBottom: 16 }}
            />
            <Title level={2} style={{ margin: 0, textAlign: 'center' }}>{fullName}</Title>
          </Col>

          {/* Cột phải: Thông tin còn lại + Buttons */}
          <Col xs={24} md={16} style={{ paddingLeft: 24 }}>
            <Descriptions
              className="profile-descriptions"
              colon={false}
              column={1}
              items={[
                {
                  key: 'username',
                  label: 'Tên đăng nhập',
                  children: profile.username,
                },
                {
                  key: 'email',
                  label: 'Email',
                  children: profile.email,
                },
                {
                  key: 'role',
                  label: 'Vai trò',
                  children: profile.role,
                },
                {
                  key: 'createdAt',
                  label: 'Ngày tham gia',
                  children: new Date(profile.createdAt).toLocaleDateString('vi-VN'),
                }
              ]}
            />

            <div className="profile-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingTop: 32, marginTop: 0 }}>
              <Button icon={<EditOutlined />} size="large" type="primary" onClick={() => setIsEditModalVisible(true)}>
                Chỉnh sửa thông tin
              </Button>
              <Button icon={<LockOutlined />} size="large" onClick={() => setIsPasswordModalVisible(true)}>
                Đổi mật khẩu
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Chỉnh sửa thông tin"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={updating}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item label="Họ" name="lastName">
            <Input placeholder="Nhập họ" />
          </Form.Item>
          <Form.Item label="Tên" name="firstName">
            <Input placeholder="Nhập tên" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false)
          passwordForm.resetFields()
        }}
        confirmLoading={updating}
        onOk={() => passwordForm.submit()}
      >
        <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
          <Form.Item 
            label="Mật khẩu hiện tại" 
            name="currentPassword" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>
          <Form.Item 
            label="Mật khẩu mới" 
            name="newPassword" 
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>
          <Form.Item 
            label="Xác nhận mật khẩu mới" 
            name="confirmPassword" 
            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
