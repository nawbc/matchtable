import { TableCard } from '@matchtable/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

import { HomeHero } from '~/components/HomeHero'
import { resolveFeaturedEmptyMessage } from '~/features/profile/profile-cta'
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
    return { featured: result.profiles, myProfile, session }
  },
  component: HomePage,
})

function HomePage() {
  const { featured, myProfile, session } = Route.useLoaderData()
  const emptyMessage = resolveFeaturedEmptyMessage(session, myProfile)

  return (
    <>
      <div className="homeHeroBleed">
        <HomeHero featured={featured} session={session} myProfile={myProfile} />
      </div>

      <section className="homeFeatured">
        <h2 className="homeFeaturedTitle">最新资料</h2>
        <p className="homeFeaturedDesc">浏览最近更新的公开相亲表，点击进入详情或加入对比。</p>
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
    </>
  )
}
