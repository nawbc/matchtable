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

export async function sendPhoneOtp(phone: string) {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signInWithOtp({ phone })
  if (error) throw error
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  if (error) throw error
}
