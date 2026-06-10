import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { getBrowserSupabase } from '~/features/auth/client'
import { getAuthSession } from '~/features/auth/server'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
})

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const supabase = getBrowserSupabase()
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error.message)
          navigate({ to: '/login' })
          return
        }
      } else {
        const { error } = await supabase.auth.getSession()
        if (error) {
          console.error('Auth session error:', error.message)
          navigate({ to: '/login' })
          return
        }
      }

      const session = await getAuthSession()
      if (session?.user.isAdmin) {
        navigate({ to: '/' })
      } else {
        navigate({ to: '/login' })
      }
    }
    handleCallback()
  }, [navigate])

  return (
    <div className="emptyState">
      <p>正在完成登录…</p>
    </div>
  )
}
