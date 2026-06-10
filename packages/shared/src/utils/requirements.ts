import { EDUCATION_LABELS, MARITAL_STATUS_LABELS } from '../constants'
import { requirementsLooseSchema, requirementsSchema, type Requirements } from '../schemas/profile'

export type ParsedRequirements =
  | { kind: 'structured'; data: Requirements }
  | { kind: 'raw'; text: string }
  | { kind: 'empty' }

export function parseRequirementsRaw(raw: string | null | undefined): ParsedRequirements {
  if (!raw?.trim()) return { kind: 'empty' }

  try {
    const json: unknown = JSON.parse(raw)
    const result = requirementsLooseSchema.safeParse(json)
    if (result.success) {
      const hasAny = Object.values(result.data).some((value) => value !== undefined && value !== '')
      if (hasAny) return { kind: 'structured', data: result.data }
    }
  } catch {
    // fall through to raw text
  }

  return { kind: 'raw', text: raw }
}

export function validateRequirements(data: Requirements) {
  return requirementsSchema.safeParse(data)
}

export function serializeRequirements(data: Requirements): string {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined && value !== ''),
  )
  if (Object.keys(cleaned).length === 0) return ''
  return JSON.stringify(cleaned)
}

export function formatRequirementsDisplay(raw: string | null | undefined): string {
  const parsed = parseRequirementsRaw(raw)
  if (parsed.kind === 'empty') return ''
  if (parsed.kind === 'raw') return parsed.text

  const lines: string[] = []
  const { ageMin, ageMax, heightMin, heightMax, education, city, maritalStatus, notes } =
    parsed.data

  if (ageMin !== undefined || ageMax !== undefined) {
    if (ageMin !== undefined && ageMax !== undefined) {
      lines.push(`年龄：${ageMin}–${ageMax} 岁`)
    } else if (ageMin !== undefined) {
      lines.push(`年龄：${ageMin} 岁以上`)
    } else if (ageMax !== undefined) {
      lines.push(`年龄：${ageMax} 岁以下`)
    }
  }

  if (heightMin !== undefined || heightMax !== undefined) {
    if (heightMin !== undefined && heightMax !== undefined) {
      lines.push(`身高：${heightMin}–${heightMax} cm`)
    } else if (heightMin !== undefined) {
      lines.push(`身高：${heightMin} cm 以上`)
    } else if (heightMax !== undefined) {
      lines.push(`身高：${heightMax} cm 以下`)
    }
  }

  if (education) lines.push(`学历：${EDUCATION_LABELS[education]}`)
  if (city) lines.push(`城市：${city}`)
  if (maritalStatus) lines.push(`婚姻状况：${MARITAL_STATUS_LABELS[maritalStatus]}`)
  if (notes) lines.push(`补充说明：${notes}`)

  return lines.join('\n')
}
