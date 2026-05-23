import { useEffect, useState } from 'react'
import { ConfigProvider, Spin } from 'antd'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AdminDashboardLayout } from './layouts/AdminLayout'
import * as Admin from './pages/admin/index';
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DevicesPage } from './pages/dashboard/DevicesPage'
import { NotificationsPage } from './pages/dashboard/NotificationsPage'
import { RealtimePage } from './pages/dashboard/RealtimePage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { RequestsPage } from './pages/dashboard/RequestsPage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import type { AppRoute } from './types/auth'
import { authStore } from './lib/authStore'
import { useAuth } from './hooks/useAuth'
import './App.css'

const routePaths: Record<AppRoute, string> = {
  login: '/login',
  register: '/register',
  'dashboard-devices': '/dashboard/devices',
  'dashboard-notifications': '/dashboard/notifications',
  'dashboard-requests': '/dashboard/requests',
  'dashboard-realtime': '/dashboard/realtime',
  'dashboard-settings': '/dashboard/settings',
  'dashboard-profile': '/dashboard/profile',
  'admin-dashboard': '/admin/dashboard',
  'admin-devices': '/admin/devices',
  'admin-users': '/admin/users',
  'admin-requests': '/admin/requests',
  'admin-settings': '/admin/settings',
  'admin-profile': '/admin/profile'
}

const DASHBOARD_ROUTES: AppRoute[] = [
  'dashboard-devices',
  'dashboard-notifications',
  'dashboard-requests',
  'dashboard-realtime',
  'dashboard-settings',
  'dashboard-profile',
]

const ADMIN_ROUTES: AppRoute[] = [
  'admin-dashboard',
  'admin-devices',
  'admin-users',
  'admin-requests',
  'admin-settings',
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
        navigateToAppRoute('dashboard-devices')
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
        <Spin size="large" tip="Đang khôi phục phiên..." />
      </div>
    )
  }

  const layoutProps = {
    onLogout: handleLogout,
    onNavigateDevices: () => navigateToAppRoute('dashboard-devices'),
    onNavigateNotifications: () => navigateToAppRoute('dashboard-notifications'),
    onNavigateRequests: () => navigateToAppRoute('dashboard-requests'),
    onNavigateRealtime: () => navigateToAppRoute('dashboard-realtime'),
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
                navigateToAppRoute('dashboard-devices')
              }
            }}
            onNavigateRegister={() => navigateToAppRoute('register')}
          />
        )}

        {appRoute === 'register' && (
          <RegisterPage onNavigateLogin={() => navigateToAppRoute('login')} />
        )}

        {auth.user?.role === 'CUSTOMER' && auth.accessToken && (
          <>
            {appRoute === 'dashboard-devices' && (
              // {appRoute === 'dashboard-devices' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-devices" {...layoutProps}>
                <DevicesPage />
              </DashboardLayout>
            )}

            {appRoute === 'dashboard-realtime' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-realtime" {...layoutProps}>
                <RealtimePage />
              </DashboardLayout>
            )}

            {appRoute === 'dashboard-notifications' && (
              // {appRoute === 'dashboard-notifications' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-notifications" {...layoutProps}>
                <NotificationsPage />
              </DashboardLayout>
            )}

            {appRoute === 'dashboard-requests' && (
              // {appRoute === 'dashboard-requests' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-requests" {...layoutProps}>
                <RequestsPage />
              </DashboardLayout>
            )}

            {appRoute === 'dashboard-settings' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-settings" {...layoutProps}>
                <SettingsPage />
              </DashboardLayout>
            )}

            {appRoute === 'dashboard-profile' && (
              // {appRoute === 'dashboard-profile' && auth.accessToken && (
              <DashboardLayout activeRoute="dashboard-profile" {...layoutProps}>
                <ProfilePage />
              </DashboardLayout>
            )}
          </>
        )}

        {/* Admin UI */}
        {auth.user?.role === 'ADMIN' && auth.accessToken && (
          <AdminDashboardLayout activeRoute={appRoute} onNavigate={navigateToAppRoute} onLogout={handleLogout}>
            {appRoute === 'admin-dashboard' && <Admin.AdminDashboardPage />}
            {appRoute === 'admin-devices' && <Admin.DeviceManagementPage />}
            {appRoute === 'admin-users' && <Admin.UserManagementPage />}
            {appRoute === 'admin-requests' && <Admin.RequestManagementPage />}

            {appRoute === 'admin-settings' && <SettingsPage />}
            {appRoute === 'admin-profile' && <ProfilePage />}
          </AdminDashboardLayout>
        )}
      </div>
    </ConfigProvider>
  )
}

export default App
