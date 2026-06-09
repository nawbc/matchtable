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
  get: (name: string) => string | undefined
  set: (name: string, value: string, options?: Record<string, unknown>) => void
}

export function createServerClient(cookieStore: CookieStore) {
  const { url, anonKey } = getServerEnv()
  return createSupabaseServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return Object.entries(getAllCookies(cookieStore)).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(
        cookiesToSet: Array<{
          name: string
          value: string
          options?: Record<string, unknown>
        }>,
      ) {
        for (const cookie of cookiesToSet) {
          cookieStore.set(cookie.name, cookie.value, cookie.options)
        }
      },
    },
  })
}

function getAllCookies(cookieStore: CookieStore): Record<string, string> {
  const result: Record<string, string> = {}
  const prefix = 'sb-'
  for (let i = 0; i < 20; i++) {
    const chunk = cookieStore.get(`${prefix}auth-token.${i}`)
    if (chunk) result[`${prefix}auth-token.${i}`] = chunk
  }
  const single = cookieStore.get(`${prefix}auth-token`)
  if (single) result[`${prefix}auth-token`] = single
  return result
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
  const cookieStore: CookieStore = {
    get: (name) => parsed[name],
    set: (name, value) => {
      parsed[name] = value
    },
  }
  return createServerClient(cookieStore)
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
