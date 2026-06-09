import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

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
  return createSupabaseBrowserClient<Database>(url, anonKey)
}
