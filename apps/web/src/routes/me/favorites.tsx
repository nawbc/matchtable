import { createFileRoute } from '@tanstack/react-router'

import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/me/favorites')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: FavoritesPage,
})

function FavoritesPage() {
  return (
    <div>
      <h1 className="pageTitle">收藏</h1>
      <p className="pageSubtitle">第四阶段上线 — 收藏你喜欢的资料</p>
      <p className="emptyState">暂无收藏。</p>
    </div>
  )
}
