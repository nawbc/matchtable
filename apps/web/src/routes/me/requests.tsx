import { createFileRoute } from '@tanstack/react-router'

import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/me/requests')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: RequestsPage,
})

function RequestsPage() {
  return (
    <div>
      <h1 className="pageTitle">牵线请求</h1>
      <p className="pageSubtitle">第四阶段上线 — 发送与管理牵线请求</p>
      <p className="emptyState">暂无请求。</p>
    </div>
  )
}
