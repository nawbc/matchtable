import { Button, TableCard } from '@matchtable/ui'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'

import { addToCompare } from '~/features/compare/store'
import { getProfileById } from '~/features/profile/server'

export const Route = createFileRoute('/profile/$id')({
  loader: async ({ params }) => {
    const profile = await getProfileById({ data: params.id })
    if (!profile) throw notFound()
    return { profile }
  },
  component: ProfileDetailPage,
})

function ProfileDetailPage() {
  const { profile } = Route.useLoaderData()
  const navigate = Route.useNavigate()

  function handleAddToCompare() {
    addToCompare(profile.id)
    navigate({ to: '/compare', search: {} })
  }

  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 400 }} />}>
      <div className="detailHero">
        <div>
          {profile.photos.length > 0 ? (
            <div className="photoCarousel">
              {profile.photos.map((photo) => (
                <img key={photo.id} src={photo.url} alt="" />
              ))}
            </div>
          ) : profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              style={{
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            />
          ) : null}
        </div>
        <div>
          <TableCard profile={profile} />
          {profile.bio ? (
            <section style={{ marginTop: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>个人简介</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{profile.bio}</p>
            </section>
          ) : null}
          {profile.requirements ? (
            <section style={{ marginTop: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>择偶要求</h2>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {profile.requirements}
              </p>
            </section>
          ) : null}
          <div className="actionBar">
            <Button onClick={handleAddToCompare}>加入对比</Button>
            <Button variant="secondary" disabled title="第四阶段上线">
              收藏
            </Button>
            <Button variant="secondary" disabled title="第四阶段上线">
              发送牵线
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  )
}
