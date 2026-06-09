import { Button } from '@matchtable/ui'
import { ErrorComponent, Link, useLocation, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

import styles from './DefaultCatchBoundary.module.css'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useLocation({
    select: (location) => location.pathname === '/',
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div className={styles.root}>
      <ErrorComponent error={error} />
      <div className={styles.actions}>
        <Button type="button" onClick={() => router.invalidate()}>
          重试
        </Button>
        {isRoot ? (
          <Link to="/">
            <Button variant="secondary">首页</Button>
          </Link>
        ) : (
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>
            返回
          </Button>
        )}
      </div>
    </div>
  )
}
