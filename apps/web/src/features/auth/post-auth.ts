import type { QueryClient } from '@tanstack/react-query'

import {
  isValidInternalRedirect,
  resolvePostAuthDestination,
  type PostAuthDestination,
} from '~/lib/auth-guard'

import { sessionQueryOptions } from './queries'
import { ensureUserProfile } from './server'

export type { PostAuthDestination } from '~/lib/auth-guard'

export const AUTH_REDIRECT_STORAGE_KEY = 'authRedirect'

async function refreshAuthQueries(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey })
  await queryClient.invalidateQueries({ queryKey: ['profile'] })
}

export async function completeAuthSession(queryClient: QueryClient): Promise<PostAuthDestination> {
  await ensureUserProfile()
  await refreshAuthQueries(queryClient)
  return resolvePostAuthDestination(queryClient)
}

export async function resolveAuthNavigationDestination(
  queryClient: QueryClient,
  redirectParam?: string | null,
): Promise<string> {
  await ensureUserProfile()
  await refreshAuthQueries(queryClient)

  if (redirectParam && isValidInternalRedirect(redirectParam)) {
    return redirectParam
  }
  return resolvePostAuthDestination(queryClient)
}
