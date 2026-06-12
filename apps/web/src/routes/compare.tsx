import { COMPARE_MAX, COMPARE_MIN, compareSearchSchema } from '@matchtable/shared'
import { Button, CompareTable, type CompareColumn } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { useEffect, useState } from 'react'

import { PageHeader } from '~/components/PageHeader'
import {
  compareStore,
  getCompareCount,
  hydrateCompareStore,
  removeFromCompare,
  togglePinOwnProfile,
} from '~/features/compare/store'
import { myProfileQueryOptions, profilesByIdsQueryOptions } from '~/features/profile/queries'
import { FavoriteButton } from '~/features/social/FavoriteButton'
import { RequestDialog } from '~/features/social/RequestDialog'
import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/compare')({
  validateSearch: (search) => compareSearchSchema.parse(search),
  beforeLoad: ({ context, location }) => requireAuth({ ...context, location }),
  component: ComparePage,
})

function ComparePage() {
  const search = Route.useSearch()
  const [storeReady, setStoreReady] = useState(false)

  useEffect(() => {
    hydrateCompareStore()
    setStoreReady(true)
  }, [])

  const compareState = useStore(compareStore)
  const profileIds = search.ids ? search.ids.split(',').filter(Boolean) : compareState.profileIds

  const { data: myProfile } = useQuery(myProfileQueryOptions)
  const { data: profiles = [], isLoading } = useQuery(profilesByIdsQueryOptions(profileIds))

  const columns: CompareColumn[] = []

  if (compareState.pinOwnProfile && myProfile) {
    columns.push({
      id: 'own',
      profile: myProfile,
      label: '我',
      isOwn: true,
    })
  } else if (compareState.pinOwnProfile && !myProfile) {
    columns.push({
      id: 'own-empty',
      profile: {
        id: 'own',
        nickname: '创建资料',
        gender: null,
        birthday: null,
        avatarUrl: null,
        height: null,
        weight: null,
        education: null,
        school: null,
        city: null,
        occupation: null,
        income: null,
        house: false,
        car: false,
        maritalStatus: null,
        acceptLdr: false,
        hobbies: null,
        requirements: null,
        bio: null,
        status: 'active',
        createdAt: '',
        updatedAt: '',
      },
      label: '我',
      isOwn: true,
    })
  }

  for (const profile of profiles) {
    columns.push({
      id: profile.id,
      profile,
      onRemove: () => removeFromCompare(profile.id),
      actions: (
        <>
          <Link to="/profile/$id" params={{ id: profile.id }}>
            <Button variant="ghost" style={{ width: '100%' }}>
              查看详情
            </Button>
          </Link>
          <FavoriteButton profileId={profile.id} />
          <RequestDialog profileId={profile.id} triggerLabel="发起牵线" />
        </>
      ),
    })
  }

  const count = getCompareCount(profileIds, compareState.pinOwnProfile, !!myProfile)

  if (!storeReady) {
    return <div className="skeleton" style={{ height: 400 }} />
  }

  return (
    <div>
      <PageHeader title="资料对比" subtitle={`横向对比 ${COMPARE_MIN}–${COMPARE_MAX} 份相亲表`} />

      <div className="compareControls">
        <label className="checkboxLabel">
          <input
            type="checkbox"
            checked={compareState.pinOwnProfile}
            onChange={() => togglePinOwnProfile()}
          />
          将我的资料固定为第一列
        </label>
        {!myProfile && compareState.pinOwnProfile ? (
          <Link to="/profile/create">创建你的相亲表 →</Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 400 }} />
      ) : count < COMPARE_MIN ? (
        <div className="emptyState">
          <p>请至少添加 {COMPARE_MIN} 份资料进行对比。</p>
          <Link to="/discover" search={{ sort: 'newest', page: 1, pageSize: 20 }}>
            浏览发现广场
          </Link>
        </div>
      ) : (
        <CompareTable columns={columns} pinOwnProfile={compareState.pinOwnProfile} />
      )}
    </div>
  )
}
