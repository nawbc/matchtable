import type {
  Education,
  Gender,
  Income,
  MaritalStatus,
  PublicProfile,
  ProfilePhoto,
  ProfileWithPhotos,
} from '@matchtable/shared'

export type DbProfile = {
  id: string
  user_id: string
  nickname: string | null
  gender: string | null
  birthday: string | null
  avatar_url: string | null
  height: number | null
  weight: number | null
  education: string | null
  school: string | null
  city: string | null
  occupation: string | null
  income: string | null
  house: boolean
  car: boolean
  marital_status: string | null
  accept_ldr: boolean
  hobbies: string[] | null
  requirements: string | null
  bio: string | null
  status: string
  created_at: string
  updated_at: string
}

export type DbProfileContact = {
  profile_id: string
  wechat: string | null
  line: string | null
  telegram: string | null
  email: string | null
  updated_at?: string
}

export type DbProfilePhoto = {
  id: string
  profile_id: string
  url: string
  sort_order: number
  created_at: string
}

export function toPublicProfile(row: DbProfile): PublicProfile {
  return {
    id: row.id,
    nickname: row.nickname,
    gender: row.gender as Gender | null,
    birthday: row.birthday,
    avatarUrl: row.avatar_url,
    height: row.height,
    weight: row.weight,
    education: row.education as Education | null,
    school: row.school,
    city: row.city,
    occupation: row.occupation,
    income: row.income as Income | null,
    house: row.house,
    car: row.car,
    maritalStatus: row.marital_status as MaritalStatus | null,
    acceptLdr: row.accept_ldr,
    hobbies: row.hobbies,
    requirements: row.requirements,
    bio: row.bio,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function toProfilePhoto(row: DbProfilePhoto): ProfilePhoto {
  return {
    id: row.id,
    profileId: row.profile_id,
    url: row.url,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function toProfileWithPhotos(row: DbProfile, photos: DbProfilePhoto[]): ProfileWithPhotos {
  return {
    ...toPublicProfile(row),
    photos: photos.map(toProfilePhoto).sort((a, b) => a.sortOrder - b.sortOrder),
  }
}

export const PUBLIC_PROFILE_COLUMNS =
  'id, nickname, gender, birthday, avatar_url, height, weight, education, school, city, occupation, income, house, car, marital_status, accept_ldr, hobbies, requirements, bio, status, created_at, updated_at'

export const FULL_PROFILE_COLUMNS = `${PUBLIC_PROFILE_COLUMNS}, user_id`

export const CONTACT_COLUMNS = 'wechat, line, telegram, email'
