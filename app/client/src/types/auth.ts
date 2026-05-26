export type LoginFormValues = {
  identifier: string
  password: string
  rememberSession: boolean
}

export type RegisterFormValues = {
  firstName: string
  lastName: string
  userName: string
  email: string
  password: string
  confirmPassword: string
}

export type User = {
  userId: string
  email: string
  username: string
  role: string
  createdAt: string
}

export type AuthSession = {
  accessToken: string
  user: User
}


export type AppRoute =
  | 'login'
  | 'register'
  | 'dashboard-devices'
  | 'dashboard-realtime'
  | 'dashboard-notifications'
  | 'dashboard-requests'
  | 'dashboard-settings'
  | 'dashboard-profile'
  | 'dashboard-statistics'
  | 'dashboard-schedules'
  | 'dashboard-overview'
// admin route
  | 'admin-dashboard'
  | 'admin-devices'
  | 'admin-users'
  | 'admin-requests'
  | 'admin-settings'
  | 'admin-profile'