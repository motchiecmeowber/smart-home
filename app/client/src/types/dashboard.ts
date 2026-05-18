import type { ReactNode } from 'react'

export type DashboardRoute =
  | 'dashboard-devices'
  | 'dashboard-notifications'
  | 'dashboard-requests'
  | 'dashboard-settings'
  | 'dashboard-profile'

export type DashboardNavItem = {
  label: string
  route?: DashboardRoute
  icon: ReactNode
}

export type RoomDeviceType = {
  id: string
  name: string
  count: number
  shortName: string
}

export type RoomDeviceSummary = {
  id: string
  roomName: string
  devices: RoomDeviceType[]
}

export type SystemSettings = {
  language: string
  timezone: string
  emailNotification: boolean
  remoteControl: boolean
  gasThreshold: string
}
