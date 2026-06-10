import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { getBrowserSupabase } from '~/features/auth/client'
import { getAuthSession } from '~/features/auth/server'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
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

      await queryClient.invalidateQueries({ queryKey: ['auth'] })
      const session = await getAuthSession()

      if (session?.user.isAdmin) {
        navigate({ to: '/' })
      } else {
        setErrorMessage('无管理员权限')
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
