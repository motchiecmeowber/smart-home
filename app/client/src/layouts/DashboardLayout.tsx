import type { ReactNode } from 'react'
import { Layout, Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  DashboardOutlined,
  DesktopOutlined,
  LogoutOutlined,
  MailOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { DashboardNavItem, DashboardRoute } from '../types/dashboard'
import './DashboardLayout.css'

const { Content, Sider } = Layout
type MenuItem = NonNullable<MenuProps['items']>[number]

type DashboardLayoutProps = {
  children: ReactNode
  activeRoute: DashboardRoute
  onNavigateDevices: () => void
  onNavigateRealtime: () => void
  onNavigateSettings: () => void
  onNavigateProfile: () => void
  onLogout: () => void
}

const mainNavItems: DashboardNavItem[] = [
  { label: 'Dashboard', icon: <DashboardOutlined /> },
  { label: 'Thiết bị', route: 'dashboard-devices', icon: <DesktopOutlined /> },
  { label: 'Thời gian thực', route: 'dashboard-realtime', icon: <ThunderboltOutlined /> },
  { label: 'Báo cáo thống kê', icon: <BarChartOutlined /> },
  { label: 'Lịch trình', icon: <CalendarOutlined /> },
  { label: 'Thông báo', icon: <BellOutlined /> },
  { label: 'Yêu cầu của tôi', icon: <MailOutlined /> },
]

const accountNavItems: DashboardNavItem[] = [
  { label: 'Cài đặt', route: 'dashboard-settings', icon: <SettingOutlined /> },
  { label: 'Hồ sơ của tôi', route: 'dashboard-profile', icon: <UserOutlined /> },
]

function createMenuItems(items: DashboardNavItem[]): MenuItem[] {
  return items.map((item) => ({
    key: item.route ?? item.label,
    icon: item.icon,
    label: item.label,
  }))
}

export function DashboardLayout({
  children,
  activeRoute,
  onNavigateDevices,
  onNavigateRealtime,
  onNavigateSettings,
  onNavigateProfile,
  onLogout,
}: DashboardLayoutProps) {
  const handleMainMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'dashboard-devices') {
      onNavigateDevices()
    }
    if (key === 'dashboard-realtime') {
      onNavigateRealtime()
    }
  }

  const handleAccountMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'dashboard-settings') {
      onNavigateSettings()
      return
    }

    if (key === 'dashboard-profile') {
      onNavigateProfile()
      return
    }

    if (key === 'logout') {
      onLogout()
    }
  }

  return (
    <Layout className="dashboard-shell">
      <Sider className="dashboard-sidebar" width={240}>
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">S</span>
          <span>Smart Home</span>
        </div>

        <Menu
          className="dashboard-menu"
          items={createMenuItems(mainNavItems)}
          mode="inline"
          onClick={handleMainMenuClick}
          selectedKeys={[activeRoute]}
          theme="dark"
        />

        <Menu
          className="dashboard-menu account-menu"
          items={[
            ...createMenuItems(accountNavItems),
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Đăng xuất',
            },
          ]}
          mode="inline"
          onClick={handleAccountMenuClick}
          selectedKeys={[activeRoute]}
          theme="dark"
        />
      </Sider>

      <Content className="dashboard-content">{children}</Content>
    </Layout>
  )
}