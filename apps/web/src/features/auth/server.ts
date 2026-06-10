import { createServerFn } from '@tanstack/react-start'

import { getServerSupabase, requireAuthUserId } from '~/lib/supabase-server'

export type AuthSession = {
  user: {
    id: string
    email: string | null
    phone: string | null
    profileId: string | null
    hasProfile: boolean
  }
} | null

function defaultNickname(email: string | null | undefined, phone: string | null | undefined) {
  const fromEmail = email?.split('@')[0]?.trim()
  if (fromEmail) return fromEmail
  if (phone) return phone
  return '用户'
}

async function getProfileIdForUser(supabase: ReturnType<typeof getServerSupabase>, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('getProfileIdForUser error:', error.message)
    throw new Error(error.message)
  }

  return data?.id ?? null
}

function buildProfileStub(
  userId: string,
  email: string | null | undefined,
  phone: string | null | undefined,
) {
  return {
    user_id: userId,
    nickname: defaultNickname(email, phone),
    gender: null,
    birthday: null,
    avatar_url: null,
    height: null,
    weight: null,
    education: null,
    school: null,
    city: null,
    occupation: null,
    income: null,
    house: false,
    car: false,
    marital_status: null,
    accept_ldr: false,
    hobbies: null,
    requirements: null,
    bio: null,
    status: 'hidden',
  }
}

export const getAuthSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthSession> => {
    try {
      const supabase = getServerSupabase()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        console.info('No auth session')
        return null
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()

      return {
        user: {
          id: user.id,
          email: user.email ?? null,
          phone: user.phone ?? null,
          profileId: profile?.id ?? null,
          hasProfile: Boolean(profile),
        },
      }
    } catch (err) {
      console.info('Auth session unavailable:', err)
      return null
    }
  },
)

export const ensureUserProfile = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getServerSupabase()
  const userId = await requireAuthUserId()

  const existingId = await getProfileIdForUser(supabase, userId)
  if (existingId) {
    return { profileId: existingId, created: false as const }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: insertError } = await supabase
    .from('profiles')
    .insert(buildProfileStub(userId, user.email, user.phone))
    .select('id')
    .maybeSingle()

  if (insertError) {
    // Trigger or a parallel request may have created the profile first.
    if (insertError.code === '23505') {
      const profileId = await getProfileIdForUser(supabase, userId)
      if (profileId) {
        return { profileId, created: false as const }
      }
    }

    console.error('ensureUserProfile insert error:', insertError.message)
    throw new Error(insertError.message)
  }

  if (profile) {
    return { profileId: profile.id, created: true as const }
  }

  const profileId = await getProfileIdForUser(supabase, userId)
  if (!profileId) {
    throw new Error('Failed to initialize user profile')
  }

  return { profileId, created: false as const }
})

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = getServerSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out failed:', error.message)
    throw new Error(error.message)
  }
  return { success: true as const }
})
