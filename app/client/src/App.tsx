import { useEffect, useState } from 'react'
import { ConfigProvider } from 'antd'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DevicesPage } from './pages/dashboard/DevicesPage'
import { ProfilePage } from './pages/dashboard/ProfilePage'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import type { AppRoute } from './types/auth'
import './App.css'

const routePaths: Record<AppRoute, string> = {
  login: '/login',
  register: '/register',
  'dashboard-devices': '/dashboard/devices',
  'dashboard-settings': '/dashboard/settings',
  'dashboard-profile': '/dashboard/profile',
}

function getAppRouteFromLocation(): AppRoute {
  if (window.location.pathname === routePaths.register) {
    return 'register'
  }

  if (window.location.pathname === routePaths['dashboard-devices']) {
    return 'dashboard-devices'
  }

  if (window.location.pathname === routePaths['dashboard-settings']) {
    return 'dashboard-settings'
  }

  if (window.location.pathname === routePaths['dashboard-profile']) {
    return 'dashboard-profile'
  }

  return 'login'
}

function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>(getAppRouteFromLocation)

  useEffect(() => {
    const syncRoute = () => {
      setAppRoute(getAppRouteFromLocation())
    }

    window.addEventListener('popstate', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
    }
  }, [])

  const navigateToAppRoute = (route: AppRoute) => {
    setAppRoute(route)

    if (window.location.pathname !== routePaths[route]) {
      window.history.pushState(null, '', routePaths[route])
    }
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
          Button: {
            primaryShadow: 'none',
          },
          Menu: {
            itemBorderRadius: 8,
          },
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

        {appRoute === 'dashboard-devices' && (
          <DashboardLayout
            activeRoute="dashboard-devices"
            onLogout={() => navigateToAppRoute('login')}
            onNavigateDevices={() => navigateToAppRoute('dashboard-devices')}
            onNavigateSettings={() => navigateToAppRoute('dashboard-settings')}
            onNavigateProfile={() => navigateToAppRoute('dashboard-profile')}
          >
            <DevicesPage />
          </DashboardLayout>
        )}

        {appRoute === 'dashboard-settings' && (
          <DashboardLayout
            activeRoute="dashboard-settings"
            onLogout={() => navigateToAppRoute('login')}
            onNavigateDevices={() => navigateToAppRoute('dashboard-devices')}
            onNavigateSettings={() => navigateToAppRoute('dashboard-settings')}
            onNavigateProfile={() => navigateToAppRoute('dashboard-profile')}
          >
            <SettingsPage />
          </DashboardLayout>
        )}

        {appRoute === 'dashboard-profile' && (
          <DashboardLayout
            activeRoute="dashboard-profile"
            onLogout={() => navigateToAppRoute('login')}
            onNavigateDevices={() => navigateToAppRoute('dashboard-devices')}
            onNavigateSettings={() => navigateToAppRoute('dashboard-settings')}
            onNavigateProfile={() => navigateToAppRoute('dashboard-profile')}
          >
            <ProfilePage />
          </DashboardLayout>
        )}
      </div>
    </ConfigProvider>
  )
}

export default App
