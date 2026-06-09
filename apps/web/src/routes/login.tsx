import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { sendPhoneOtp, signInWithOAuth, verifyPhoneOtp } from '~/features/auth/client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const phoneForm = useForm({
    defaultValues: { phone: '', code: '' },
    onSubmit: async ({ value }) => {
      setOauthError(null)
      if (!otpSent) {
        await sendPhoneOtp(value.phone)
        setOtpSent(true)
        return
      }
      await verifyPhoneOtp(value.phone, value.code)
      navigate({ to: '/me' })
    },
  })

  async function handleOAuth(provider: 'google' | 'apple' | 'github') {
    try {
      setOauthError(null)
      await signInWithOAuth(provider)
    } catch (err) {
      console.error('OAuth error:', err)
      setOauthError(err instanceof Error ? err.message : 'OAuth 登录失败')
    }
  }

  return (
    <div className="authCard">
      <h1 className="pageTitle">登录</h1>
      <p className="pageSubtitle">欢迎回到 MatchTable</p>

      <div className="oauthButtons">
        <Button type="button" fullWidth onClick={() => handleOAuth('google')}>
          使用 Google 登录
        </Button>
        <Button type="button" fullWidth variant="secondary" onClick={() => handleOAuth('apple')}>
          使用 Apple 登录
        </Button>
        <Button type="button" fullWidth variant="secondary" onClick={() => handleOAuth('github')}>
          使用 GitHub 登录
        </Button>
      </div>

      {oauthError ? (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{oauthError}</p>
      ) : null}

      <div className="divider">或使用手机验证码</div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          phoneForm.handleSubmit()
        }}
      >
        <phoneForm.Field name="phone">
          {(field) => (
            <Input
              label="手机号码"
              type="tel"
              placeholder="+8613800138000"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={otpSent}
            />
          )}
        </phoneForm.Field>

        {otpSent ? (
          <phoneForm.Field name="code">
            {(field) => (
              <Input
                label="验证码"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </phoneForm.Field>
        ) : null}

        <phoneForm.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" fullWidth disabled={isSubmitting} style={{ marginTop: 16 }}>
              {otpSent ? (isSubmitting ? '验证中…' : '验证并登录') : '发送验证码'}
            </Button>
          )}
        </phoneForm.Subscribe>
      </form>

      <p style={{ marginTop: 24, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        还没有账号？<Link to="/register">注册</Link>
      </p>
    </div>
  )
}
