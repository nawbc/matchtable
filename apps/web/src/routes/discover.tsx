import {
  discoverFiltersSchema,
  EDUCATION_LABELS,
  EDUCATION_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
} from '@matchtable/shared'
import { Button, Card, TableCard } from '@matchtable/ui'
import { createFileRoute } from '@tanstack/react-router'
import { Suspense, useState } from 'react'

import { PageHeader } from '~/components/PageHeader'
import { ProfileCtaButton } from '~/features/profile/profile-cta'
import { myProfileQueryOptions } from '~/features/profile/queries'
import { listProfiles } from '~/features/profile/server'
import { seo } from '~/utils/seo'

export const Route = createFileRoute('/discover')({
  validateSearch: (search) =>
    discoverFiltersSchema.parse({
      ...search,
      page: search.page ?? 1,
      pageSize: search.pageSize ?? 20,
      sort: search.sort ?? 'newest',
    }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const session = context.session
    const myProfile = session
      ? await context.queryClient.ensureQueryData(myProfileQueryOptions)
      : null
    const data = await listProfiles({ data: deps })
    return { ...data, myProfile, session }
  },
  head: () => ({
    meta: [
      ...seo({
        title: '发现 — MatchTable',
        description: '浏览结构化的相亲表资料，按性别、城市、年龄等条件筛选。',
      }),
    ],
  }),
  component: DiscoverPage,
})

function DiscoverPage() {
  const data = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [localFilters, setLocalFilters] = useState(search)

  function applyFilters() {
    navigate({ search: { ...localFilters, page: 1 } })
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))
  const currentPage = data.page

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return
    navigate({ search: { ...search, page } })
  }

  return (
    <div>
      <PageHeader title="发现" subtitle="浏览结构化的相亲表资料">
        <ProfileCtaButton ssrSession={data.session} ssrProfile={data.myProfile} />
      </PageHeader>

      <Card variant="solid" className="filters">
        <div className="filterField">
          <label htmlFor="gender">性别</label>
          <select
            id="gender"
            value={localFilters.gender ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                gender: (e.target.value || undefined) as typeof f.gender,
              }))
            }
          >
            <option value="">全部</option>
            {GENDER_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABELS[g]}
              </option>
            ))}
          </select>
        </div>
        <div className="filterField">
          <label htmlFor="keyword">关键词</label>
          <input
            id="keyword"
            placeholder="昵称、城市、职业、简介"
            value={localFilters.keyword ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({ ...f, keyword: e.target.value || undefined }))
            }
          />
        </div>
        <div className="filterField">
          <label htmlFor="city">城市</label>
          <input
            id="city"
            value={localFilters.city ?? ''}
            onChange={(e) => setLocalFilters((f) => ({ ...f, city: e.target.value || undefined }))}
          />
        </div>
        <div className="filterField">
          <label htmlFor="ageMin">最小年龄</label>
          <input
            id="ageMin"
            type="number"
            value={localFilters.ageMin ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                ageMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
        <div className="filterField">
          <label htmlFor="ageMax">最大年龄</label>
          <input
            id="ageMax"
            type="number"
            value={localFilters.ageMax ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                ageMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
        <div className="filterField">
          <label htmlFor="heightMin">最低身高</label>
          <input
            id="heightMin"
            type="number"
            value={localFilters.heightMin ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                heightMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
        <div className="filterField">
          <label htmlFor="heightMax">最高身高</label>
          <input
            id="heightMax"
            type="number"
            value={localFilters.heightMax ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                heightMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>
        <div className="filterField">
          <label htmlFor="education">学历</label>
          <select
            id="education"
            value={localFilters.education ?? ''}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                education: (e.target.value || undefined) as typeof f.education,
              }))
            }
          >
            <option value="">全部</option>
            {EDUCATION_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {EDUCATION_LABELS[e]}
              </option>
            ))}
          </select>
        </div>
        <div className="filterField">
          <label htmlFor="sort">排序</label>
          <select
            id="sort"
            value={localFilters.sort}
            onChange={(e) =>
              setLocalFilters((f) => ({
                ...f,
                sort: e.target.value as 'newest' | 'recent',
              }))
            }
          >
            <option value="newest">最新发布</option>
            <option value="recent">最近活跃</option>
          </select>
        </div>
        <div className="filterActions">
          <Button type="button" onClick={applyFilters}>
            应用筛选
          </Button>
        </div>
      </Card>

      <Suspense fallback={<div className="skeleton" style={{ height: 300 }} />}>
        {data.profiles.length === 0 ? (
          <p className="emptyState">没有符合筛选条件的资料。</p>
        ) : (
          <div className="grid">
            {data.profiles.map((profile) => (
              <TableCard key={profile.id} profile={profile} href={`/profile/${profile.id}`} />
            ))}
          </div>
        )}
      </Suspense>

      {data.total > 0 ? (
        <nav className="pagination" aria-label="分页">
          <Button
            type="button"
            variant="soft"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            上一页
          </Button>
          <span className="paginationMeta">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            type="button"
            variant="soft"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            下一页
          </Button>
        </nav>
      ) : null}

      <p className="resultMeta">
        显示 {data.profiles.length} / {data.total} 条资料
      </p>
    </div>
  )
}
