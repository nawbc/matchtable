import { PHOTO_MIN } from '../constants'
import type { ProfileFormValues, Requirements } from '../schemas/profile'
import { parseRequirementsRaw } from './requirements'

export type PublishCheckInput = {
  formValues: ProfileFormValues
  photoCount: number
  requirementsFields?: Requirements
  isRawRequirements?: boolean
  rawRequirements?: string
  /** When false, skip photo count (server reads DB instead). */
  checkPhotos?: boolean
}

export function hasRequirementsContent(
  requirements: string | null | undefined,
  requirementsFields?: Requirements,
  isRawRequirements?: boolean,
  rawRequirements?: string,
): boolean {
  if (isRawRequirements !== undefined) {
    if (isRawRequirements) {
      return Boolean(rawRequirements?.trim())
    }
    if (requirementsFields) {
      return Object.values(requirementsFields).some((value) => value !== undefined && value !== '')
    }
  }

  const parsed = parseRequirementsRaw(requirements)
  if (parsed.kind === 'empty') return false
  if (parsed.kind === 'raw') return parsed.text.trim().length > 0
  return Object.values(parsed.data).some((value) => value !== undefined && value !== '')
}

export function getPublishBlockers(input: PublishCheckInput): string[] {
  const { formValues, photoCount } = input
  const blockers: string[] = []

  if (!formValues.nickname.trim()) blockers.push('请填写昵称')
  if (!formValues.birthday) blockers.push('请填写生日')
  if (formValues.height === undefined) blockers.push('请填写身高')
  if (!formValues.city?.trim()) blockers.push('请填写城市')
  if (input.checkPhotos !== false && photoCount < PHOTO_MIN) {
    blockers.push(`请至少上传 ${PHOTO_MIN} 张照片`)
  }
  if (
    !hasRequirementsContent(
      formValues.requirements,
      input.requirementsFields,
      input.isRawRequirements,
      input.rawRequirements,
    )
  ) {
    blockers.push('请至少填写一项择偶要求')
  }

  return blockers
}

export function isProfilePublishReady(input: PublishCheckInput): boolean {
  return getPublishBlockers(input).length === 0
}
