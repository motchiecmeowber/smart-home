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
  onNavigateSettings: () => void
  onNavigateProfile: () => void
  onNavigateDashboard: () => void
  onNavigateSchedule: () => void
  onLogout: () => void
}

const mainNavItems: DashboardNavItem[] = [
  { label: 'Dashboard', route: 'dashboard-home', icon: <DashboardOutlined /> },
  { label: 'Thiết bị', route: 'dashboard-devices', icon: <DesktopOutlined /> },
  { label: 'Báo cáo thống kê', icon: <BarChartOutlined /> },
  { label: 'Lịch trình', route: 'dashboard-schedule', icon: <CalendarOutlined /> },
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
  onNavigateSettings,
  onNavigateProfile,
  onLogout,
  onNavigateDashboard,
  onNavigateSchedule,
}: DashboardLayoutProps) {
  const handleMainMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'dashboard-devices') {
      onNavigateDevices()
    }
    if (key === 'dashboard-home') {
      onNavigateDashboard()
      return
    }
    if (key === 'dashboard-schedule') {
      onNavigateSchedule()
      return
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
