import {
  FULL_PROFILE_COLUMNS,
  PUBLIC_PROFILE_COLUMNS,
  toProfilePhoto,
  toProfileWithPhotos,
  toPublicProfile,
  type DbProfile,
  type DbProfilePhoto,
} from '@matchtable/api'
import {
  discoverFiltersSchema,
  profileFormSchema,
  reorderPhotosSchema,
  type DiscoverFilters,
  type ProfileFormValues,
  type ProfileWithPhotos,
  type PublicProfile,
} from '@matchtable/shared'
import { createServerFn } from '@tanstack/react-start'

import { getServerSupabase, requireAuthUserId } from '~/lib/supabase-server'

function formToDbRow(values: ProfileFormValues, userId: string) {
  return {
    user_id: userId,
    nickname: values.nickname,
    gender: values.gender,
    birthday: values.birthday,
    height: values.height ?? null,
    weight: values.weight ?? null,
    education: values.education ?? null,
    school: values.school || null,
    city: values.city || null,
    occupation: values.occupation || null,
    income: values.income ?? null,
    house: values.house,
    car: values.car,
    marital_status: values.maritalStatus ?? null,
    accept_ldr: values.acceptLdr,
    hobbies: values.hobbies,
    bio: values.bio || null,
    requirements: values.requirements || null,
    wechat: values.wechat || null,
    line: values.line || null,
    telegram: values.telegram || null,
    email: values.email || null,
    avatar_url: null,
    status: 'active',
  }
}

function dbToFormValues(row: DbProfile): ProfileFormValues {
  return {
    nickname: row.nickname ?? '',
    gender: (row.gender as ProfileFormValues['gender']) ?? 'other',
    birthday: row.birthday ?? '',
    height: row.height ?? undefined,
    weight: row.weight ?? undefined,
    education: (row.education as ProfileFormValues['education']) ?? undefined,
    school: row.school ?? '',
    city: row.city ?? '',
    occupation: row.occupation ?? '',
    income: (row.income as ProfileFormValues['income']) ?? undefined,
    house: row.house,
    car: row.car,
    maritalStatus: (row.marital_status as ProfileFormValues['maritalStatus']) ?? undefined,
    acceptLdr: row.accept_ldr,
    hobbies: row.hobbies ?? [],
    bio: row.bio ?? '',
    requirements: row.requirements ?? '',
    wechat: row.wechat ?? '',
    line: row.line ?? '',
    telegram: row.telegram ?? '',
    email: row.email ?? '',
  }
}

export type MyProfile = ProfileWithPhotos & {
  userId: string
  wechat: string | null
  line: string | null
  telegram: string | null
  email: string | null
}

export const getMyProfile = createServerFn({ method: 'GET' }).handler(
  async (): Promise<MyProfile | null> => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(FULL_PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('getMyProfile error:', error.message)
      throw new Error(error.message)
    }
    if (!profile) return null

    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order')

    const withPhotos = toProfileWithPhotos(profile as DbProfile, (photos ?? []) as DbProfilePhoto[])
    const row = profile as DbProfile
    return {
      ...withPhotos,
      userId,
      wechat: row.wechat,
      line: row.line,
      telegram: row.telegram,
      email: row.email,
    }
  },
)

export const createProfile = createServerFn({ method: 'POST' })
  .validator((data: ProfileFormValues) => profileFormSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()
    const row = formToDbRow(data, userId)

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(row)
      .select(FULL_PROFILE_COLUMNS)
      .single()

    if (error) {
      console.error('createProfile error:', error.message)
      throw new Error(error.message)
    }

    return toProfileWithPhotos(profile as DbProfile, [])
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((data: ProfileFormValues) => profileFormSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()
    const row = formToDbRow(data, userId)

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('user_id', userId)
      .select(FULL_PROFILE_COLUMNS)
      .single()

    if (error) {
      console.error('updateProfile error:', error.message)
      throw new Error(error.message)
    }

    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order')

    return toProfileWithPhotos(profile as DbProfile, (photos ?? []) as DbProfilePhoto[])
  })

