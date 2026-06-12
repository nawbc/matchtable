import { Box, Text, TextField } from '@radix-ui/themes'
import type { ComponentProps } from 'react'

export type InputProps = Omit<ComponentProps<typeof TextField.Root>, 'size' | 'variant'> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <Box>
      {label ? (
        <Text asChild size="1" weight="medium" mb="1">
          <label htmlFor={inputId}>{label}</label>
        </Text>
      ) : null}
      <TextField.Root id={inputId} size="2" variant="soft" className={className} {...props} />
      {error ? (
        <Text size="1" color="red" mt="1">
          {error}
        </Text>
      ) : null}
    </Box>
  )
}
