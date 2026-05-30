import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Switch,
  Typography,
} from 'antd'
import {
  ApiOutlined,
  BellOutlined,
  CloudOutlined,
  GlobalOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import type { SystemSettings } from '../../../types/dashboard'
import { useAuth } from '../../../hooks/useAuth'
import '../CustomerPages.css'
import './SettingsPage.css'

const { Text, Title } = Typography

const initialSettings: SystemSettings = {
  language: 'vi',
  timezone: 'GMT+07:00',
  emailNotification: true,
  remoteControl: true,
  gasThreshold: '100ppm',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(initialSettings)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

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
        <Card
          className="settings-card"
          title={
            <Space className="settings-card-title">
              <span className="settings-icon">
                <GlobalOutlined />
              </span>
              <span>Thời gian và ngôn ngữ</span>
            </Space>
          }
        >
          <Row gutter={[24, 18]}>
            <Col md={12} xs={24}>
              <label className="settings-label" htmlFor="language">
                Ngôn ngữ
              </label>
              <Select
                id="language"
                onChange={(value) => updateSetting('language', value)}
                options={[
                  { value: 'vi', label: 'Tiếng Việt' },
                  { value: 'en', label: 'English' },
                ]}
                size="large"
                value={settings.language}
              />
            </Col>
            <Col md={12} xs={24}>
              <label className="settings-label" htmlFor="timezone">
                Múi giờ
              </label>
              <Select
                id="timezone"
                onChange={(value) => updateSetting('timezone', value)}
                options={[
                  { value: 'GMT-11:00', label: '(GMT-11:00) Samoa' },
                  { value: 'GMT-10:00', label: '(GMT-10:00) Hawaii' },
                  { value: 'GMT-08:00', label: '(GMT-08:00) Pacific Time (US & Canada)' },
                  { value: 'GMT-07:00', label: '(GMT-07:00) Mountain Time' },
                  { value: 'GMT-06:00', label: '(GMT-06:00) Central America, Mexico City' },
                  { value: 'GMT-05:00', label: '(GMT-05:00) Eastern Time, Bogota, Lima' },
                  { value: 'GMT-04:00', label: '(GMT-04:00) Atlantic Time, Caracas' },
                  { value: 'GMT-03:00', label: '(GMT-03:00) Brazil, Buenos Aires' },
                  { value: 'GMT+00:00', label: '(GMT+00:00) London, Lisbon, Casablanca' },
                  { value: 'GMT+01:00', label: '(GMT+01:00) Paris, Berlin, Madrid' },
                  { value: 'GMT+02:00', label: '(GMT+02:00) Cairo, Johannesburg' },
                  { value: 'GMT+03:00', label: '(GMT+03:00) Moscow, Riyadh, Nairobi' },
                  { value: 'GMT+05:30', label: '(GMT+05:30) Mumbai, New Delhi' },
                  { value: 'GMT+07:00', label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
                  { value: 'GMT+08:00', label: '(GMT+08:00) Beijing, Singapore, Hong Kong' },
                  { value: 'GMT+09:00', label: '(GMT+09:00) Tokyo, Seoul' },
                  { value: 'GMT+10:00', label: '(GMT+10:00) Sydney, Guam' },
                  { value: 'GMT+12:00', label: '(GMT+12:00) Auckland, Fiji' },
                ]}
                size="large"
                value={settings.timezone}
              />
            </Col>
          </Row>
        </Card>

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

            <Card
              className="settings-card"
              title={
                <Space className="settings-card-title">
                  <span className="settings-icon">
                    <CloudOutlined />
                  </span>
                  <span>Ngưỡng cho nồng độ gas</span>
                </Space>
              }
            >
              <div className="settings-row threshold-row">
                <Text>Nồng độ cảnh báo</Text>
                <Select
                  onChange={(value) => updateSetting('gasThreshold', value)}
                  options={[
                    { value: '80ppm', label: '80ppm' },
                    { value: '100ppm', label: '100ppm' },
                    { value: '120ppm', label: '120ppm' },
                    { value: '150ppm', label: '150ppm' },
                  ]}
                  size="large"
                  value={settings.gasThreshold}
                />
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="settings-actions">
        <Button icon={<SaveOutlined />} size="large" type="primary">
          Lưu cài đặt
        </Button>
      </div>
    </section>
  )
}
