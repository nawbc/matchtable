import { Button as RadixButton, type ButtonProps as RadixButtonProps } from '@radix-ui/themes'

type ButtonVariant = 'primary' | 'soft' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

const VARIANT_PROPS: Record<
  ButtonVariant,
  Pick<RadixButtonProps, 'variant' | 'color' | 'highContrast'>
> = {
  primary: { variant: 'solid', color: 'gray', highContrast: true },
  soft: { variant: 'soft', color: 'gray', highContrast: true },
  secondary: { variant: 'surface', color: 'gray' },
  ghost: { variant: 'ghost', color: 'gray' },
  danger: { variant: 'solid', color: 'red', highContrast: true },
}

const SIZE_MAP: Record<ButtonSize, RadixButtonProps['size']> = {
  sm: '1',
  md: '2',
  lg: '3',
  xl: '4',
}

export type ButtonProps = Omit<RadixButtonProps, 'variant' | 'size' | 'color' | 'highContrast'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  style,
  ...props
}: ButtonProps) {
  const radixVariant = VARIANT_PROPS[variant]

  return (
    <RadixButton
      size={SIZE_MAP[size]}
      style={{ width: fullWidth ? '100%' : undefined, ...style }}
      {...radixVariant}
      {...props}
    />
  )
}
