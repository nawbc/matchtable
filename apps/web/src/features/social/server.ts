import {
  PUBLIC_PROFILE_COLUMNS,
  toProfileWithPhotos,
  toPublicProfile,
  type DbProfile,
  type DbProfilePhoto,
} from '@matchtable/api'
import {
  connectionRequestSchema,
  favoriteSchema,
  type ConnectionRequest,
  type ConnectionRequestInput,
  type ContactFields,
  type ProfileWithPhotos,
  type PublicProfile,
  type RequestStatus,
  type RequestWithProfile,
} from '@matchtable/shared'
import { createServerFn } from '@tanstack/react-start'

import { getServerSupabase, requireAuthUserId } from '~/lib/supabase-server'

type DbRequest = {
  id: string
  from_user_id: string
  to_user_id: string
  message: string | null
  status: string
  created_at: string
}

function toConnectionRequest(row: DbRequest): ConnectionRequest {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    message: row.message,
    status: row.status as RequestStatus,
    createdAt: row.created_at,
  }
}

async function fetchActiveProfileByUserId(
  supabase: ReturnType<typeof getServerSupabase>,
  userId: string,
): Promise<PublicProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!profile) return null
  return toPublicProfile(profile as DbProfile)
}

async function fetchProfilesWithPhotos(
  supabase: ReturnType<typeof getServerSupabase>,
  profileIds: string[],
): Promise<ProfileWithPhotos[]> {
  if (profileIds.length === 0) return []

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(PUBLIC_PROFILE_COLUMNS)
    .in('id', profileIds)
    .eq('status', 'active')

  if (error) throw new Error(error.message)

  const results: ProfileWithPhotos[] = []
  for (const row of profiles ?? []) {
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', row.id)
      .order('sort_order')
    results.push(toProfileWithPhotos(row as DbProfile, (photos ?? []) as DbProfilePhoto[]))
  }

  const order = new Map(profileIds.map((id, index) => [id, index]))
  return results.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}

async function getRequestById(supabase: ReturnType<typeof getServerSupabase>, id: string) {
  const { data: request, error } = await supabase.from('requests').select('*').eq('id', id).single()
  if (error || !request) throw new Error('Request not found')
  return request as DbRequest
}

export const toggleFavorite = createServerFn({ method: 'POST' })
  .validator((profileId: string) => favoriteSchema.shape.profileId.parse(profileId))
  .handler(async ({ data: profileId }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: existing, error: selectError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('profile_id', profileId)
      .maybeSingle()

    if (selectError) throw new Error(selectError.message)

    if (existing) {
      const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
      if (error) throw new Error(error.message)
      return { favorited: false as const }
    }

    const { error } = await supabase.from('favorites').insert({
      user_id: userId,
      profile_id: profileId,
    })
    if (error) throw new Error(error.message)
    return { favorited: true as const }
  })

export const listFavorites = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProfileWithPhotos[]> => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select('profile_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    if (!favorites?.length) return []

    const profileIds = favorites.map((f) => f.profile_id)
    return fetchProfilesWithPhotos(supabase, profileIds)
  },
)

export const getProfileOwnerUserId = createServerFn({ method: 'GET' })
  .validator((profileId: string) => profileId)
  .handler(async ({ data: profileId }): Promise<string> => {
    await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', profileId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!profile) throw new Error('Profile not found')
    return profile.user_id
  })

export const sendRequest = createServerFn({ method: 'POST' })
  .validator((data: ConnectionRequestInput) => connectionRequestSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireAuthUserId()
    if (data.toUserId === userId) {
      throw new Error('不能向自己发送牵线请求')
    }

    const supabase = getServerSupabase()

    const { data: existing, error: dupError } = await supabase
      .from('requests')
      .select('id')
      .eq('from_user_id', userId)
      .eq('to_user_id', data.toUserId)
      .eq('status', 'pending')
      .maybeSingle()

    if (dupError) throw new Error(dupError.message)
    if (existing) throw new Error('已有待处理的牵线请求')

    const { data: request, error } = await supabase
      .from('requests')
      .insert({
        from_user_id: userId,
        to_user_id: data.toUserId,
        message: data.message?.trim() || null,
        status: 'pending',
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return toConnectionRequest(request as DbRequest)
  })

async function listRequestsWithProfiles(
  filter: 'sent' | 'received',
): Promise<RequestWithProfile[]> {
  const userId = await requireAuthUserId()
  const supabase = getServerSupabase()

  let query = supabase.from('requests').select('*').order('created_at', { ascending: false })

  if (filter === 'sent') {
    query = query.eq('from_user_id', userId)
  } else {
    query = query.eq('to_user_id', userId)
  }

  const { data: requests, error } = await query
  if (error) throw new Error(error.message)
  if (!requests?.length) return []

  const results: RequestWithProfile[] = []
  for (const row of requests as DbRequest[]) {
    const otherUserId = filter === 'sent' ? row.to_user_id : row.from_user_id
    const profile = await fetchActiveProfileByUserId(supabase, otherUserId)
    if (!profile) continue
    results.push({
      ...toConnectionRequest(row),
      profile,
    })
  }
  return results
}

export const listSentRequests = createServerFn({ method: 'GET' }).handler(() =>
  listRequestsWithProfiles('sent'),
)

export const listReceivedRequests = createServerFn({ method: 'GET' }).handler(() =>
  listRequestsWithProfiles('received'),
)

export const acceptRequest = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()
    const request = await getRequestById(supabase, id)

    if (request.to_user_id !== userId) throw new Error('Unauthorized')
    if (request.status !== 'pending') throw new Error('Request is not pending')

    const { data: updated, error } = await supabase
      .from('requests')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return toConnectionRequest(updated as DbRequest)
  })

export const rejectRequest = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()
    const request = await getRequestById(supabase, id)

    if (request.to_user_id !== userId) throw new Error('Unauthorized')
    if (request.status !== 'pending') throw new Error('Request is not pending')

    const { data: updated, error } = await supabase
      .from('requests')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return toConnectionRequest(updated as DbRequest)
  })

export const cancelRequest = createServerFn({ method: 'POST' })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()
    const request = await getRequestById(supabase, id)

    if (request.from_user_id !== userId) throw new Error('Unauthorized')
    if (request.status !== 'pending') throw new Error('Request is not pending')

    const { data: updated, error } = await supabase
      .from('requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return toConnectionRequest(updated as DbRequest)
  })

export type UserContact = ContactFields

export const getContactForUser = createServerFn({ method: 'GET' })
  .validator((targetUserId: string) => targetUserId)
  .handler(async ({ data: targetUserId }): Promise<UserContact> => {
    await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .single()

    if (profileError) throw new Error(profileError.message)

    const { data: contact, error } = await supabase
      .from('profile_contacts')
      .select('wechat, line, telegram, email')
      .eq('profile_id', profile.id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!contact) throw new Error('无权限查看联系方式')

    return {
      wechat: contact.wechat ?? '',
      line: contact.line ?? '',
      telegram: contact.telegram ?? '',
      email: contact.email ?? '',
    }
  })
