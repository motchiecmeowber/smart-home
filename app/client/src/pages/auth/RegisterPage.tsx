import { Button, Card, Form, Input, Typography } from 'antd'
import heroArtwork from '../../assets/hero.png'
import type { RegisterFormValues } from '../../types/auth'
import './AuthPage.css'

const { Text, Title } = Typography

type RegisterPageProps = {
  onNavigateLogin: () => void
}

export function RegisterPage({ onNavigateLogin }: RegisterPageProps) {
  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand" aria-label="Smart Home">
          <span className="login-brand-mark">S</span>
          <span>Smart Home</span>
        </div>
        <p>SMART BUILDING, LỰA CHỌN CHO MỌI GIA ĐÌNH</p>
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
            onFinish={() => undefined}
          >
            <div className="login-panel-heading">
              <Text className="login-kicker">Tạo tài khoản</Text>
              <Title id="register-title" level={1}>
                Đăng ký
              </Title>
            </div>

            <div className="login-fields">
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input
                  autoComplete="name"
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
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
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
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
              <Button block htmlType="submit" size="large" type="primary">
                Đăng ký
              </Button>
              <Button
                block
                className="auth-secondary-button"
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
