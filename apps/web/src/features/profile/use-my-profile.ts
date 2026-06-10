import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { myProfileQueryOptions } from './queries'
import type { MyProfile } from './server'

export function useMyProfile(ssrProfile: MyProfile | null | undefined) {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const { data: queryProfile } = useQuery({
    ...myProfileQueryOptions,
    enabled: hydrated,
    placeholderData: ssrProfile ?? undefined,
  })

  const profile = hydrated ? (queryProfile ?? null) : (ssrProfile ?? null)

  return { profile }
}
