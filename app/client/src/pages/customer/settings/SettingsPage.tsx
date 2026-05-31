import { useEffect, useState } from 'react'
import { Button, Card, Space, Switch, Typography, message } from 'antd'
import { ApiOutlined, BellOutlined, SaveOutlined } from '@ant-design/icons'
import type { SystemSettings } from '../../../types/dashboard'
import { useAuth } from '../../../hooks/useAuth'
import { apiGetProfile, apiUpdateProfile } from '../../../lib/userApi'
import '../CustomerPages.css'
import './SettingsPage.css'

const { Text, Title } = Typography

const initialSettings: SystemSettings = {
  language: 'vi',
  timezone: 'GMT+07:00',
  emailNotification: true,
  remoteControl: true,
  gasThreshold: '100%',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    const fetchSettings = async () => {
      let currentSettings = { ...initialSettings }
      const saved = localStorage.getItem('system_settings')
      if (saved) {
        try {
          currentSettings = { ...currentSettings, ...JSON.parse(saved) }
        } catch (e) {
          console.error(e)
        }
      }

      if (user && user.role !== 'ADMIN') {
        try {
          const profile = await apiGetProfile()
          if (profile.emailNotification !== undefined) {
            currentSettings.emailNotification = profile.emailNotification
          }
        } catch (e) {
          console.error('Failed to load profile settings', e)
        }
      }

      setSettings(currentSettings)
    }

    fetchSettings()
  }, [user])

  const handleSave = async () => {
    localStorage.setItem('system_settings', JSON.stringify(settings))

    if (user && user.role !== 'ADMIN') {
      try {
        await apiUpdateProfile({
          emailNotification: settings.emailNotification
        })
      } catch (error: any) {
        message.error('Lỗi lưu cài đặt email lên máy chủ: ' + error.message)
        return
      }
    }

    message.success('Cập nhật cài đặt hệ thống thành công!')
  }

  const updateSetting = <TKey extends keyof SystemSettings>(
    key: TKey,
    value: SystemSettings[TKey],
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }))
  }

  return (
    <section className="customer-page" aria-labelledby="settings-title">
      <div className="customer-heading">
        <div className="customer-heading-left">
          <Title id="settings-title" level={1} className="customer-title">
            Cài đặt hệ thống
          </Title>
        </div>
      </div>

      <div className="settings-list">
        {!isAdmin && (
          <>
            <Card
              className="settings-card"
              title={
                <Space className="settings-card-title">
                  <span className="settings-icon">
                    <BellOutlined />
                  </span>
                  <span>Thông báo</span>
                </Space>
              }
            >
              <div className="settings-row">
                <Text>Nhận thông báo qua Email</Text>
                <Switch
                  checked={settings.emailNotification}
                  onChange={(checked) =>
                    updateSetting('emailNotification', checked)
                  }
                />
              </div>
            </Card>

            <Card
              className="settings-card"
              title={
                <Space className="settings-card-title">
                  <span className="settings-icon">
                    <ApiOutlined />
                  </span>
                  <span>Điều khiển từ xa</span>
                </Space>
              }
            >
              <div className="settings-row">
                <Text>Cho phép điều khiển thiết bị từ xa</Text>
                <Switch
                  checked={settings.remoteControl}
                  onChange={(checked) => updateSetting('remoteControl', checked)}
                />
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="settings-actions">
        <Button icon={<SaveOutlined />} size="large" type="primary" onClick={handleSave}>
          Lưu cài đặt
        </Button>
      </div>
    </section>
  )
}