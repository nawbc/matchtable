import { redirect } from '@tanstack/react-router'

import { sessionQueryOptions } from '~/features/auth/queries'

export async function requireAdminRoute(context: {
  queryClient: import('@tanstack/react-query').QueryClient
}) {
  const session = await context.queryClient.fetchQuery(sessionQueryOptions)
  if (!session) {
    throw redirect({ to: '/login' })
  }
  if (!session.user.isAdmin) {
    throw redirect({ to: '/login' })
  }
  return session
}
