import { createServerClient, type CookieStore } from '../supabase/server'

export async function requireAdmin(cookieStore: CookieStore): Promise<string> {
  const supabase = createServerClient(cookieStore)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  if (user.app_metadata?.role !== 'admin') {
    throw new Error('Forbidden')
  }

  return user.id
}
