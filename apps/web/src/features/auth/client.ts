import { createBrowserClient } from '@matchtable/api'

import { mapAuthError } from './errors'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export type OAuthProvider = 'google' | 'apple' | 'github'

export const OAUTH_PROVIDERS = [
  { id: 'google' as const, label: 'Google' },
  { id: 'apple' as const, label: 'Apple' },
  { id: 'github' as const, label: 'GitHub' },
] as const

export const formatAuthError = mapAuthError

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

export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export const signInWithEmail = signInWithEmailPassword

export async function signUpWithEmailPassword(email: string, password: string) {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signUpWithEmail(email: string, password: string) {
  const supabase = getBrowserSupabase()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback`,
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

export async function signOutClient() {
  const supabase = getBrowserSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
