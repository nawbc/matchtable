import { emailLoginSchema, emailRegisterSchema } from '@matchtable/shared'
import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { getMyProfile } from '~/features/profile/server'

import {
  OAUTH_PROVIDERS,
  formatAuthError,
  sendPhoneOtp,
  signInWithEmail,
  signInWithOAuth,
  signUpWithEmail,
  verifyPhoneOtp,
  type OAuthProvider,
} from './client'

import styles from './AuthPanel.module.css'

type AuthMethod = 'email' | 'phone'
type AuthMode = 'login' | 'register'

type AuthPanelProps = {
  mode: AuthMode
}

const COPY = {
  login: {
    title: '登录',
    subtitle: '欢迎回到 MatchTable',
    emailSubmit: '登录',
    emailSubmitting: '登录中…',
    phoneSubmit: '发送验证码',
    phoneVerify: '验证并登录',
    phoneVerifying: '验证中…',
    footer: '还没有账号？',
    footerLink: '注册',
    footerTo: '/register' as const,
    oauthDivider: '或使用第三方账号',
  },
  register: {
    title: '创建账号',
    subtitle: '加入 MatchTable，创建你的相亲表',
    emailSubmit: '注册',
    emailSubmitting: '注册中…',
    phoneSubmit: '发送验证码',
    phoneVerify: '验证并继续',
    phoneVerifying: '验证中…',
    footer: '已有账号？',
    footerLink: '登录',
    footerTo: '/login' as const,
    oauthDivider: '或使用第三方账号',
  },
} as const

export function AuthPanel({ mode }: AuthPanelProps) {
  const navigate = useNavigate()
  const copy = COPY[mode]
  const [method, setMethod] = useState<AuthMethod>('email')
  const [authError, setAuthError] = useState<string | null>(null)
  const [emailConfirmPending, setEmailConfirmPending] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)

  const emailForm = useForm({
    defaultValues:
      mode === 'login'
        ? { email: '', password: '' }
        : { email: '', password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      setAuthError(null)
      setEmailConfirmPending(false)

      if (mode === 'login') {
        const parsed = emailLoginSchema.safeParse(value)
        if (!parsed.success) {
          setAuthError(parsed.error.issues[0]?.message ?? '请检查输入')
          return
        }
        try {
          await signInWithEmail(parsed.data.email, parsed.data.password)
          const profile = await getMyProfile()
          navigate({ to: profile ? '/me' : '/profile/create' })
        } catch (err) {
          console.error('Email login error:', err)
          const message = err instanceof Error ? err.message : '邮箱登录失败'
          setAuthError(formatAuthError(message))
        }
        return
      }

      const parsed = emailRegisterSchema.safeParse(value)
      if (!parsed.success) {
        setAuthError(parsed.error.issues[0]?.message ?? '请检查输入')
        return
      }
      try {
        const { session } = await signUpWithEmail(parsed.data.email, parsed.data.password)
        if (session) {
          navigate({ to: '/profile/create' })
          return
        }
        setEmailConfirmPending(true)
      } catch (err) {
        console.error('Email register error:', err)
        const message = err instanceof Error ? err.message : '邮箱注册失败'
        setAuthError(formatAuthError(message))
      }
    },
  })

  const phoneForm = useForm({
    defaultValues: { phone: '', code: '' },
    onSubmit: async ({ value }) => {
      setAuthError(null)
      if (!otpSent) {
        try {
          await sendPhoneOtp(value.phone)
          setOtpSent(true)
        } catch (err) {
          console.error('Phone OTP error:', err)
          setAuthError(err instanceof Error ? err.message : '发送验证码失败')
        }
        return
      }
      try {
        await verifyPhoneOtp(value.phone, value.code)
        if (mode === 'login') {
          const profile = await getMyProfile()
          navigate({ to: profile ? '/me' : '/profile/create' })
        } else {
          navigate({ to: '/profile/create' })
        }
      } catch (err) {
        console.error('Phone verify error:', err)
        setAuthError(err instanceof Error ? err.message : '验证码错误')
      }
    },
  })

  function switchMethod(next: AuthMethod) {
    setMethod(next)
    setAuthError(null)
    setEmailConfirmPending(false)
    setOtpSent(false)
  }

  async function handleOAuth(provider: OAuthProvider) {
    try {
      setAuthError(null)
      setOauthLoading(provider)
      await signInWithOAuth(provider)
    } catch (err) {
      console.error('OAuth error:', err)
      setAuthError(err instanceof Error ? err.message : 'OAuth 失败')
      setOauthLoading(null)
    }
  }

  return (
    <div className={styles.authCard}>
      <h1 className="pageTitle">{copy.title}</h1>
      <p className="pageSubtitle">{copy.subtitle}</p>

      <div className={styles.methodTabs} role="tablist" aria-label="登录方式">
        <button
          type="button"
          role="tab"
          aria-selected={method === 'email'}
          className={[styles.methodTab, method === 'email' ? styles.methodTabActive : ''].join(' ')}
          onClick={() => switchMethod('email')}
        >
          邮箱
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === 'phone'}
          className={[styles.methodTab, method === 'phone' ? styles.methodTabActive : ''].join(' ')}
          onClick={() => switchMethod('phone')}
        >
          手机
        </button>
      </div>

      {method === 'email' ? (
        <div className={styles.methodPanel} role="tabpanel">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              emailForm.handleSubmit()
            }}
          >
            <emailForm.Field name="email">
              {(field) => (
                <Input
                  label="邮箱"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </emailForm.Field>

            <emailForm.Field name="password">
              {(field) => (
                <Input
                  label="密码"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'register' ? '至少 8 个字符' : undefined}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </emailForm.Field>

            {mode === 'register' ? (
              <emailForm.Field name="confirmPassword">
                {(field) => (
                  <Input
                    label="确认密码"
                    type="password"
                    autoComplete="new-password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </emailForm.Field>
            ) : null}

            <emailForm.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {isSubmitting ? copy.emailSubmitting : copy.emailSubmit}
                </Button>
              )}
            </emailForm.Subscribe>
          </form>

          {emailConfirmPending ? (
            <p className={styles.notice}>
              验证邮件已发送，请查收邮箱并点击链接完成注册，然后 <Link to="/login">登录</Link>。
            </p>
          ) : null}
        </div>
      ) : (
        <div className={styles.methodPanel} role="tabpanel">
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
                  autoComplete="tel"
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
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </phoneForm.Field>
            ) : null}

            <phoneForm.Subscribe selector={(s) => s.isSubmitting}>
              {(isSubmitting) => (
                <Button
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  className={styles.submitBtn}
                >
                  {otpSent
                    ? isSubmitting
                      ? copy.phoneVerifying
                      : copy.phoneVerify
                    : copy.phoneSubmit}
                </Button>
              )}
            </phoneForm.Subscribe>
          </form>
        </div>
      )}

      {authError ? <p className={styles.error}>{authError}</p> : null}

      <div className={styles.divider}>{copy.oauthDivider}</div>

      <div className={styles.oauthGrid}>
        {OAUTH_PROVIDERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={styles.oauthBtn}
            disabled={oauthLoading !== null}
            onClick={() => handleOAuth(id)}
          >
            <span className={styles.oauthIcon}>{label.slice(0, 1)}</span>
            {oauthLoading === id ? '跳转中…' : label}
          </button>
        ))}
      </div>

      <p className={styles.footer}>
        {copy.footer}
        <Link to={copy.footerTo}>{copy.footerLink}</Link>
      </p>
    </div>
  )
}
