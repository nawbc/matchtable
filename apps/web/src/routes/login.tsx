import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { AuthMethodTabs, type AuthMethod } from '~/features/auth/components/AuthMethodTabs'
import { EmailLoginForm } from '~/features/auth/components/EmailLoginForm'
import { OAuthButtons } from '~/features/auth/components/OAuthButtons'
import { PhoneOtpForm } from '~/features/auth/components/PhoneOtpForm'
import { AUTH_REDIRECT_STORAGE_KEY } from '~/features/auth/post-auth'
import { isValidInternalRedirect, redirectIfAuthenticated } from '~/lib/auth-guard'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: ({ context }) => redirectIfAuthenticated(context),
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectParam } = Route.useSearch()
  const [method, setMethod] = useState<AuthMethod>('email')
  const [oauthError, setOauthError] = useState<string | null>(null)

  useEffect(() => {
    if (redirectParam && isValidInternalRedirect(redirectParam)) {
      sessionStorage.setItem(AUTH_REDIRECT_STORAGE_KEY, redirectParam)
    }
  }, [redirectParam])

  return (
    <div className="authCard">
      <header className="authHeader">
        <h1 className="pageTitle">登录</h1>
        <p className="pageSubtitle">欢迎回到 MatchTable</p>
      </header>

      <AuthMethodTabs value={method} onChange={setMethod} />

      {method === 'email' ? (
        <EmailLoginForm redirect={redirectParam} />
      ) : (
        <PhoneOtpForm mode="login" redirect={redirectParam} />
      )}

      <div className="divider">或使用第三方账号</div>

      <OAuthButtons mode="login" onError={setOauthError} />

      {oauthError ? <p className="authError">{oauthError}</p> : null}

      <p className="authFooterLink">
        还没有账号？<Link to="/register">注册</Link>
      </p>
    </div>
  )
}
