import { Button, Input } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { createColumnHelper, type ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { DataTable } from '~/components/DataTable/DataTable'
import { usersSearchQueryOptions } from '~/features/admin/queries'
import type { AdminUserSummary } from '~/features/admin/server'
import { requireAdminRoute } from '~/lib/admin-guard'
import { formatDateTime } from '~/utils/status'

export const Route = createFileRoute('/users/')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: UsersPage,
})

const columnHelper = createColumnHelper<AdminUserSummary>()

const columns: ColumnDef<AdminUserSummary>[] = [
  columnHelper.accessor('email', {
    header: '邮箱',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('phone', {
    header: '手机',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('createdAt', {
    header: '注册时间',
    cell: (info) => formatDateTime(info.getValue()),
  }),
  columnHelper.accessor('banned', {
    header: '状态',
    cell: (info) => (
      <span className={info.getValue() ? 'statusBadge statusDanger' : 'statusBadge statusActive'}>
        {info.getValue() ? '已封禁' : '正常'}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: ({ row }) => (
      <Link to="/users/$id" params={{ id: row.original.id }}>
        <Button size="sm" variant="secondary">
          详情
        </Button>
      </Link>
    ),
  }),
]

function UsersPage() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error } = useQuery(usersSearchQueryOptions(search, page, pageSize))

  return (
    <AdminLayout>
      <h1 className="pageTitle">用户管理</h1>
      <p className="pageSubtitle">搜索、查看详情、封禁或解封用户</p>

      <form
        style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}
        onSubmit={(e) => {
          e.preventDefault()
          setSearch(query)
          setPage(1)
        }}
      >
        <Input
          label="搜索"
          placeholder="邮箱、手机或用户 ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" style={{ alignSelf: 'flex-end' }}>
          搜索
        </Button>
      </form>

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
