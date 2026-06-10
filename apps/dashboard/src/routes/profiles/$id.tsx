import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'

import { AdminLayout } from '~/components/AdminLayout/AdminLayout'
import { profileDetailQueryOptions } from '~/features/admin/queries'
import { deleteProfile, takedownProfile } from '~/features/admin/server'
import { requireAdminRoute } from '~/lib/admin-guard'
import { formatDateTime, profileStatusClass, profileStatusLabel } from '~/utils/status'

export const Route = createFileRoute('/profiles/$id')({
  beforeLoad: ({ context }) => requireAdminRoute(context),
  component: ProfileDetailPage,
})

function ProfileDetailPage() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const { data: profile, isLoading, error } = useQuery(profileDetailQueryOptions(id))

  const takedownMutation = useMutation({
    mutationFn: () => takedownProfile({ data: { profileId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfile({ data: { profileId: id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'profiles'] })
    },
  })

  return (
    <AdminLayout>
      <Link to="/profiles" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        ← 返回资料列表
      </Link>
      <h1 className="pageTitle">资料详情</h1>

      {isLoading ? <p className="emptyState">加载中…</p> : null}
      {error ? (
        <p style={{ color: 'var(--color-danger)' }}>
          {error instanceof Error ? error.message : '加载失败'}
        </p>
      ) : null}

      {profile ? (
        <>
          <div className="detailGrid">
            <div className="detailItem">
              <div className="detailLabel">资料 ID</div>
              <div className="detailValue">{profile.id}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">用户 ID</div>
              <div className="detailValue">
                <Link to="/users/$id" params={{ id: profile.userId }}>
                  {profile.userId}
                </Link>
              </div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">昵称</div>
              <div className="detailValue">{profile.nickname ?? '—'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">城市</div>
              <div className="detailValue">{profile.city ?? '—'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">职业</div>
              <div className="detailValue">{profile.occupation ?? '—'}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">状态</div>
              <div className="detailValue">
                <span className={`statusBadge ${profileStatusClass(profile.status)}`}>
                  {profileStatusLabel(profile.status)}
                </span>
              </div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">创建时间</div>
              <div className="detailValue">{formatDateTime(profile.createdAt)}</div>
            </div>
            <div className="detailItem">
              <div className="detailLabel">更新时间</div>
              <div className="detailValue">{formatDateTime(profile.updatedAt)}</div>
            </div>
          </div>

          {profile.bio ? (
            <section style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-sm)' }}>个人简介</h2>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-muted)' }}>
                {profile.bio}
              </p>
            </section>
          ) : null}

          <div className="actionBar">
            {profile.status !== 'takedown' ? (
              <Button
                variant="secondary"
                onClick={() => takedownMutation.mutate()}
                disabled={takedownMutation.isPending}
              >
                {takedownMutation.isPending ? '处理中…' : '下架资料'}
              </Button>
            ) : null}
            {profile.status !== 'deleted' ? (
              <Button
                variant="danger"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? '处理中…' : '删除资料'}
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </AdminLayout>
  )
}
