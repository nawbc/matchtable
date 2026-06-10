import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

import type { Database } from './types'

function getServerEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY')
  }
  return { url, anonKey }
}

export type CookieStore = {
  getAll: () => Array<{ name: string; value: string }>
  setAll: (
    cookies: Array<{
      name: string
      value: string
      options?: Record<string, unknown>
    }>,
  ) => void
}

type CookieToSet = Parameters<CookieStore['setAll']>[0][number]

export function createServerClient(cookieStore: CookieStore) {
  const { url, anonKey } = getServerEnv()
  return createSupabaseServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookieStore.setAll(cookiesToSet)
      },
    },
  })
}

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) return {}
  const cookies: Record<string, string> = {}
  for (const part of header.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    cookies[trimmed.slice(0, eq)] = decodeURIComponent(trimmed.slice(eq + 1))
  }
  return cookies
}

export function createServerClientFromCookieHeader(cookieHeader: string | null) {
  const parsed = parseCookieHeader(cookieHeader)

  return createServerClient({
    getAll() {
      return Object.entries(parsed).map(([name, value]) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        if (cookie.value) {
          parsed[cookie.name] = cookie.value
        } else {
          delete parsed[cookie.name]
        }
      }
    },
  })
}

export function createServiceClient() {
  const { url } = getServerEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function createAnonServerClient() {
  const { url, anonKey } = getServerEnv()
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
