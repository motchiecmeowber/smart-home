import { useState } from 'react'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import heroArtwork from '../../assets/hero.png'
import type { RegisterFormValues } from '../../types/auth'
import { apiRegister } from '../../lib/authApi'
import './AuthPage.css'

const { Text, Title } = Typography

type RegisterPageProps = {
  onNavigateLogin: () => void
  onRegisterSuccess?: () => void
}

export function RegisterPage({ onNavigateLogin, onRegisterSuccess }: RegisterPageProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true)
    setError(null)

    try {
      await apiRegister({
        email: values.email,
        userName: values.userName,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      })

      setSuccess(true)
      onRegisterSuccess?.()

      // Auto-redirect to login after 1.5s
      setTimeout(() => onNavigateLogin(), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
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

      <section className="login-stage" aria-labelledby="register-title">
        <Card className="login-card">
          <aside className="login-visual" aria-hidden="true">
            <img src={heroArtwork} alt="" className="login-hero-art" />
            <span className="visual-label">Smart Home IoT</span>
          </aside>

          <Form<RegisterFormValues>
            className="login-panel"
            layout="vertical"
            onFinish={handleSubmit}
          >
            <div className="login-panel-heading">
              <Text className="login-kicker">Tạo tài khoản</Text>
              <Title id="register-title" level={1}>
                Đăng ký
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

            {success && (
              <Alert
                description="Đăng ký thành công! Đang chuyển về trang đăng nhập..."
                showIcon
                type="success"
              />
            )}

            <div className="login-fields">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Form.Item
                  label="Họ"
                  name="lastName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    autoComplete="family-name"
                    placeholder="Nguyễn"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Tên"
                  name="firstName"
                  rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input
                    autoComplete="given-name"
                    placeholder="Văn A"
                    size="large"
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Tên đăng nhập"
                name="userName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 2, message: 'Tối thiểu 2 ký tự' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ được chứa chữ cái, số và dấu _' },
                ]}
              >
                <Input
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email chưa đúng định dạng' },
                ]}
              >
                <Input
                  autoComplete="email"
                  placeholder="Nhập email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                />
              </Form.Item>
            </div>

            <div className="login-actions">
              <Button
                block
                htmlType="submit"
                loading={loading}
                size="large"
                type="primary"
              >
                Đăng ký
              </Button>
              <Button
                block
                className="auth-secondary-button"
                disabled={loading}
                size="large"
                onClick={onNavigateLogin}
              >
                Đã có tài khoản
              </Button>
            </div>
          </Form>
        </Card>
      </section>
    </main>
  )
}
