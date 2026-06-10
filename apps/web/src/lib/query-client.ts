import { QueryClient } from '@tanstack/react-query'

import type { AuthSession } from '~/features/auth/server'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  })
}

export type RouterContext = {
  queryClient: QueryClient
  session?: AuthSession
}
