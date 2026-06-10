import { COMPARE_MAX, COMPARE_MIN } from '@matchtable/shared'
import { Button, TableCard } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { favoritesQueryOptions } from '~/features/social/queries'
import { requireAuth } from '~/lib/auth-guard'

import styles from './favorites.module.css'

export const Route = createFileRoute('/me/favorites')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: FavoritesPage,
})

function FavoritesPage() {
  const navigate = useNavigate()
  const { data: favorites = [], isLoading } = useQuery(favoritesQueryOptions)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < COMPARE_MAX) {
        next.add(id)
      }
      return next
    })
  }

  function handleCompare() {
    if (selected.size < COMPARE_MIN) return
    const ids = [...selected].join(',')
    navigate({ to: '/compare', search: { ids } })
  }

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className="pageTitle">收藏</h1>
          <p className="pageSubtitle">收藏你喜欢的资料，多选后可进行对比</p>
        </div>
        {selected.size >= COMPARE_MIN ? (
          <Button onClick={handleCompare}>对比所选（{selected.size}）</Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 300 }} />
      ) : favorites.length === 0 ? (
        <p className="emptyState">暂无收藏。</p>
      ) : (
        <>
          <p className={styles.hint}>
            已选 {selected.size} / 最多 {COMPARE_MAX} 份（至少 {COMPARE_MIN} 份可对比）
          </p>
          <div className="grid">
            {favorites.map((profile) => {
              const checked = selected.has(profile.id)
              return (
                <div key={profile.id} className={styles.cardWrap}>
                  <label className={styles.selectLabel}>
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && selected.size >= COMPARE_MAX}
                      onChange={() => toggleSelect(profile.id)}
                    />
                    选择对比
                  </label>
                  <TableCard profile={profile} href={`/profile/${profile.id}`} />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
