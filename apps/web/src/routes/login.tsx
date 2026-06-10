import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AuthMethodTabs, type AuthMethod } from '~/features/auth/components/AuthMethodTabs'
import { EmailLoginForm } from '~/features/auth/components/EmailLoginForm'
import { OAuthButtons } from '~/features/auth/components/OAuthButtons'
import { PhoneOtpForm } from '~/features/auth/components/PhoneOtpForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const [method, setMethod] = useState<AuthMethod>('email')
  const [oauthError, setOauthError] = useState<string | null>(null)

  return (
    <div className="authCard">
      <header className="authHeader">
        <h1 className="pageTitle">登录</h1>
        <p className="pageSubtitle">欢迎回到 MatchTable</p>
      </header>

      <AuthMethodTabs value={method} onChange={setMethod} />

      {method === 'email' ? <EmailLoginForm /> : <PhoneOtpForm mode="login" />}

      <div className="divider">或使用第三方账号</div>

      <OAuthButtons mode="login" onError={setOauthError} />

      {oauthError ? <p className="authError">{oauthError}</p> : null}

      <p className="authFooterLink">
        还没有账号？<Link to="/register">注册</Link>
      </p>
    </div>
  )
}
