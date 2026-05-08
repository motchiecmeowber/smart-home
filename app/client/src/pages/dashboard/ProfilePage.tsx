import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Typography,
} from 'antd'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import './ProfilePage.css'

const { Text, Title } = Typography

const profileInfo = {
  fullName: 'Nguyễn Văn An',
  email: 'yourname@gmail.com',
  birthday: '20/04/2004',
  phone: '0987654321',
  province: 'Hà Nội',
}

export function ProfilePage() {
  return (
    <section className="profile-page" aria-labelledby="profile-title">
      <div className="profile-heading">
        <Title id="profile-title" level={1}>
          Thông tin cá nhân
        </Title>
      </div>

      <Card className="profile-card">
        <div className="profile-overview">
          <div className="profile-avatar-wrap">
            <Avatar
              className="profile-avatar"
              icon={<UserOutlined />}
              size={96}
            />
            <Button
              aria-label="Chỉnh sửa ảnh đại diện"
              className="profile-edit-avatar"
              icon={<EditOutlined />}
              shape="circle"
            />
          </div>

          <div className="profile-user">
            <Title level={2}>{profileInfo.fullName}</Title>
            <Text type="secondary">{profileInfo.email}</Text>
          </div>
        </div>

        <Divider />

        <Descriptions
          className="profile-descriptions"
          colon={false}
          column={1}
          items={[
            {
              key: 'fullName',
              label: 'Họ và tên',
              children: profileInfo.fullName,
            },
            {
              key: 'birthday',
              label: 'Ngày sinh',
              children: profileInfo.birthday,
            },
            {
              key: 'email',
              label: 'Email',
              children: profileInfo.email,
            },
            {
              key: 'phone',
              label: 'Số điện thoại',
              children: profileInfo.phone,
            },
            {
              key: 'province',
              label: 'Tỉnh',
              children: profileInfo.province,
            },
          ]}
        />

        <div className="profile-actions">
          <Button icon={<EditOutlined />} size="large" type="primary">
            Chỉnh sửa thông tin
          </Button>
        </div>
      </Card>
    </section>
  )
}
