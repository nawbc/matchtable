export const GENDER_OPTIONS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDER_OPTIONS)[number]

export const MARITAL_STATUS_OPTIONS = ['single', 'divorced', 'widowed'] as const
export type MaritalStatus = (typeof MARITAL_STATUS_OPTIONS)[number]

export const EDUCATION_OPTIONS = [
  'high_school',
  'associate',
  'bachelor',
  'master',
  'doctorate',
  'other',
] as const
export type Education = (typeof EDUCATION_OPTIONS)[number]

export const INCOME_OPTIONS = [
  'under_100k',
  '100k_200k',
  '200k_500k',
  '500k_1m',
  'over_1m',
  'prefer_not_say',
] as const
export type Income = (typeof INCOME_OPTIONS)[number]

export const PROFILE_STATUS_OPTIONS = ['active', 'hidden', 'removed'] as const
export type ProfileStatus = (typeof PROFILE_STATUS_OPTIONS)[number]

export const REQUEST_STATUS_OPTIONS = ['pending', 'accepted', 'rejected', 'cancelled'] as const
export type RequestStatus = (typeof REQUEST_STATUS_OPTIONS)[number]

export const COMPARE_MIN = 2
export const COMPARE_MAX = 4
export const PHOTO_MIN = 1
export const PHOTO_MAX = 9
export const BIO_MAX_LENGTH = 2000

export const GENDER_LABELS: Record<Gender, string> = {
  male: '男',
  female: '女',
  other: '其他',
}

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  single: '未婚',
  divorced: '离异',
  widowed: '丧偶',
}

export const EDUCATION_LABELS: Record<Education, string> = {
  high_school: '高中',
  associate: '大专',
  bachelor: '本科',
  master: '硕士',
  doctorate: '博士',
  other: '其他',
}

export const INCOME_LABELS: Record<Income, string> = {
  under_100k: '10 万以下',
  '100k_200k': '10 万 – 20 万',
  '200k_500k': '20 万 – 50 万',
  '500k_1m': '50 万 – 100 万',
  over_1m: '100 万以上',
  prefer_not_say: '不便透露',
}
