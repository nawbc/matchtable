import type { HTMLAttributes } from 'react'

import styles from './Badge.module.css'

export type BadgeColor = 'gray' | 'teal' | 'amber' | 'red' | 'green'

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  color?: BadgeColor
}

export function Badge({ color = 'gray', className, children, ...props }: BadgeProps) {
  const classes = [styles.badge, styles[color], className].filter(Boolean).join(' ')
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
