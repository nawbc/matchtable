import { Button } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { DataTable } from '~/components/DataTable/DataTable'
import { profilesListQueryOptions } from '~/features/admin/queries'
import type { AdminProfileSummary } from '~/features/admin/server'
import { requireAdminRoute } from '~/lib/admin-guard'
import { formatDateTime, profileStatusClass, profileStatusLabel } from '~/utils/status'

export const Route = createFileRoute('/profiles/')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: ProfilesPage,
})

const columnHelper = createColumnHelper<AdminProfileSummary>()

const columns: ColumnDef<AdminProfileSummary>[] = [
  columnHelper.accessor('nickname', {
    header: '昵称',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('city', {
    header: '城市',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('status', {
    header: '状态',
    cell: (info) => (
      <span className={`statusBadge ${profileStatusClass(info.getValue())}`}>
        {profileStatusLabel(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('createdAt', {
    header: '创建时间',
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <Link to="/profiles/$id" params={{ id: row.original.id }}>
        <Button size="sm" variant="secondary">
          详情
        </Button>
      </Link>
    ),
  }),
]

function ProfilesPage() {
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error } = useQuery(profilesListQueryOptions(page, pageSize))

  return (
    <AdminLayout>
      <h1 className="pageTitle">资料管理</h1>
      <p className="pageSubtitle">查看、下架或删除用户资料</p>

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
