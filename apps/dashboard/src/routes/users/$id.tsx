import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { userDetailQueryOptions } from '~/features/admin/queries'
import { banUser, unbanUser } from '~/features/admin/server'
import { requireAdminRoute } from '~/lib/admin-guard'
import { formatDateTime, profileStatusClass, profileStatusLabel } from '~/utils/status'

export const Route = createFileRoute('/users/$id')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: UserDetailPage,
})

function UserDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: user, isLoading, error } = useQuery(userDetailQueryOptions(id))

  const banMutation = useMutation({
    mutationFn: () => banUser({ data: { userId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const unbanMutation = useMutation({
    mutationFn: () => unbanUser({ data: { userId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  return (
    <AdminLayout>
      <Link to="/users" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        ← 返回用户列表
      </Link>
      <h1 className="pageTitle">用户详情</h1>

      {isLoading ? <p className="emptyState">加载中…</p> : null}
      {error ? (
        <p style={{ color: 'var(--color-danger)' }}>
          {error instanceof Error ? error.message : '加载失败'}
        </p>
      ) : null}

      {user ? (
        <>
          <div className="detailGrid">
            <div className="detailItem">
              <div className="detailLabel">用户 ID</div>
              <div className="detailValue">{user.id}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">邮箱</div>
              <div className="detailValue">{user.email ?? '—'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">手机</div>
              <div className="detailValue">{user.phone ?? '—'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">角色</div>
              <div className="detailValue">{user.role ?? '普通用户'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">注册时间</div>
              <div className="detailValue">{formatDateTime(user.createdAt)}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">最近登录</div>
              <div className="detailValue">{formatDateTime(user.lastSignInAt)}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">账号状态</div>
              <div className="detailValue">
                <span className={`statusBadge ${user.banned ? 'statusDanger' : 'statusActive'}`}>
                  {user.banned ? '已封禁' : '正常'}
                </span>
              </div>
            </div>
          </div>

          {user.profile ? (
            <section style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-md)' }}>关联资料</h2>
              <div className="detailGrid">
                <div className="detailItem">
                  <div className="detailLabel">昵称</div>
                  <div className="detailValue">{user.profile.nickname ?? '—'}</div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">城市</div>
                  <div className="detailValue">{user.profile.city ?? '—'}</div>
                </div>
                <div className="detailItem">
                  <div className="detailLabel">资料状态</div>
                  <div className="detailValue">
                    <span className={`statusBadge ${profileStatusClass(user.profile.status)}`}>
                      {profileStatusLabel(user.profile.status)}
                    </span>
                  </div>
                </div>
              </div>
              <Link to="/profiles/$id" params={{ id: user.profile.id }}>
                <Button variant="secondary" size="sm">
                  查看资料详情
                </Button>
              </Link>
            </section>
          ) : (
            <p className="emptyState">该用户暂无资料</p>
          )}

          <div className="actionBar">
            {user.banned ? (
              <Button
                variant="secondary"
                onClick={() => unbanMutation.mutate()}
                disabled={unbanMutation.isPending}
              >
                {unbanMutation.isPending ? '处理中…' : '解封用户'}
              </Button>
            ) : (
              <Button
                variant="danger"
                onClick={() => banMutation.mutate()}
                disabled={banMutation.isPending}
              >
                {banMutation.isPending ? '处理中…' : '封禁用户'}
              </Button>
            )}
          </div>
        </>
      ) : null}
    </AdminLayout>
  )
}
