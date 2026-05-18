import { useEffect, useState } from 'react'
import { ConfigProvider, Spin } from 'antd'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DevicesPage } from './pages/dashboard/DevicesPage'
import { NotificationsPage } from './pages/dashboard/NotificationsPage'
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
  'dashboard-settings': '/dashboard/settings',
  'dashboard-profile': '/dashboard/profile',
}

const DASHBOARD_ROUTES: AppRoute[] = [
  'dashboard-devices',
  'dashboard-notifications',
  'dashboard-requests',
  'dashboard-settings',
  'dashboard-profile',
]

function getAppRouteFromLocation(): AppRoute {
  const path = window.location.pathname

  if (path === routePaths.register) return 'register'
  if (path === routePaths['dashboard-devices']) return 'dashboard-devices'
  if (path === routePaths['dashboard-notifications']) return 'dashboard-notifications'
  if (path === routePaths['dashboard-requests']) return 'dashboard-requests'
  if (path === routePaths['dashboard-settings']) return 'dashboard-settings'
  if (path === routePaths['dashboard-profile']) return 'dashboard-profile'

  return 'login'
}

function App() {
  const auth = useAuth()
  const [appRoute, setAppRoute] = useState<AppRoute>(getAppRouteFromLocation)

  // useEffect(() => {
  //   authStore.tryRestore().then((authenticated) => {
  //     // If the user landed on a protected route but has no session, redirect
  //     if (!authenticated && DASHBOARD_ROUTES.includes(getAppRouteFromLocation())) {
  //       navigateToAppRoute('login')
  //     }
  //     // If already authenticated and on login/register, go to dashboard
  //     if (authenticated && (appRoute === 'login' || appRoute === 'register')) {
  //       navigateToAppRoute('dashboard-devices')
  //     }
  //   })
  // }, [])

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

  // if (auth.restoring) {
  //   return (
  //     <div style={{
  //       minHeight: '100svh',
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       background: '#eef3f6',
  //     }}>
  //       <Spin size="large" tip="Đang khôi phục phiên..." />
  //     </div>
  //   )
  // }

  const layoutProps = {
    onLogout: handleLogout,
    onNavigateDevices: () => navigateToAppRoute('dashboard-devices'),
    onNavigateNotifications: () => navigateToAppRoute('dashboard-notifications'),
    onNavigateRequests: () => navigateToAppRoute('dashboard-requests'),
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
            onLoginSuccess={() => navigateToAppRoute('dashboard-devices')}
            onNavigateRegister={() => navigateToAppRoute('register')}
          />
        )}

        {appRoute === 'register' && (
          <RegisterPage onNavigateLogin={() => navigateToAppRoute('login')} />
        )}

        {/* {DASHBOARD_ROUTES.includes(appRoute) && !auth.accessToken && (
          <LoginPage
            onLoginSuccess={() => navigateToAppRoute('dashboard-devices')}
            onNavigateRegister={() => navigateToAppRoute('register')}
          />
        )} */}

        {appRoute === 'dashboard-devices' && (
          // {appRoute === 'dashboard-devices' && auth.accessToken && (
          <DashboardLayout activeRoute="dashboard-devices" {...layoutProps}>
            <DevicesPage />
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

        {appRoute === 'dashboard-settings' && (
          // {appRoute === 'dashboard-settings' && auth.accessToken && (
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
      </div>
    </ConfigProvider>
  )
}

export default App
