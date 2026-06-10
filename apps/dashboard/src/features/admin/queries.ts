import { queryOptions } from '@tanstack/react-query'

import {
  getDashboardStats,
  getProfileDetail,
  getUserDetail,
  listProfiles,
  listReports,
  searchUsers,
} from './server'

export const dashboardStatsQueryOptions = queryOptions({
  queryKey: ['admin', 'stats'],
  queryFn: () => getDashboardStats(),
})

export function usersSearchQueryOptions(query: string, page: number, pageSize: number) {
  return queryOptions({
    queryKey: ['admin', 'users', { query, page, pageSize }],
    queryFn: () => searchUsers({ data: { query, page, pageSize } }),
  })
}

export function userDetailQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ['admin', 'users', userId],
    queryFn: () => getUserDetail({ data: { userId } }),
  })
}

export function profilesListQueryOptions(page: number, pageSize: number) {
  return queryOptions({
    queryKey: ['admin', 'profiles', { page, pageSize }],
    queryFn: () => listProfiles({ data: { page, pageSize } }),
  })
}

export function profileDetailQueryOptions(profileId: string) {
  return queryOptions({
    queryKey: ['admin', 'profiles', profileId],
    queryFn: () => getProfileDetail({ data: { profileId } }),
  })
}

export function reportsListQueryOptions(page: number, pageSize: number) {
  return queryOptions({
    queryKey: ['admin', 'reports', { page, pageSize }],
    queryFn: () => listReports({ data: { page, pageSize } }),
  })
}
