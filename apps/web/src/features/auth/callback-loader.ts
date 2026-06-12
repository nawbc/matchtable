import { getRequest } from '@tanstack/react-start/server'

import { getServerSupabase } from '~/lib/supabase-server'

export type AuthCallbackLoaderData = {
  exchangeError: string | null
  codePresent: boolean
}

export async function loadAuthCallback(): Promise<AuthCallbackLoaderData> {
  const request = getRequest()
  const url = new URL(request.url)
  const errorDescription = url.searchParams.get('error_description')

  if (errorDescription) {
    console.error('Auth callback provider error:', errorDescription)
    return { exchangeError: errorDescription, codePresent: false }
  }

  const code = url.searchParams.get('code')
  if (!code) {
    return { exchangeError: null, codePresent: false }
  }

  // PKCE: exchange on the server — verifier must live in cookies from OAuth sign-in.
  const supabase = getServerSupabase()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback exchange error:', error.message)
    return { exchangeError: error.message, codePresent: true }
  }

  return { exchangeError: null, codePresent: true }
}
