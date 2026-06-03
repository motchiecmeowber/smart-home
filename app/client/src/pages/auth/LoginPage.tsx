import { useState } from 'react'
import { Alert, Button, Card, Checkbox, Form, Input, Typography } from 'antd'
import heroArtwork from '../../assets/hero.png'
import type { LoginFormValues } from '../../types/auth'
import { apiLogin } from '../../lib/authApi'
import { authStore } from '../../lib/authStore'
import './AuthPage.css'

const { Text, Title } = Typography

type LoginPageProps = {
  onNavigateRegister: () => void
  onLoginSuccess: () => void
}

export function LoginPage({ onNavigateRegister, onLoginSuccess }: LoginPageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(() => {
    const saved = sessionStorage.getItem('auth_error')
    if (saved) {
      sessionStorage.removeItem('auth_error')
      return saved
    }
    return null
  })

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true)
    setError(null)

    try {
      const res = await apiLogin({
        identifier: values.identifier,
        password: values.password,
      })

      // ← Lưu token vào store (persist nếu "ghi nhớ đăng nhập")
      authStore.saveSession(
        res.data.accessToken,
        res.data.user,
        values.rememberSession,
      )

      onLoginSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand" aria-label="Smart Home">
          <span className="login-brand-mark">S</span>
          <span>Smart Home</span>
        </div>
        <p>SMART HOME, LỰA CHỌN CHO MỌI GIA ĐÌNH</p>
      </header>

      <section className="login-stage" aria-labelledby="login-title">
        <Card className="login-card">
          <aside className="login-visual" aria-hidden="true">
            <img src={heroArtwork} alt="" className="login-hero-art" />
            <span className="visual-label">Smart Home IoT</span>
          </aside>

          <Form<LoginFormValues>
            className="login-panel"
            initialValues={{ rememberSession: true }}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="login-panel-heading">
              <Text className="login-kicker">Xin chào</Text>
              <Title id="login-title" level={1}>
                Đăng nhập
              </Title>
            </div>

            {error && (
              <Alert
                closable
                description={error}
                showIcon
                type="error"
                onClose={() => setError(null)}
              />
            )}

            <div className="login-fields">
              <Form.Item
                label="Tên đăng nhập hoặc Email"
                name="identifier"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email' }]}
              >
                <Input
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập hoặc email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>
            </div>

            <Form.Item name="rememberSession" valuePropName="checked">
              <Checkbox>Ghi nhớ đăng nhập</Checkbox>
            </Form.Item>

            <div className="login-actions">
              <Button
                block
                htmlType="submit"
                loading={loading}
                size="large"
                type="primary"
              >
                Đăng nhập
              </Button>
              <Button
                block
                className="auth-secondary-button"
                disabled={loading}
                size="large"
                onClick={onNavigateRegister}
              >
                Đăng ký tài khoản
              </Button>
            </div>
          </Form>
        </Card>
      </section>
    </main>
  )
}
