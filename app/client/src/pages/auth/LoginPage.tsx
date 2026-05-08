import { Button, Card, Checkbox, Form, Input, Typography } from 'antd'
import heroArtwork from '../../assets/hero.png'
import type { LoginFormValues } from '../../types/auth'
import './AuthPage.css'

const { Text, Title } = Typography

type LoginPageProps = {
  onNavigateRegister: () => void
  onLoginSuccess: () => void
}

export function LoginPage({
  onNavigateRegister,
  onLoginSuccess,
}: LoginPageProps) {
  const handleSubmit = () => {
    onLoginSuccess()
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <div className="login-brand" aria-label="Smart Home">
          <span className="login-brand-mark">S</span>
          <span>Smart Home</span>
        </div>
        <p>SMART BUILDING, LỰA CHỌN CHO MỌI GIA ĐÌNH</p>
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

            <div className="login-fields">
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
              <Button block htmlType="submit" size="large" type="primary">
                Đăng nhập
              </Button>
              <Button
                block
                className="auth-secondary-button"
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
