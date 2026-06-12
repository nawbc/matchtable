import { Theme } from '@radix-ui/themes'
import type { ReactNode } from 'react'

/** Radix Themes root — matches website ExampleThemesEcommerce showcase (gray accent). */
export function MatchTableTheme({ children }: { children: ReactNode }) {
  return (
    <Theme
      accentColor="gray"
      grayColor="gray"
      scaling="100%"
      appearance="light"
      hasBackground={false}
    >
      {children}
    </Theme>
  )
}
