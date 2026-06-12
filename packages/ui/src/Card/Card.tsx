import { Card as RadixCard, Heading, Text } from '@radix-ui/themes'
import type { HTMLAttributes, ReactNode } from 'react'

import styles from './Card.module.css'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** glass = ThemesHeroLayout showcase panel (default); solid = plain Radix surface */
  variant?: 'solid' | 'glass'
}

export function Card({ variant = 'glass', className, children, ...props }: CardProps) {
  const classes = [variant === 'glass' ? styles.hero : undefined, className]
    .filter(Boolean)
    .join(' ')

  return (
    <RadixCard size="1" className={classes || undefined} {...props}>
      {children}
    </RadixCard>
  )
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}

export type CardTitleProps = {
  size?: 'md' | 'lg'
  className?: string
  children?: ReactNode
}

export function CardTitle({ size = 'md', className, children }: CardTitleProps) {
  const headingSize = size === 'lg' ? '5' : '4'
  return (
    <Heading size={headingSize} className={className}>
      {children}
    </Heading>
  )
}

export type CardDescriptionProps = {
  className?: string
  children?: ReactNode
}

export function CardDescription({ className, children }: CardDescriptionProps) {
  return (
    <Text as="p" size="2" color="gray" className={className}>
      {children}
    </Text>
  )
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </div>
  )
}
