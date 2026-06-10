import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { StatsCard, StatsGrid } from '~/components/StatsCard/StatsCard'
import { dashboardStatsQueryOptions } from '~/features/admin/queries'
import { requireAdminRoute } from '~/lib/admin-guard'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: DashboardHomePage,
})

function DashboardHomePage() {
  const { data: stats, isLoading, error } = useQuery(dashboardStatsQueryOptions)

  return (
    <AdminLayout>
      <h1 className="pageTitle">概览</h1>
      <p className="pageSubtitle">平台核心数据统计</p>

      {isLoading ? <p className="emptyState">加载中…</p> : null}
      {error ? (
        <p style={{ color: 'var(--color-danger)' }}>
          {error instanceof Error ? error.message : '加载失败'}
        </p>
      ) : null}

      {stats ? (
        <StatsGrid>
          <StatsCard label="用户总数" value={stats.totalUsers} />
          <StatsCard label="资料总数" value={stats.totalProfiles} />
          <StatsCard label="今日新增用户" value={stats.todayNewUsers} />
          <StatsCard label="今日新增资料" value={stats.todayNewProfiles} />
        </StatsGrid>
      ) : null}
    </AdminLayout>
  )
}
