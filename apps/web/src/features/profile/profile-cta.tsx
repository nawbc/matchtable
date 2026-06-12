import { Button } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { sessionQueryOptions } from '~/features/auth/queries'
import type { AuthSession } from '~/features/auth/server'

import { myProfileQueryOptions } from './queries'
import type { MyProfile } from './server'

export type ProfileCta = {
  label: string
  to: '/register' | '/profile/create' | '/profile/edit' | '/me'
  search?: { step: 'photos' }
}

export function resolveProfileCta(
  session: AuthSession | null | undefined,
  profile: MyProfile | null | undefined,
): ProfileCta {
  if (!session) {
    return { label: '创建账号', to: '/register' }
  }
  if (!profile) {
    return { label: '创建资料', to: '/profile/create' }
  }
  if (profile.status === 'hidden') {
    return { label: '完善资料', to: '/profile/edit', search: { step: 'photos' } }
  }
  return { label: '我的资料', to: '/me' }
}

export function resolveFeaturedEmptyMessage(
  session: AuthSession | null | undefined,
  profile: MyProfile | null | undefined,
): string {
  if (!session) {
    return '暂无资料，成为第一个创建者吧。'
  }
  if (!profile) {
    return '暂无资料，创建你的相亲表吧。'
  }
  return '暂无资料。'
}

type ProfileCtaButtonProps = {
  ssrSession?: AuthSession | null
  ssrProfile?: MyProfile | null
  variant?: 'primary' | 'soft' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
}

export function ProfileCtaButton({
  ssrSession,
  ssrProfile,
  variant = 'secondary',
  size,
  fullWidth,
}: ProfileCtaButtonProps) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const { data: querySession } = useQuery({
    ...sessionQueryOptions,
    enabled: hydrated,
  })

  const session = hydrated ? (querySession ?? null) : (ssrSession ?? null)

  const { data: queryProfile } = useQuery({
    ...myProfileQueryOptions,
    enabled: hydrated && !!session,
    placeholderData: ssrProfile ?? undefined,
  })

  const profile = hydrated ? (queryProfile ?? null) : (ssrProfile ?? null)
  const cta = resolveProfileCta(session, profile)

  return (
    <Link to={cta.to} search={cta.search}>
      <Button variant={variant} size={size} fullWidth={fullWidth}>
        {cta.label}
      </Button>
    </Link>
  )
}
