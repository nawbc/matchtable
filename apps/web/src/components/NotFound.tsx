import { Button, Card } from '@matchtable/ui'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import styles from './NotFound.module.css'

export function NotFound({ children }: { children?: ReactNode }) {
  return (
    <Card className={styles.root}>
      <div className={styles.message}>{children ?? <p>您访问的页面不存在。</p>}</div>
      <div className={styles.actions}>
        <Button type="button" variant="soft" onClick={() => window.history.back()}>
          返回
        </Button>
        <Link to="/">
          <Button>回到首页</Button>
        </Link>
      </div>
    </Card>
  )
}
