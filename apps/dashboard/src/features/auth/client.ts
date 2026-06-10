import { createBrowserClient } from '@matchtable/api'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserSupabase() {
  if (!browserClient) {
    browserClient = createBrowserClient()
  }
  return browserClient
}

export async function signInWithOAuth(provider: 'google' | 'apple' | 'github') {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}