export const uploadPhoto = createServerFn({ method: 'POST' })
  .validator((data: { fileName: string; contentType: string; base64: string }) => data)
  .handler(async ({ data }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!profile) throw new Error('Create a profile first')

    const path = `${userId}/${Date.now()}-${data.fileName}`
    const buffer = Buffer.from(data.base64, 'base64')

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(path, buffer, { contentType: data.contentType, upsert: false })

    if (uploadError) {
      console.error('uploadPhoto error:', uploadError.message)
      throw new Error(uploadError.message)
    }

    const { data: publicUrl } = supabase.storage.from('profile-photos').getPublicUrl(path)

    const { count } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    const { data: photo, error } = await supabase
      .from('profile_photos')
      .insert({
        profile_id: profile.id,
        url: publicUrl.publicUrl,
        sort_order: count ?? 0,
      })
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    if ((count ?? 0) === 0) {
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl.publicUrl })
        .eq('id', profile.id)
    }

    return toProfilePhoto(photo as DbProfilePhoto)
  })

export const deletePhoto = createServerFn({ method: 'POST' })
  .validator((photoId: string) => photoId)
  .handler(async ({ data: photoId }) => {
    await requireAuthUserId()
    const supabase = getServerSupabase()

    const { error } = await supabase.from('profile_photos').delete().eq('id', photoId)
    if (error) throw new Error(error.message)
    return { success: true as const }
  })

export const reorderPhotos = createServerFn({ method: 'POST' })
  .validator((data: { photoIds: string[] }) => reorderPhotosSchema.parse(data))
  .handler(async ({ data }) => {
    await requireAuthUserId()
    const supabase = getServerSupabase()

    await Promise.all(
      data.photoIds.map((id, index) =>
        supabase.from('profile_photos').update({ sort_order: index }).eq('id', id),
      ),
    )
    return { success: true as const }
  })

export const setPrimaryPhoto = createServerFn({ method: 'POST' })
  .validator((photoId: string) => photoId)
  .handler(async ({ data: photoId }) => {
    const userId = await requireAuthUserId()
    const supabase = getServerSupabase()

    const { data: photo } = await supabase
      .from('profile_photos')
      .select('url, profile_id')
      .eq('id', photoId)
      .single()

    if (!photo) throw new Error('Photo not found')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .eq('id', photo.profile_id)
      .single()

    if (!profile) throw new Error('Unauthorized')

    await supabase.from('profiles').update({ avatar_url: photo.url }).eq('id', profile.id)

    return { success: true as const }
  })

export type ListProfilesResult = {
  profiles: PublicProfile[]
  total: number
  page: number
  pageSize: number
}

export const listProfiles = createServerFn({ method: 'GET' })
  .validator((filters: DiscoverFilters) => discoverFiltersSchema.parse(filters))
  .handler(async ({ data: filters }): Promise<ListProfilesResult> => {
    const supabase = getServerSupabase()
    let query = supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_COLUMNS, { count: 'exact' })
      .eq('status', 'active')

    if (filters.gender) query = query.eq('gender', filters.gender)
    if (filters.city) query = query.ilike('city', `%${filters.city}%`)
    if (filters.education) query = query.eq('education', filters.education)
    if (filters.heightMin) query = query.gte('height', filters.heightMin)
    if (filters.heightMax) query = query.lte('height', filters.heightMax)

    if (filters.sort === 'recent') {
      query = query.order('updated_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const from = (filters.page - 1) * filters.pageSize
    const to = from + filters.pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query
    if (error) {
      console.error('listProfiles error:', error.message)
      throw new Error(error.message)
    }

    let profiles = (data ?? []).map((row) => toPublicProfile(row as DbProfile))

    if (filters.ageMin || filters.ageMax) {
      profiles = profiles.filter((p) => {
        if (!p.birthday) return false
        const birth = new Date(p.birthday)
        const today = new Date()
        let age = today.getFullYear() - birth.getFullYear()
        const m = today.getMonth() - birth.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1
        if (filters.ageMin && age < filters.ageMin) return false
        if (filters.ageMax && age > filters.ageMax) return false
        return true
      })
    }

    return {
      profiles,
      total: count ?? profiles.length,
      page: filters.page,
      pageSize: filters.pageSize,
    }
  })

export const getProfileById = createServerFn({ method: 'GET' })
  .validator((id: string) => id)
  .handler(async ({ data: id }): Promise<ProfileWithPhotos | null> => {
    const supabase = getServerSupabase()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_COLUMNS)
      .eq('id', id)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!profile) return null

    const { data: photos } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('profile_id', id)
      .order('sort_order')

    return toProfileWithPhotos(profile as DbProfile, (photos ?? []) as DbProfilePhoto[])
  })

export const getProfilesByIds = createServerFn({ method: 'POST' })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }): Promise<ProfileWithPhotos[]> => {
    if (ids.length === 0) return []
    const supabase = getServerSupabase()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(PUBLIC_PROFILE_COLUMNS)
      .in('id', ids)
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
    return results
  })

export { dbToFormValues }
