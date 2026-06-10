import { createServiceClient, requireAdmin } from '@matchtable/api'
import { REPORT_REASON_LABELS, type ReportReason } from '@matchtable/shared'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { getCookieStore } from '~/lib/supabase-server'

const BAN_DURATION = '876000h'

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

const searchUsersSchema = paginationSchema.extend({
  query: z.string().max(200).default(''),
})

const userIdSchema = z.object({
  userId: z.string().uuid(),
})

const profileIdSchema = z.object({
  profileId: z.string().uuid(),
})

const reportIdSchema = z.object({
  reportId: z.string().uuid(),
})

export type AdminUserSummary = {
  id: string
  email: string | null
  phone: string | null
  createdAt: string
  lastSignInAt: string | null
  banned: boolean
}

export type AdminUserDetail = AdminUserSummary & {
  role: string | null
  profile: {
    id: string
    nickname: string | null
    status: string
    city: string | null
    createdAt: string
  } | null
}

export type AdminProfileSummary = {
  id: string
  userId: string
  nickname: string | null
  city: string | null
  status: string
  createdAt: string
}

export type AdminProfileDetail = AdminProfileSummary & {
  gender: string | null
  birthday: string | null
  occupation: string | null
  bio: string | null
  updatedAt: string
}

export type AdminReportRow = {
  id: string
  reporterId: string
  targetUserId: string
  reason: string | null
  reasonLabel: string
  detail: string | null
  status: string
  createdAt: string
}

export type DashboardStats = {
  totalUsers: number
  totalProfiles: number
  todayNewUsers: number
  todayNewProfiles: number
}

async function withAdminClient() {
  const cookieStore = getCookieStore()
  await requireAdmin(cookieStore)
  return createServiceClient()
}

function startOfTodayIso(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

function mapAuthUser(user: {
  id: string
  email?: string
  phone?: string
  created_at?: string
  last_sign_in_at?: string
  banned_until?: string | null
}): AdminUserSummary {
  const bannedUntil = user.banned_until ? new Date(user.banned_until) : null
  const banned = bannedUntil !== null && bannedUntil.getTime() > Date.now()
  return {
    id: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    createdAt: user.created_at ?? '',
    lastSignInAt: user.last_sign_in_at ?? null,
    banned,
  }
}

async function listAllAuthUsers(supabase: ReturnType<typeof createServiceClient>) {
  const users: AdminUserSummary[] = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('listUsers error:', error.message)
      throw new Error(error.message)
    }
    for (const user of data.users) {
      users.push(mapAuthUser(user))
    }
    if (data.users.length < perPage) break
    page += 1
  }

  return users
}

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async (): Promise<DashboardStats> => {
    const supabase = await withAdminClient()
    const todayIso = startOfTodayIso()

    const { count: totalProfiles, error: profilesCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesCountError) {
      console.error('getDashboardStats profiles count:', profilesCountError.message)
      throw new Error(profilesCountError.message)
    }

    const { count: todayNewProfiles, error: todayProfilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayIso)

    if (todayProfilesError) {
      console.error('getDashboardStats today profiles:', todayProfilesError.message)
      throw new Error(todayProfilesError.message)
    }

    const allUsers = await listAllAuthUsers(supabase)
    const todayNewUsers = allUsers.filter((user) => user.createdAt >= todayIso).length

    return {
      totalUsers: allUsers.length,
      totalProfiles: totalProfiles ?? 0,
      todayNewUsers,
      todayNewProfiles: todayNewProfiles ?? 0,
    }
  },
)

export const searchUsers = createServerFn({ method: 'GET' })
  .validator((data: z.input<typeof searchUsersSchema>) => searchUsersSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const allUsers = await listAllAuthUsers(supabase)
    const query = data.query.trim().toLowerCase()

    const filtered = query
      ? allUsers.filter((user) => {
          const haystack = [user.id, user.email ?? '', user.phone ?? ''].join(' ').toLowerCase()
          return haystack.includes(query)
        })
      : allUsers

    const start = (data.page - 1) * data.pageSize
    const items = filtered.slice(start, start + data.pageSize)

    return {
      items,
      total: filtered.length,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const getUserDetail = createServerFn({ method: 'GET' })
  .validator((data: z.input<typeof userIdSchema>) => userIdSchema.parse(data))
  .handler(async ({ data }): Promise<AdminUserDetail> => {
    const supabase = await withAdminClient()

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.userId)
    if (userError || !userData.user) {
      console.error('getUserDetail error:', userError?.message)
      throw new Error(userError?.message ?? 'User not found')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, nickname, status, city, created_at')
      .eq('user_id', data.userId)
      .maybeSingle()

    if (profileError) {
      console.error('getUserDetail profile error:', profileError.message)
      throw new Error(profileError.message)
    }

    const user = userData.user
    const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : null

    return {
      ...mapAuthUser(user),
      role,
      profile: profile
        ? {
            id: profile.id,
            nickname: profile.nickname,
            status: profile.status,
            city: profile.city,
            createdAt: profile.created_at,
          }
        : null,
    }
  })

export const banUser = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof userIdSchema>) => userIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const { error } = await supabase.auth.admin.updateUserById(data.userId, {
      ban_duration: BAN_DURATION,
    })
    if (error) {
      console.error('banUser error:', error.message)
      throw new Error(error.message)
    }
    return { success: true as const }
  })

