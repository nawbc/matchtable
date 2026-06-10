import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { AuthMethodTabs, type AuthMethod } from '~/features/auth/components/AuthMethodTabs'
import { EmailRegisterForm } from '~/features/auth/components/EmailRegisterForm'
import { OAuthButtons } from '~/features/auth/components/OAuthButtons'
import { PhoneOtpForm } from '~/features/auth/components/PhoneOtpForm'
import { redirectIfAuthenticated } from '~/lib/auth-guard'

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => redirectIfAuthenticated(context),
  component: RegisterPage,
})

function RegisterPage() {
  const [method, setMethod] = useState<AuthMethod>('email')
  const [oauthError, setOauthError] = useState<string | null>(null)

  return (
    <div className="authCard">
      <header className="authHeader">
        <h1 className="pageTitle">创建账号</h1>
        <p className="pageSubtitle">加入 MatchTable，创建你的相亲表</p>
      </header>

      <AuthMethodTabs value={method} onChange={setMethod} />

      {method === 'email' ? <EmailRegisterForm /> : <PhoneOtpForm mode="register" />}

      <div className="divider">或使用第三方账号</div>

      <OAuthButtons mode="register" onError={setOauthError} />

      {oauthError ? <p className="authError">{oauthError}</p> : null}

      <p className="authFooterLink">
        已有账号？<Link to="/login">登录</Link>
      </p>
    </div>
  )
}
