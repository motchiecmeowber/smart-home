import { useState, useEffect, type ReactNode } from 'react'
import { Layout, Menu, Badge } from 'antd'
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
  onNavigateNotifications: () => void
  onNavigateRequests: () => void
  onNavigateRealtime: () => void
  onNavigateStatistics: () => void
  onNavigateSchedules: () => void
  onNavigateOverview: () => void
  onNavigateSettings: () => void
  onNavigateProfile: () => void
  onLogout: () => void
}

const mainNavItems: DashboardNavItem[] = [
  { label: 'Dashboard', route: 'dashboard-overview', icon: <DashboardOutlined /> },
  { label: 'Thiết bị', route: 'dashboard-devices', icon: <DesktopOutlined /> },
  { label: 'Thời gian thực', route: 'dashboard-realtime', icon: <ThunderboltOutlined /> },
  { label: 'Báo cáo thống kê', route: 'dashboard-statistics', icon: <BarChartOutlined /> },
  { label: 'Lịch trình', route: 'dashboard-schedules', icon: <CalendarOutlined /> },
  { label: 'Thông báo', route: 'dashboard-notifications', icon: <BellOutlined /> },
  { label: 'Yêu cầu của tôi', route: 'dashboard-requests', icon: <MailOutlined /> },
]

const accountNavItems: DashboardNavItem[] = [
  { label: 'Cài đặt', route: 'dashboard-settings', icon: <SettingOutlined /> },
  { label: 'Hồ sơ của tôi', route: 'dashboard-profile', icon: <UserOutlined /> },
]

function createMenuItems(items: DashboardNavItem[], unreadCount: number = 0): MenuItem[] {
  return items.map((item) => ({
    key: item.route ?? item.label,
    icon: item.route === 'dashboard-notifications' ? (
      <Badge count={unreadCount} size="small" offset={[10, 0]}>
        {item.icon}
      </Badge>
    ) : (
      item.icon
    ),
    label: item.label,
  }))
}

export function DashboardLayout({
  children,
  activeRoute,
  onNavigateDevices,
  onNavigateNotifications,
  onNavigateRequests,
  onNavigateRealtime,
  onNavigateStatistics,
  onNavigateSchedules,
  onNavigateOverview,
  onNavigateSettings,
  onNavigateProfile,
  onLogout,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { apiGetNotis } = await import('../lib/notiApi')
        const notis = await apiGetNotis()
        const count = notis.filter(n => !n.isRead).length
        setUnreadCount(count)
      } catch (e) {
        // Ignore error
      }
    }

    if (activeRoute === 'dashboard-notifications') {
      setUnreadCount(0)
    } else {
      fetchUnread()
      // Optional: Polling every 30s to get new notifications
      const interval = setInterval(fetchUnread, 30000)
      return () => clearInterval(interval)
    }
  }, [activeRoute])

  const handleMainMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'dashboard-devices') {
      onNavigateDevices()
      return
    }

    if (key === 'dashboard-notifications') {
      onNavigateNotifications()
      return
    }

    if (key === 'dashboard-requests') {
      onNavigateRequests()
      return
    }
    if (key === 'dashboard-realtime') {
      onNavigateRealtime()
      return
    }
    if (key === 'dashboard-statistics') {
      onNavigateStatistics()
      return
    }
    if (key === 'dashboard-schedules') {
      onNavigateSchedules()
      return
    }
    if (key === 'dashboard-overview') {
      onNavigateOverview()
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
          style={{ justifyContent: collapsed ? 'center' : 'flex-start', cursor: 'pointer', padding: collapsed ? '0 0 20px 0' : '0 8px 20px' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="dashboard-brand-mark" style={{ fontSize: 20 }}>S</span>
          {!collapsed && (
            <span style={{ fontSize: 22, fontWeight: 800 }}>Smart Home</span>
          )}
        </div>

        <Menu
          className="dashboard-menu"
          items={createMenuItems(mainNavItems, unreadCount)}
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