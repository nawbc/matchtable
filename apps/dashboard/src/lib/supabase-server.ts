import { createServerClient, type CookieStore, type Database } from '@matchtable/api'
import type { SupabaseClient } from '@supabase/supabase-js'
import { deleteCookie, getCookies, getRequest, setCookie } from '@tanstack/react-start/server'

export function getCookieStore(): CookieStore {
  return {
    getAll() {
      return Object.entries(getCookies()).map(([name, value]) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        const options = cookie.options
        if (cookie.value) {
          setCookie(cookie.name, cookie.value, options)
        } else {
          deleteCookie(cookie.name, options)
        }
      }
    },
  }
}

export function getServerSupabase(): SupabaseClient<Database> {
  const request = getRequest()
  const cookieHeader = request.headers.get('cookie')
  const parsed = parseCookieHeader(cookieHeader)
  const cookieStore: CookieStore = {
    getAll() {
      return Object.entries(parsed).map(([name, value]) => ({ name, value }))
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        const options = cookie.options
        if (cookie.value) {
          setCookie(cookie.name, cookie.value, options)
          parsed[cookie.name] = cookie.value
        } else {
          deleteCookie(cookie.name, options)
          delete parsed[cookie.name]
        }
      }
    },
  }

  return createServerClient(cookieStore) as unknown as SupabaseClient<Database>
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
