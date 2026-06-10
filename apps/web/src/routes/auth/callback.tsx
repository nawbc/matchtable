import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { getBrowserSupabase } from '~/features/auth/client'
import {
  AUTH_REDIRECT_STORAGE_KEY,
  resolveAuthNavigationDestination,
} from '~/features/auth/post-auth'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    if (handledRef.current) return
    handledRef.current = true

    async function handleCallback() {
      const supabase = getBrowserSupabase()
      const params = new URLSearchParams(window.location.search)
      const errorDescription = params.get('error_description')

      if (errorDescription) {
        console.error('Auth callback provider error:', errorDescription)
        setErrorMessage(errorDescription)
        return
      }

      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error.message)
          setErrorMessage(error.message)
          return
        }
      } else {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          console.error('Auth session error:', error?.message ?? 'missing session')
          setErrorMessage('登录会话无效，请重试')
          return
        }
      }

      try {
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

    handleCallback()
  }, [navigate, queryClient])

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
