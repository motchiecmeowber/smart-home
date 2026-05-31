import { useEffect, useState } from 'react'
import { ConfigProvider, Spin, Result, Button } from 'antd'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AdminDashboardLayout } from './layouts/AdminLayout'
import * as Admin from './pages/admin/index'
import * as Customer from './pages/customer/index'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import type { AppRoute } from './types/auth'
import { authStore } from './lib/authStore'
import { useAuth } from './hooks/useAuth'
import './App.css'

const routePaths: Record<AppRoute, string> = {
  login: '/login',
  register: '/register',
  'dashboard-devices': '/devices',
  'dashboard-notifications': '/notifications',
  'dashboard-requests': '/requests',
  'dashboard-realtime': '/realtime',
  'dashboard-settings': '/settings',
  'dashboard-profile': '/profile',
  'dashboard-statistics': '/statistics',
  'dashboard-schedules': '/schedules',
  'dashboard-overview': '/overview',
  'admin-dashboard': '/admin/dashboard',
  'admin-devices': '/admin/devices',
  'admin-users': '/admin/users',
  'admin-requests': '/admin/requests',
  'admin-profile': '/admin/profile'
}

const DASHBOARD_ROUTES: AppRoute[] = [
  'dashboard-devices',
  'dashboard-realtime',
  'dashboard-notifications',
  'dashboard-requests',
  'dashboard-settings',
  'dashboard-profile',
  'dashboard-statistics',
  'dashboard-schedules',
  'dashboard-overview',
]

const ADMIN_ROUTES: AppRoute[] = [
  'admin-dashboard',
  'admin-devices',
  'admin-users',
  'admin-requests',
  'admin-profile',
]

function getAppRouteFromLocation(): AppRoute {
  const path = window.location.pathname
  const found = Object.entries(routePaths).find(([, value]) => value === path)
  return (found?.[0] as AppRoute) ?? 'login'
}

function App() {
  const auth = useAuth()
  const [appRoute, setAppRoute] = useState<AppRoute>(getAppRouteFromLocation)

  // Restore session once on app startup
  useEffect(() => {
    authStore.tryRestore()
  }, [])

  // Route guard + role-based redirects
  useEffect(() => {
    if (auth.restoring) return

    const currentRoute = getAppRouteFromLocation();
    const isProtected = [...DASHBOARD_ROUTES, ...ADMIN_ROUTES].includes(currentRoute)

    // If the user landed on a protected route but has no session, redirect
    if (!auth.accessToken && isProtected) {
      navigateToAppRoute('login')
      return
    }

    // If already authenticated and on login/register, go to dashboard
    if (auth.accessToken && (appRoute === 'login' || appRoute === 'register')) {
      if (auth.user?.role === 'ADMIN') {
        navigateToAppRoute('admin-dashboard')
      } else {
        navigateToAppRoute('dashboard-overview')
      }
    }
  }, [auth.restoring, auth.accessToken, auth.user?.role, appRoute])

  useEffect(() => {
    const syncRoute = () => setAppRoute(getAppRouteFromLocation())
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  const navigateToAppRoute = (route: AppRoute) => {
    setAppRoute(route)
    if (window.location.pathname !== routePaths[route]) {
      window.history.pushState(null, '', routePaths[route])
    }
  }

  const handleLogout = async () => {
    await authStore.logout()
    navigateToAppRoute('login')
  }

  if (auth.restoring) {
    return (
      <div style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#eef3f6',
      }}>
        <Spin size="large" description="Đang khôi phục phiên..." />
      </div>
    )
  }

  const isCustomerRoute = DASHBOARD_ROUTES.includes(appRoute)
  const isAdminRoute = ADMIN_ROUTES.includes(appRoute)

  const isUnauthorized = auth.accessToken && (
    (auth.user?.role === 'CUSTOMER' && isAdminRoute) ||
    (auth.user?.role === 'ADMIN' && isCustomerRoute)
  )

  if (isUnauthorized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <Result
          status="403"
          title="403"
          subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
          extra={
            <Button
              type="primary"
              onClick={() => navigateToAppRoute(auth.user?.role === 'ADMIN' ? 'admin-dashboard' : 'dashboard-overview')}
            >
              Về trang chủ
            </Button>
          }
        />
      </div>
    )
  }

  const layoutProps = {
    onLogout: handleLogout,
    onNavigateDevices: () => navigateToAppRoute('dashboard-devices'),
    onNavigateNotifications: () => navigateToAppRoute('dashboard-notifications'),
    onNavigateRequests: () => navigateToAppRoute('dashboard-requests'),
    onNavigateRealtime: () => navigateToAppRoute('dashboard-realtime'),
    onNavigateStatistics: () => navigateToAppRoute('dashboard-statistics'),
    onNavigateSchedules: () => navigateToAppRoute('dashboard-schedules'),
    onNavigateOverview: () => navigateToAppRoute('dashboard-overview'),
    onNavigateSettings: () => navigateToAppRoute('dashboard-settings'),
    onNavigateProfile: () => navigateToAppRoute('dashboard-profile'),
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0b5f95',
          borderRadius: 8,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Button: { primaryShadow: 'none' },
          Menu: { itemBorderRadius: 8 },
        },
      }}
    >
      <div className="app-shell">
        {appRoute === 'login' && (
          <LoginPage
            onLoginSuccess={() => {
              // check role to navigate
              if (authStore.getState().user?.role === 'ADMIN') {
                navigateToAppRoute('admin-dashboard')
              } else {
                navigateToAppRoute('dashboard-overview')
              }
            }}
            onNavigateRegister={() => navigateToAppRoute('register')}
          />
        )}

        {appRoute === 'register' && (
          <RegisterPage onNavigateLogin={() => navigateToAppRoute('login')} />
        )}

        {auth.user?.role === 'CUSTOMER' && auth.accessToken && (
          <DashboardLayout activeRoute={appRoute as any} {...layoutProps}>
            {appRoute === 'dashboard-devices' && <Customer.DevicesPage />}
            {appRoute === 'dashboard-realtime' && <Customer.RealtimePage />}
            {appRoute === 'dashboard-notifications' && <Customer.NotificationsPage />}
            {appRoute === 'dashboard-requests' && <Customer.RequestsPage />}
            {appRoute === 'dashboard-settings' && <Customer.SettingsPage />}
            {appRoute === 'dashboard-profile' && <Customer.ProfilePage />}
            {appRoute === 'dashboard-statistics' && <Customer.StatisticsPage />}
            {appRoute === 'dashboard-schedules' && <Customer.SchedulesPage />}
            {appRoute === 'dashboard-overview' && <Customer.DashboardPage />}
          </DashboardLayout>
        )}

        {/* Admin UI */}
        {auth.user?.role === 'ADMIN' && auth.accessToken && (
          <AdminDashboardLayout activeRoute={appRoute} onNavigate={(route) => navigateToAppRoute(route as AppRoute)} onLogout={handleLogout}>
            {appRoute === 'admin-dashboard' && <Admin.AdminDashboardPage />}
            {appRoute === 'admin-devices' && <Admin.DeviceManagementPage />}
            {appRoute === 'admin-users' && <Admin.UserManagementPage />}
            {appRoute === 'admin-requests' && <Admin.RequestManagementPage />}
            {appRoute === 'admin-profile' && <Customer.ProfilePage />}
          </AdminDashboardLayout>
        )}
      </div>
    </ConfigProvider>
  )
}

export default App
