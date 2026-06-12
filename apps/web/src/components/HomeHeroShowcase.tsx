import type { PublicProfile } from '@matchtable/shared'
import type { ReactNode } from 'react'

import {
  ComparePreviewCard,
  DiscoverPreviewCard,
  RecentProfilesCard,
  ShowcaseTableCard,
} from './showcase/HomeShowcaseCards'

import styles from './HomeHero.module.css'

type HomeHeroShowcaseProps = {
  profiles: PublicProfile[]
}

function ShowcaseColumn({ offset, children }: { offset?: boolean; children: ReactNode }) {
  return (
    <div
      className={[styles.showcaseCol, offset ? styles.columnOffset : ''].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

export function HomeHeroShowcase({ profiles }: HomeHeroShowcaseProps) {
  const [first, second, third] = profiles
  const comparePair = first && second ? [first, second] : []

  return (
    <div className={styles.showcase}>
      <div className={styles.showcaseTrack}>
        <div className={styles.showcaseColumns}>
          <ShowcaseColumn>
            {comparePair.length >= 2 ? <ComparePreviewCard profiles={comparePair} /> : null}
            {first ? (
              <ShowcaseTableCard profile={first} />
            ) : (
              <div className={styles.skeletonCard} />
            )}
            <DiscoverPreviewCard />
          </ShowcaseColumn>

          <ShowcaseColumn offset>
            {second ? (
              <ShowcaseTableCard profile={second} />
            ) : first ? null : (
              <div className={styles.skeletonCard} />
            )}
            {third ? <ShowcaseTableCard profile={third} /> : null}
            <RecentProfilesCard profiles={profiles} />
          </ShowcaseColumn>
        </div>
      </div>
    </div>
  )
}
