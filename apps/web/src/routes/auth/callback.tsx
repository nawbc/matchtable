import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { loadAuthCallback } from '~/features/auth/callback-loader'
import { getBrowserSupabase } from '~/features/auth/client'
import {
  AUTH_REDIRECT_STORAGE_KEY,
  resolveAuthNavigationDestination,
} from '~/features/auth/post-auth'

export const Route = createFileRoute('/auth/callback')({
  loader: () => loadAuthCallback(),
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { exchangeError, codePresent } = Route.useLoaderData()
  const [errorMessage, setErrorMessage] = useState<string | null>(exchangeError)
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    async function finishAuth() {
      if (exchangeError) {
        setErrorMessage(exchangeError)
        return
      }

      if (!codePresent) {
        const supabase = getBrowserSupabase()
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          console.error('Auth session error:', error?.message ?? 'missing session')
          setErrorMessage('登录会话无效，请重试')
          return
        }
      }

      try {
        const params = new URLSearchParams(window.location.search)
        const redirectParam =
          params.get('redirect') ?? sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY)
        sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY)

        const destination = await resolveAuthNavigationDestination(queryClient, redirectParam)
        navigate({ href: destination })
      } catch (err) {
        console.error('Post-auth setup error:', err)
        setErrorMessage(err instanceof Error ? err.message : '登录后初始化失败')
      }
    }

    finishAuth()
  }, [codePresent, exchangeError, navigate, queryClient])

  if (errorMessage) {
    return (
      <div className="emptyState">
        <p className="authError">{errorMessage}</p>
        <button type="button" className="authInlineLink" onClick={() => navigate({ to: '/login' })}>
          返回登录
        </button>
      </div>
    )
  }

  return (
    <div className="emptyState">
      <p>正在完成登录…</p>
    </div>
  )
}
