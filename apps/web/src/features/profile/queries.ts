import type { DiscoverFilters, ProfileFormValues } from '@matchtable/shared'
import type { ProfileWithPhotos } from '@matchtable/shared'
import { mutationOptions, queryOptions } from '@tanstack/react-query'

import {
  createProfile,
  deletePhoto,
  getMyProfile,
  getProfileById,
  getProfilesByIds,
  listProfiles,
  reorderPhotos,
  setPrimaryPhoto,
  updateProfile,
  type UpdateProfileInput,
  uploadPhoto,
  type ListProfilesResult,
} from './server'

export const myProfileQueryOptions = queryOptions({
  queryKey: ['profile', 'me'],
  queryFn: () => getMyProfile(),
})

export function profileByIdQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['profile', id],
    queryFn: () => getProfileById({ data: id }),
  })
}

export function discoverQueryOptions(filters: DiscoverFilters) {
  return queryOptions({
    queryKey: ['discover', filters],
    queryFn: () => listProfiles({ data: filters }),
  })
}

export function profilesByIdsQueryOptions(ids: string[]) {
  return queryOptions({
    queryKey: ['profiles', 'compare', ids],
    queryFn: () => getProfilesByIds({ data: ids }),
    enabled: ids.length > 0,
  })
}

export const createProfileMutationOptions = mutationOptions({
  mutationFn: (data: ProfileFormValues) => createProfile({ data }),
})

export const updateProfileMutationOptions = mutationOptions({
  mutationFn: (data: UpdateProfileInput) => updateProfile({ data }),
})

export const uploadPhotoMutationOptions = mutationOptions({
  mutationFn: (data: { fileName: string; contentType: string; base64: string }) =>
    uploadPhoto({ data }),
})

export const deletePhotoMutationOptions = mutationOptions({
  mutationFn: (photoId: string) => deletePhoto({ data: photoId }),
})

export const reorderPhotosMutationOptions = mutationOptions({
  mutationFn: (photoIds: string[]) => reorderPhotos({ data: { photoIds } }),
})

export const setPrimaryPhotoMutationOptions = mutationOptions({
  mutationFn: (photoId: string) => setPrimaryPhoto({ data: photoId }),
})

export type { ListProfilesResult, ProfileWithPhotos }
