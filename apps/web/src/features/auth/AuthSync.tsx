import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { getBrowserSupabase } from '~/features/auth/client'
import { sessionQueryOptions } from '~/features/auth/queries'

export function AuthSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = getBrowserSupabase()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

  return null
}
