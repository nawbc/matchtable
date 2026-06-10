import { Button } from '@matchtable/ui'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { signInWithOAuth } from '~/features/auth/client'
import { getAuthSession } from '~/features/auth/server'
import { redirectIfAdminAuthenticated } from '~/lib/admin-guard'
import type { RouterContext } from '~/lib/query-client'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    return (await redirectIfAdminAuthenticated(context)) ?? {}
  },
  component: LoginPage,
})

function LoginPage() {
  const { forbidden: routeForbidden } = Route.useRouteContext() as RouterContext & {
    forbidden?: boolean
  }
  const navigate = useNavigate()
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(routeForbidden ?? false)

  async function handleOAuth(provider: 'google' | 'apple' | 'github') {
    try {
      setOauthError(null)
      setForbidden(false)
      await signInWithOAuth(provider)
    } catch (err) {
      console.error('OAuth error:', err)
      setOauthError(err instanceof Error ? err.message : 'OAuth 登录失败')
    }
  }

  async function checkSession() {
    const session = await getAuthSession()
    if (!session) {
      setForbidden(false)
      return
    }
    if (session.user.isAdmin) {
      navigate({ to: '/' })
    } else {
      setForbidden(true)
    }
  }

  const showForbidden = forbidden || routeForbidden

  return (
    <div className="authCard">
      <h1 className="pageTitle">管理员登录</h1>
      <p className="pageSubtitle">仅限管理员账号访问</p>

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

      {showForbidden ? (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>
          当前账号无管理员权限，请联系系统管理员。
        </p>
      ) : null}

      <Button type="button" fullWidth variant="ghost" onClick={() => checkSession()}>
        已完成登录？点此继续
      </Button>
    </div>
  )
}
