import { redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '~/features/auth/queries'
import { myProfileQueryOptions } from '~/features/profile/queries'

export type PostAuthDestination = '/'

const GUEST_AUTH_PATHS = ['/login', '/register', '/forgot-password', '/auth/callback'] as const

export function isValidInternalRedirect(path: string | null | undefined): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return false
  }
  const pathname = path.split('?')[0]?.split('#')[0] ?? path
  if (GUEST_AUTH_PATHS.includes(pathname as (typeof GUEST_AUTH_PATHS)[number])) {
    return false
  }
  return true
}

export async function resolvePostAuthDestination(
  _queryClient: import('@tanstack/react-query').QueryClient,
): Promise<PostAuthDestination> {
  return '/'
}

export async function redirectIfAuthenticated(context: {
  queryClient: import('@tanstack/react-query').QueryClient
}) {
  const session = await context.queryClient.fetchQuery(sessionQueryOptions)
  if (!session) return

  throw redirect({ to: '/' })
}

export async function requireAuth(context: {
  queryClient: import('@tanstack/react-query').QueryClient
  location?: { href: string }
}) {
  const session = await context.queryClient.fetchQuery(sessionQueryOptions)
  if (!session) {
    const href = context.location?.href
    const redirectSearch =
      href && href.startsWith('/') && !href.startsWith('//') ? { redirect: href } : undefined
    throw redirect({
      to: '/login',
      search: redirectSearch,
    })
  }
  return session
}

export async function prefetchMyProfile(context: {
  queryClient: import('@tanstack/react-query').QueryClient
  location?: { href: string }
}) {
  await requireAuth(context)
  return context.queryClient.ensureQueryData(myProfileQueryOptions)
}
