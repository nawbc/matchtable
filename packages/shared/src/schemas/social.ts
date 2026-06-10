import { z } from 'zod'

import { CONNECTION_REQUEST_MESSAGE_MAX, REQUEST_STATUS_OPTIONS } from '../constants'
import { publicProfileSchema } from './profile'

export const favoriteSchema = z.object({
  profileId: z.string().uuid(),
})

export type FavoriteInput = z.infer<typeof favoriteSchema>

export const connectionRequestSchema = z.object({
  toUserId: z.string().uuid(),
  message: z.string().max(CONNECTION_REQUEST_MESSAGE_MAX).optional().or(z.literal('')),
})

export type ConnectionRequestInput = z.infer<typeof connectionRequestSchema>

export const requestStatusSchema = z.enum(REQUEST_STATUS_OPTIONS)

export const requestSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  message: z.string().nullable(),
  status: requestStatusSchema,
  createdAt: z.string(),
})

export type ConnectionRequest = z.infer<typeof requestSchema>

export const requestWithProfileSchema = requestSchema.extend({
  profile: publicProfileSchema,
})

export type RequestWithProfile = z.infer<typeof requestWithProfileSchema>
