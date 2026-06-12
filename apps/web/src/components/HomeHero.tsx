import type { PublicProfile } from '@matchtable/shared'
import { Button } from '@matchtable/ui'
import { Link } from '@tanstack/react-router'

import type { AuthSession } from '~/features/auth/server'
import { ProfileCtaButton } from '~/features/profile/profile-cta'
import type { MyProfile } from '~/features/profile/server'

import { HomeHeroShowcase } from './HomeHeroShowcase'

import styles from './HomeHero.module.css'

type HomeHeroProps = {
  featured: PublicProfile[]
  session: AuthSession | null
  myProfile: MyProfile | null
}

function ArrowRightIcon() {
  return (
    <svg className={styles.badgeArrow} viewBox="0 0 15 15" fill="none" aria-hidden>
      <path
        d="M8 3L13 8L8 13M12 8H2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HomeHero({ featured, session, myProfile }: HomeHeroProps) {
  // Background is global in __root (HeroBackground fixed) — do not mount a local mesh here.
  return (
    <section className={styles.root}>
      <div className={styles.content}>
        <div className={styles.main}>
          <div className={styles.mainInner}>
            <Link
              to="/discover"
              search={{ sort: 'newest', page: 1, pageSize: 20 }}
              className={styles.badgeLink}
            >
              结构化相亲资料
              <ArrowRightIcon />
            </Link>
            <h1 className={styles.title}>
              清晰展示
              <br />
              横向对比
            </h1>
            <p className={styles.lead}>
              MatchTable 把相亲资料整理成结构化表格 — 一目了然的关键信息、多表横向对照、
              精致呈现，帮你更快找到合适的人。
            </p>
            <div className={styles.actions}>
              <Link to="/discover" search={{ sort: 'newest', page: 1, pageSize: 20 }}>
                <Button size="xl" fullWidth>
                  浏览发现广场
                </Button>
              </Link>
              <ProfileCtaButton
                ssrSession={session}
                ssrProfile={myProfile}
                variant="soft"
                size="xl"
                fullWidth
              />
            </div>
          </div>
        </div>
        <HomeHeroShowcase profiles={featured} />
      </div>
    </section>
  )
}
