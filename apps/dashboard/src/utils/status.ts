import { PROFILE_STATUS_OPTIONS, type ProfileStatus } from '@matchtable/shared'

const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  active: '活跃',
  hidden: '隐藏',
  takedown: '已下架',
  deleted: '已删除',
}

const PROFILE_STATUS_CLASSES: Record<ProfileStatus, string> = {
  active: 'statusActive',
  hidden: 'statusMuted',
  takedown: 'statusDanger',
  deleted: 'statusDanger',
}

function isProfileStatus(status: string): status is ProfileStatus {
  return (PROFILE_STATUS_OPTIONS as readonly string[]).includes(status)
}

export function profileStatusLabel(status: string): string {
  if (isProfileStatus(status)) return PROFILE_STATUS_LABELS[status]
  return status
}

export function profileStatusClass(status: string): string {
  if (isProfileStatus(status)) return PROFILE_STATUS_CLASSES[status]
  return 'statusMuted'
}

export function reportStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return '待处理'
    case 'resolved':
      return '已处理'
    default:
      return status
  }
}

export function reportStatusClass(status: string): string {
  switch (status) {
    case 'pending':
      return 'statusPending'
    case 'resolved':
      return 'statusActive'
    default:
      return 'statusMuted'
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('zh-CN')
}
