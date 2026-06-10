import { QueryClientProvider } from '@tanstack/react-query'
/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { AppHeader } from '~/components/AppHeader'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { AuthSync } from '~/features/auth/AuthSync'
import { sessionQueryOptions } from '~/features/auth/queries'
import type { RouterContext } from '~/lib/query-client'
import { seo } from '~/utils/seo'

import globalCss from '~/styles/global.css?url'

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions)
    return { session }
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'MatchTable — 结构化相亲资料平台',
        description: '发现、对比、连接 — 用结构化的相亲表找到合适的人。',
      }),
    ],
    links: [
      { rel: 'stylesheet', href: globalCss },
      { rel: 'manifest', href: '/site.webmanifest', color: '#ffffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const { queryClient, session } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <div className="appShell">
          <AuthSync />
          <AppHeader ssrSession={session ?? null} />
          <main className="main">
            <Outlet />
          </main>
        </div>
      </RootDocument>
    </QueryClientProvider>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
