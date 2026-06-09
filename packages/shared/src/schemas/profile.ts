import { z } from 'zod'

import {
  BIO_MAX_LENGTH,
  EDUCATION_OPTIONS,
  GENDER_OPTIONS,
  INCOME_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  PHOTO_MAX,
  PHOTO_MIN,
} from '../constants'

export const requirementsSchema = z.object({
  ageMin: z.number().int().min(18).max(99).optional(),
  ageMax: z.number().int().min(18).max(99).optional(),
  heightMin: z.number().int().min(100).max(250).optional(),
  heightMax: z.number().int().min(100).max(250).optional(),
  education: z.enum(EDUCATION_OPTIONS).optional(),
  city: z.string().max(100).optional(),
  maritalStatus: z.enum(MARITAL_STATUS_OPTIONS).optional(),
  notes: z.string().max(500).optional(),
})

export type Requirements = z.infer<typeof requirementsSchema>

export const contactSchema = z.object({
  wechat: z.string().max(100).optional().or(z.literal('')),
  line: z.string().max(100).optional().or(z.literal('')),
  telegram: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
})

export type ContactFields = z.infer<typeof contactSchema>

export const profileFormSchema = z
  .object({
    nickname: z.string().min(1, '请填写昵称').max(50),
    gender: z.enum(GENDER_OPTIONS),
    birthday: z.string().min(1, '请填写生日'),
    height: z.number().int().min(100).max(250).optional(),
    weight: z.number().int().min(30).max(200).optional(),
    education: z.enum(EDUCATION_OPTIONS).optional(),
    school: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    occupation: z.string().max(100).optional().or(z.literal('')),
    income: z.enum(INCOME_OPTIONS).optional(),
    house: z.boolean().default(false),
    car: z.boolean().default(false),
    maritalStatus: z.enum(MARITAL_STATUS_OPTIONS).optional(),
    acceptLdr: z.boolean().default(false),
    hobbies: z.array(z.string().max(30)).max(20).default([]),
    bio: z.string().max(BIO_MAX_LENGTH).optional().or(z.literal('')),
    requirements: z.string().max(2000).optional().or(z.literal('')),
  })
  .merge(contactSchema)

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const photoSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  url: z.string().url(),
  sortOrder: z.number().int().min(0),
  createdAt: z.string(),
})

export type ProfilePhoto = z.infer<typeof photoSchema>

export const publicProfileSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().nullable(),
  gender: z.enum(GENDER_OPTIONS).nullable(),
  birthday: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  height: z.number().nullable(),
  weight: z.number().nullable(),
  education: z.enum(EDUCATION_OPTIONS).nullable(),
  school: z.string().nullable(),
  city: z.string().nullable(),
  occupation: z.string().nullable(),
  income: z.enum(INCOME_OPTIONS).nullable(),
  house: z.boolean(),
  car: z.boolean(),
  maritalStatus: z.enum(MARITAL_STATUS_OPTIONS).nullable(),
  acceptLdr: z.boolean(),
  hobbies: z.array(z.string()).nullable(),
  requirements: z.string().nullable(),
  bio: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type PublicProfile = z.infer<typeof publicProfileSchema>

export const profileWithPhotosSchema = publicProfileSchema.extend({
  photos: z.array(photoSchema),
})

export type ProfileWithPhotos = z.infer<typeof profileWithPhotosSchema>

export const discoverFiltersSchema = z.object({
  gender: z.enum(GENDER_OPTIONS).optional(),
  ageMin: z.coerce.number().int().min(18).max(99).optional(),
  ageMax: z.coerce.number().int().min(18).max(99).optional(),
  city: z.string().optional(),
  education: z.enum(EDUCATION_OPTIONS).optional(),
  heightMin: z.coerce.number().int().min(100).max(250).optional(),
  heightMax: z.coerce.number().int().min(100).max(250).optional(),
  sort: z.enum(['newest', 'recent']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>

export const compareSearchSchema = z.object({
  ids: z.string().optional(),
})

export type CompareSearch = z.infer<typeof compareSearchSchema>

export const reorderPhotosSchema = z.object({
  photoIds: z.array(z.string().uuid()).min(PHOTO_MIN).max(PHOTO_MAX),
})

export const uploadPhotoSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\//),
})
