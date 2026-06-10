import type { ConnectionRequestInput } from '@matchtable/shared'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

import {
  acceptRequest,
  cancelRequest,
  getContactForUser,
  getProfileOwnerUserId,
  listFavorites,
  listReceivedRequests,
  listSentRequests,
  rejectRequest,
  sendRequest,
  toggleFavorite,
} from './server'

export const favoritesQueryOptions = queryOptions({
  queryKey: ['social', 'favorites'],
  queryFn: () => listFavorites(),
})

export const sentRequestsQueryOptions = queryOptions({
  queryKey: ['social', 'requests', 'sent'],
  queryFn: () => listSentRequests(),
})

export const receivedRequestsQueryOptions = queryOptions({
  queryKey: ['social', 'requests', 'received'],
  queryFn: () => listReceivedRequests(),
})

export function profileOwnerUserIdQueryOptions(profileId: string) {
  return queryOptions({
    queryKey: ['social', 'profile-owner', profileId],
    queryFn: () => getProfileOwnerUserId({ data: profileId }),
    enabled: profileId.length > 0,
  })
}

export function contactForUserQueryOptions(targetUserId: string) {
  return queryOptions({
    queryKey: ['social', 'contact', targetUserId],
    queryFn: () => getContactForUser({ data: targetUserId }),
    enabled: targetUserId.length > 0,
  })
}

export const toggleFavoriteMutationOptions = mutationOptions({
  mutationFn: (profileId: string) => toggleFavorite({ data: profileId }),
})

export const sendRequestMutationOptions = mutationOptions({
  mutationFn: (data: ConnectionRequestInput) => sendRequest({ data }),
})

export const acceptRequestMutationOptions = mutationOptions({
  mutationFn: (id: string) => acceptRequest({ data: id }),
})

export const rejectRequestMutationOptions = mutationOptions({
  mutationFn: (id: string) => rejectRequest({ data: id }),
})

export const cancelRequestMutationOptions = mutationOptions({
  mutationFn: (id: string) => cancelRequest({ data: id }),
})
