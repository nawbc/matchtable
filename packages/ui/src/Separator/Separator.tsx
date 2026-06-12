import { Separator as RadixSeparator } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

export type SeparatorProps = {
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'lg'
  className?: string
}

const SIZE_MAP: Record<'sm' | 'lg', ComponentProps<typeof RadixSeparator>['size']> = {
  sm: '2',
  lg: '4',
}

export function Separator({ orientation = 'horizontal', size = 'sm', className }: SeparatorProps) {
  return <RadixSeparator orientation={orientation} size={SIZE_MAP[size]} className={className} />
}
