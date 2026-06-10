import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'

import { sessionQueryOptions } from '~/features/auth/queries'
import { signOut } from '~/features/auth/server'

import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { to: '/', label: '概览' },
  { to: '/users', label: '用户管理' },
  { to: '/profiles', label: '资料管理' },
  { to: '/reports', label: '举报管理' },
] as const

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { data: session } = useQuery(sessionQueryOptions)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const signOutMutation = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
      window.location.href = '/login'
    },
  })

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brand}>MatchTable</div>
          <div className={styles.brandSub}>管理后台</div>
        </div>
        <nav className={styles.nav} aria-label="管理导航">
          {NAV_ITEMS.map((item) => {
            const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[styles.navLink, active ? styles.navLinkActive : ''].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={styles.footer}>
          {session ? (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {session.user.email ?? session.user.phone ?? session.user.id}
            </span>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOutMutation.mutate()}
            disabled={signOutMutation.isPending}
          >
            退出登录
          </Button>
        </div>
      </aside>
      <div className={styles.content}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>MatchTable Admin Dashboard</span>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