export const unbanUser = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof userIdSchema>) => userIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const { error } = await supabase.auth.admin.updateUserById(data.userId, {
      ban_duration: 'none',
    })
    if (error) {
      console.error('unbanUser error:', error.message)
      throw new Error(error.message)
    }
    return { success: true as const }
  })

export const listProfiles = createServerFn({ method: 'GET' })
  .validator((data: z.input<typeof paginationSchema>) => paginationSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const from = (data.page - 1) * data.pageSize
    const to = from + data.pageSize - 1

    const {
      data: rows,
      error,
      count,
    } = await supabase
      .from('profiles')
      .select('id, user_id, nickname, city, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('listProfiles error:', error.message)
      throw new Error(error.message)
    }

    const items: AdminProfileSummary[] = (rows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname,
      city: row.city,
      status: row.status,
      createdAt: row.created_at,
    }))

    return {
      items,
      total: count ?? items.length,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const getProfileDetail = createServerFn({ method: 'GET' })
  .validator((data: z.input<typeof profileIdSchema>) => profileIdSchema.parse(data))
  .handler(async ({ data }): Promise<AdminProfileDetail> => {
    const supabase = await withAdminClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(
        'id, user_id, nickname, city, status, gender, birthday, occupation, bio, created_at, updated_at',
      )
      .eq('id', data.profileId)
      .single()

    if (error || !profile) {
      console.error('getProfileDetail error:', error?.message)
      throw new Error(error?.message ?? 'Profile not found')
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      nickname: profile.nickname,
      city: profile.city,
      status: profile.status,
      gender: profile.gender,
      birthday: profile.birthday,
      occupation: profile.occupation,
      bio: profile.bio,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    }
  })

export const takedownProfile = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof profileIdSchema>) => profileIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'takedown' })
      .eq('id', data.profileId)

    if (error) {
      console.error('takedownProfile error:', error.message)
      throw new Error(error.message)
    }
    return { success: true as const }
  })

export const deleteProfile = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof profileIdSchema>) => profileIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'deleted' })
      .eq('id', data.profileId)

    if (error) {
      console.error('deleteProfile error:', error.message)
      throw new Error(error.message)
    }
    return { success: true as const }
  })

export const listReports = createServerFn({ method: 'GET' })
  .validator((data: z.input<typeof paginationSchema>) => paginationSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const from = (data.page - 1) * data.pageSize
    const to = from + data.pageSize - 1

    const {
      data: rows,
      error,
      count,
    } = await supabase
      .from('reports')
      .select('id, reporter_id, target_user_id, reason, detail, status, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('listReports error:', error.message)
      throw new Error(error.message)
    }

    const items: AdminReportRow[] = (rows ?? []).map((row) => {
      const reason = row.reason as ReportReason | null
      const reasonLabel =
        reason && reason in REPORT_REASON_LABELS
          ? REPORT_REASON_LABELS[reason]
          : (row.reason ?? '—')
      return {
        id: row.id,
        reporterId: row.reporter_id,
        targetUserId: row.target_user_id,
        reason: row.reason,
        reasonLabel,
        detail: row.detail,
        status: row.status,
        createdAt: row.created_at,
      }
    })

    return {
      items,
      total: count ?? items.length,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const resolveReport = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof reportIdSchema>) => reportIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()
    const { error } = await supabase
      .from('reports')
      .update({ status: 'resolved' })
      .eq('id', data.reportId)

    if (error) {
      console.error('resolveReport error:', error.message)
      throw new Error(error.message)
    }
    return { success: true as const }
  })

export const banReportedUser = createServerFn({ method: 'POST' })
  .validator((data: z.input<typeof reportIdSchema>) => reportIdSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = await withAdminClient()

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('target_user_id')
      .eq('id', data.reportId)
      .single()

    if (reportError || !report) {
      console.error('banReportedUser report error:', reportError?.message)
      throw new Error(reportError?.message ?? 'Report not found')
    }

    const { error: banError } = await supabase.auth.admin.updateUserById(report.target_user_id, {
      ban_duration: BAN_DURATION,
    })
    if (banError) {
      console.error('banReportedUser ban error:', banError.message)
      throw new Error(banError.message)
    }

    const { error: resolveError } = await supabase
      .from('reports')
      .update({ status: 'resolved' })
      .eq('id', data.reportId)

    if (resolveError) {
      console.error('banReportedUser resolve error:', resolveError.message)
      throw new Error(resolveError.message)
    }

    return { success: true as const }
  })
