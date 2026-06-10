import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { DataTable } from '~/components/DataTable/DataTable'
import { reportsListQueryOptions } from '~/features/admin/queries'
import { banReportedUser, resolveReport } from '~/features/admin/server'
import type { AdminReportRow } from '~/features/admin/server'
import { requireAdminRoute } from '~/lib/admin-guard'
import { formatDateTime, reportStatusClass, reportStatusLabel } from '~/utils/status'

export const Route = createFileRoute('/reports/')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: ReportsPage,
})

const columnHelper = createColumnHelper<AdminReportRow>()

function ReportActions({ report }: { report: AdminReportRow }) {
  const queryClient = useQueryClient()

  const resolveMutation = useMutation({
    mutationFn: () => resolveReport({ data: { reportId: report.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
    },
  })

  const banMutation = useMutation({
    mutationFn: () => banReportedUser({ data: { reportId: report.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  if (report.status === 'resolved') {
    return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>已处理</span>
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => resolveMutation.mutate()}
        disabled={resolveMutation.isPending}
      >
        标记已处理
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => banMutation.mutate()}
        disabled={banMutation.isPending}
      >
        封禁被举报用户
      </Button>
    </div>
  )
}

const columns: ColumnDef<AdminReportRow>[] = [
  columnHelper.accessor('reasonLabel', {
    header: '举报原因',
  }),
  columnHelper.accessor('detail', {
    header: '详情',
    cell: (info) => {
      const value = info.getValue()
      if (!value) return '—'
      return value.length > 60 ? `${value.slice(0, 60)}…` : value
    },
  }),
  columnHelper.accessor('reporterId', {
    header: '举报人',
    cell: (info) => (
      <Link to="/users/$id" params={{ id: info.getValue() }}>
        {info.getValue().slice(0, 8)}…
      </Link>
    ),
  }),
  columnHelper.accessor('targetUserId', {
    header: '被举报人',
    cell: (info) => (
      <Link to="/users/$id" params={{ id: info.getValue() }}>
        {info.getValue().slice(0, 8)}…
      </Link>
    ),
  }),
  columnHelper.accessor('status', {
    header: '状态',
    cell: (info) => (
      <span className={`statusBadge ${reportStatusClass(info.getValue())}`}>
        {reportStatusLabel(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: '举报时间',
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <ReportActions report={row.original} />,
  }),
]

function ReportsPage() {
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error } = useQuery(reportsListQueryOptions(page, pageSize))

  return (
    <AdminLayout>
      <h1 className="pageTitle">举报管理</h1>
      <p className="pageSubtitle">查看举报、标记已处理或封禁被举报用户</p>

      {isLoading ? <p className="emptyState">加载中…</p> : null}
      {error ? (
        <p style={{ color: 'var(--color-danger)' }}>
          {error instanceof Error ? error.message : '加载失败'}
        </p>
      ) : null}

      {data ? (
        <DataTable
          data={data.items}
          columns={columns}
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
        />
      ) : null}
    </AdminLayout>
  )
}
