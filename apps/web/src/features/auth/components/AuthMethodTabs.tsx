import { Flex, SegmentedControl } from '@matchtable/ui'

type AuthMethod = 'email' | 'phone'

type AuthMethodTabsProps = {
  value: AuthMethod
  onChange: (value: AuthMethod) => void
}

export function AuthMethodTabs({ value, onChange }: AuthMethodTabsProps) {
  return (
    <Flex justify="center" mb="3">
      <SegmentedControl.Root
        size="2"
        radius="full"
        value={value}
        onValueChange={(next) => {
          if (next === 'email' || next === 'phone') {
            onChange(next)
          }
        }}
        aria-label="登录方式"
      >
        <SegmentedControl.Item value="email">邮箱</SegmentedControl.Item>
        <SegmentedControl.Item value="phone">手机</SegmentedControl.Item>
      </SegmentedControl.Root>
    </Flex>
  )
}

export type { AuthMethod }
