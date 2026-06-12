import type { CSSProperties } from 'react'

import { HeroBackgroundImage } from './HeroBackgroundImage'

import styles from './HeroBackground.module.css'

const BACKGROUND_IMAGE_ID = 'matchtable'

/**
 * Radix page.client.tsx tealBackgroundImageStyle — @radix-ui/colors light scale hex values.
 * Base is pure white (blank areas); accent slots match sage/teal/mint/green/sky/crimson mapping.
 */
export const tealBackgroundImageStyle = {
  '--color-background-image-base': '#ffffff',
  '--color-background-image-accent-1': '#0099807c',
  '--color-background-image-accent-2': '#7ecfbd',
  '--color-background-image-accent-3': '#30a46c',
  '--color-background-image-accent-4': '#bee7f5',
  '--color-background-image-accent-5': '#ffe9f0',
  '--color-background-image-accent-6': '#00c0914c',
  '--color-background-image-accent-7': '#b8eae0',
} as CSSProperties

type HeroBackgroundProps = {
  className?: string
  /** When true, full-viewport app backdrop — mount once in __root, not per page. */
  fixed?: boolean
  style?: CSSProperties
}

export function HeroBackground({ className, fixed = false, style }: HeroBackgroundProps) {
  const rootClass = [styles.root, fixed ? styles.fixed : null, className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} aria-hidden>
      <HeroBackgroundImage
        id={BACKGROUND_IMAGE_ID}
        className={styles.svg}
        style={{ ...tealBackgroundImageStyle, ...style }}
      />
    </div>
  )
}
