import { useState, type ReactNode } from 'react'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  DesktopOutlined,
  TeamOutlined,
  LogoutOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import './DashboardLayout.css'

const { Content, Sider } = Layout

type AdminLayoutProps = {
  children: ReactNode
  activeRoute: string
  onNavigate: (route: string) => void
  onLogout: () => void
}

export function AdminDashboardLayout({ children, activeRoute, onNavigate, onLogout }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  const mainNavItems: MenuProps['items'] = [
    { key: 'admin-dashboard', icon: <DashboardOutlined />, label: 'Dashboard'},
    { key: 'admin-devices', icon: <DesktopOutlined />, label: 'Quản lý thiết bị'},
    { key: 'admin-users', icon: <TeamOutlined />, label: 'Quản lý người dùng'},
    { key: 'admin-requests', icon: <MailOutlined />, label: 'Phê duyệt yêu cầu'}
  ]

  const accountNavItems: MenuProps['items'] = [
    { key: 'admin-settings', icon: <SettingOutlined />, label: 'Cài đặt'},
    { key: 'admin-profile', icon: <UserOutlined />, label: 'Hồ sơ cá nhân'},
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất'}
  ]

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      onLogout()
    } else {
      onNavigate(key)
    }
  }

  return (
    <Layout className="dashboard-shell">
      <Sider 
        className="dashboard-sidebar" 
        width={255}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth={80}
        trigger={null}
      >
        <div 
          className="dashboard-brand" 
          style={{ 
            flexDirection: 'column',
            alignItems: collapsed ? 'center' : 'flex-start',
            gap: 4,
            cursor: 'pointer', 
            padding: collapsed ? '0 0 20px 0' : '0 8px 20px' 
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="dashboard-brand-mark" style={{ fontSize: 20, minWidth: 40 }}>S</span>
            {!collapsed && (
              <span style={{ fontSize: 24, fontWeight: 800, whiteSpace: 'nowrap' }}>Smart Home</span>
            )}
          </div>
          {!collapsed && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#91d5ff', textTransform: 'uppercase', letterSpacing: 1, marginTop: 10 }}>
              Hệ thống quản trị
            </span>
          )}
        </div>

        <Menu
          className="dashboard-menu"
          items={mainNavItems}
          mode="inline"
          onClick={handleMenuClick}
          selectedKeys={[activeRoute]}
          theme="dark"
        />

        <Menu
          className="dashboard-menu account-menu"
          items={accountNavItems}
          mode="inline"
          onClick={handleMenuClick}
          selectedKeys={[activeRoute]}
          theme="dark"
        />
      </Sider>
      <Content className="dashboard-content">{children}</Content>
    </Layout>
  )
}