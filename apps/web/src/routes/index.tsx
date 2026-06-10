import { Button, TableCard } from '@matchtable/ui'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Suspense } from 'react'

import { ProfileCtaButton, resolveFeaturedEmptyMessage } from '~/features/profile/profile-cta'
import { myProfileQueryOptions } from '~/features/profile/queries'
import { listProfiles } from '~/features/profile/server'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    const session = context.session
    const myProfile = session
      ? await context.queryClient.ensureQueryData(myProfileQueryOptions)
      : null
    const result = await listProfiles({
      data: { page: 1, pageSize: 6, sort: 'newest' },
    })
    return { featured: result.profiles.slice(0, 3), myProfile, session }
  },
  component: HomePage,
})

function HomePage() {
  const { featured, myProfile, session } = Route.useLoaderData()
  const emptyMessage = resolveFeaturedEmptyMessage(session, myProfile)

  return (
    <div>
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h1 className="pageTitle">相亲表</h1>
        <p className="pageSubtitle">结构化相亲资料 — 清晰展示、横向对比、精致呈现。</p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <Link to="/discover" search={{ sort: 'newest', page: 1, pageSize: 20 }}>
            <Button>浏览发现广场</Button>
          </Link>
          <ProfileCtaButton ssrSession={session} ssrProfile={myProfile} />
        </div>
      </section>

      <section>
        <h2 className="pageTitle" style={{ fontSize: '1.25rem' }}>
          最新资料
        </h2>
        <Suspense fallback={<div className="skeleton" style={{ height: 200 }} />}>
          {featured.length === 0 ? (
            <p className="emptyState">{emptyMessage}</p>
          ) : (
            <div className="grid">
              {featured.map((profile) => (
                <TableCard key={profile.id} profile={profile} href={`/profile/${profile.id}`} />
              ))}
            </div>
          )}
        </Suspense>
      </section>
    </div>
  )
}
