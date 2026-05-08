export type LoginFormValues = {
  username: string
  password: string
  rememberSession: boolean
}

export type RegisterFormValues = {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type AppRoute =
  | 'login'
  | 'register'
  | 'dashboard-devices'
  | 'dashboard-settings'
  | 'dashboard-profile'
