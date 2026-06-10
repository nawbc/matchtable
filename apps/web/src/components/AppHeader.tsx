import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { signOutClient } from '~/features/auth/client'
import { sessionQueryOptions } from '~/features/auth/queries'
import type { AuthSession } from '~/features/auth/server'
import { signOut } from '~/features/auth/server'

import styles from './AppHeader.module.css'

type AppHeaderProps = {
  ssrSession: AuthSession
}

export function AppHeader({ ssrSession }: AppHeaderProps) {
  const queryClient = useQueryClient()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const { data: querySession } = useQuery({
    ...sessionQueryOptions,
    enabled: hydrated,
  })

  const session = hydrated ? (querySession ?? null) : ssrSession

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOutClient()
      await signOut()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      window.location.href = '/'
    },
  })

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        MatchTable
      </Link>
      <nav className={styles.nav} aria-label="主导航">
        <Link
          to="/discover"
          search={{ sort: 'newest', page: 1, pageSize: 20 }}
          className={styles.navLink}
          activeProps={{ className: styles.active }}
        >
          发现
        </Link>
        {session ? (
          <>
            <Link to="/me" className={styles.navLink} activeProps={{ className: styles.active }}>
              我的资料
            </Link>
            <Link
              to="/me/favorites"
              className={styles.navLink}
              activeProps={{ className: styles.active }}
            >
              收藏
            </Link>
            <Link
              to="/me/requests"
              className={styles.navLink}
              activeProps={{ className: styles.active }}
            >
              牵线
            </Link>
            <Link
              to="/compare"
              search={{}}
              className={styles.navLink}
              activeProps={{ className: styles.active }}
            >
              对比
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
            >
              退出登录
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.navLink} activeProps={{ className: styles.active }}>
              登录
            </Link>
            <Link
              to="/register"
              className={styles.navLink}
              activeProps={{ className: styles.active }}
            >
              注册
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
