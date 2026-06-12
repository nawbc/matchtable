import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

import { createDocumentCookieStore } from './browser-cookies'
import type { Database } from './types'

export function getSupabaseEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (!url || !anonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
  }
  return { url, anonKey }
}

export function createBrowserClient() {
  const { url, anonKey } = getSupabaseEnv()

  // Store PKCE verifier in cookies (SSR-readable). Callback exchange runs on the server.
  const browserOptions =
    typeof document !== 'undefined'
      ? {
          cookies: createDocumentCookieStore(),
          auth: {
            detectSessionInUrl: false,
          },
        }
      : {
          auth: {
            detectSessionInUrl: false,
          },
        }

  return createSupabaseBrowserClient<Database>(url, anonKey, browserOptions)
}
