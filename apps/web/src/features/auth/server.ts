import { createServerFn } from '@tanstack/react-start'

import { getServerSupabase } from '~/lib/supabase-server'

export type AuthSession = {
  user: {
    id: string
    email: string | null
    phone: string | null
  }
} | null

export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthSession> => {
    try {
      const supabase = getServerSupabase()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        console.info('No auth session')
        return null
      }
      return {
        user: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
        },
      }
    } catch (err) {
      console.info('Auth session unavailable:', err)
      return null
    }
  },
)

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getServerSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out failed:', error.message)
    throw new Error(error.message)
  }
  return { success: true as const }
})
