import { formatRequirementsDisplay } from '@matchtable/shared'
import { Button, TableCard } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'

import { sessionQueryOptions } from '~/features/auth/queries'
import { addToCompare } from '~/features/compare/store'
import { getProfileById } from '~/features/profile/server'
import { ReportDialog } from '~/features/reports/ReportDialog'
import { FavoriteButton } from '~/features/social/FavoriteButton'
import { RequestDialog } from '~/features/social/RequestDialog'
import { seo } from '~/utils/seo'

export const Route = createFileRoute('/profile/$id')({
  loader: async ({ params }) => {
    const profile = await getProfileById({ data: params.id })
    if (!profile) throw notFound()
    return { profile }
  },
  head: ({ loaderData }) => {
    const nickname = loaderData?.profile.nickname ?? '匿名'
    const city = loaderData?.profile.city
    const occupation = loaderData?.profile.occupation
    const parts = [city, occupation].filter(Boolean)
    const description =
      parts.length > 0 ? `${nickname} — ${parts.join(' · ')}` : `${nickname} 的相亲资料详情`

    return {
      meta: [
        ...seo({
          title: `${nickname} — MatchTable`,
          description,
          image: loaderData?.profile.avatarUrl ?? undefined,
        }),
      ],
    }
  },
  component: ProfileDetailPage,
})

function ProfileDetailPage() {
  const { profile } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const requirementsDisplay = formatRequirementsDisplay(profile.requirements)
  const { data: session } = useQuery(sessionQueryOptions)

  function handleAddToCompare() {
    const result = addToCompare(profile.id, { isLoggedIn: !!session })
    if (result === 'login_required') {
      navigate({ to: '/login' })
      return
    }
    navigate({ to: '/compare', search: {} })
  }

  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 400 }} />}>
      <div className="detailHero">
        <div>
          {profile.photos.length > 0 ? (
            <div className="photoCarousel">
              {profile.photos.map((photo) => (
                <img key={photo.id} src={photo.url} alt={profile.nickname ?? '用户照片'} />
              ))}
            </div>
          ) : profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.nickname ?? '用户照片'}
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
          {requirementsDisplay ? (
            <section style={{ marginTop: 'var(--space-lg)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>择偶要求</h2>
              <p
                style={{
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {requirementsDisplay}
              </p>
            </section>
          ) : null}
          <div className="actionBar">
            {session ? (
              <Button onClick={handleAddToCompare}>加入对比</Button>
            ) : (
              <Link to="/login">
                <Button variant="secondary">加入对比</Button>
              </Link>
            )}
            <FavoriteButton profileId={profile.id} />
            <RequestDialog profileId={profile.id} />
            <ReportDialog profileId={profile.id} />
          </div>
        </div>
      </div>
    </Suspense>
  )
}
