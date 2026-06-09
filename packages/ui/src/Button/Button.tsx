import { Slot } from '@radix-ui/react-slot'
import type { ButtonHTMLAttributes } from 'react'

import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  asChild = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <Comp className={classes} {...props} />
}
