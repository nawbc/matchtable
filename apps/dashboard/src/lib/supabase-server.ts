import {
  createServerClientFromCookieHeader,
  type CookieStore,
  type Database,
} from '@matchtable/api'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getRequest } from '@tanstack/react-start/server'

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) return {}
  const cookies: Record<string, string> = {}
  for (const part of header.split(';')) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const name = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    cookies[name] = decodeURIComponent(value)
  }
  return cookies
}

export function getCookieStore(): CookieStore {
  const request = getRequest()
  const cookies = parseCookieHeader(request.headers.get('cookie'))

  return {
    get: (name) => cookies[name],
    set: (name, value) => {
      cookies[name] = value
    },
  }
}

export function getServerSupabase(): SupabaseClient<Database> {
  const request = getRequest()
  return createServerClientFromCookieHeader(
    request.headers.get('cookie'),
  ) as unknown as SupabaseClient<Database>
}
