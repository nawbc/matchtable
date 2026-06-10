import { QueryClientProvider } from '@tanstack/react-query'
/// <reference types="vite/client" />
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import type { RouterContext } from '~/lib/query-client'
import { seo } from '~/utils/seo'

import globalCss from '~/styles/global.css?url'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({
        title: 'MatchTable 管理后台',
        description: 'MatchTable 管理后台 — 用户、资料与举报管理。',
      }),
    ],
    links: [{ rel: 'stylesheet', href: globalCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <Outlet />
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
