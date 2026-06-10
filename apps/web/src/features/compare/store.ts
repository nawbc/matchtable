import { COMPARE_MAX, COMPARE_MIN } from '@matchtable/shared'
import { Store } from '@tanstack/store'

const COMPARE_STORAGE_KEY = 'matchtable-compare-ids'
const PIN_OWN_STORAGE_KEY = 'matchtable-pin-own-profile'

export type CompareState = {
  profileIds: string[]
  pinOwnProfile: boolean
}

function loadProfileIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, COMPARE_MAX) : []
  } catch {
    return []
  }
}

function loadPinOwn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(PIN_OWN_STORAGE_KEY) === 'true'
}

export const compareStore = new Store<CompareState>({
  profileIds: loadProfileIds(),
  pinOwnProfile: loadPinOwn(),
})

function persist(state: CompareState) {
  if (typeof window === 'undefined') return
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(state.profileIds))
  localStorage.setItem(PIN_OWN_STORAGE_KEY, String(state.pinOwnProfile))
}

export type AddToCompareResult = 'added' | 'already_exists' | 'max_reached' | 'login_required'

export function addToCompare(
  profileId: string,
  options?: { isLoggedIn?: boolean },
): AddToCompareResult {
  if (options?.isLoggedIn === false) return 'login_required'

  let result: AddToCompareResult = 'added'
  compareStore.setState((state) => {
    if (state.profileIds.includes(profileId)) {
      result = 'already_exists'
      return state
    }
    if (state.profileIds.length >= COMPARE_MAX) {
      result = 'max_reached'
      return state
    }
    const next = { ...state, profileIds: [...state.profileIds, profileId] }
    persist(next)
    return next
  })
  return result
}

export function removeFromCompare(profileId: string) {
  compareStore.setState((state) => {
    const next = {
      ...state,
      profileIds: state.profileIds.filter((id) => id !== profileId),
    }
    persist(next)
    return next
  })
}

export function togglePinOwnProfile() {
  compareStore.setState((state) => {
    const next = { ...state, pinOwnProfile: !state.pinOwnProfile }
    persist(next)
    return next
  })
}

export function clearCompare() {
  compareStore.setState((state) => {
    const next = { ...state, profileIds: [] }
    persist(next)
    return next
  })
}

export function canCompare(count: number): boolean {
  return count >= COMPARE_MIN && count <= COMPARE_MAX
}

export function getCompareCount(profileIds: string[], pinOwn: boolean, hasOwn: boolean) {
  let count = profileIds.length
  if (pinOwn && hasOwn) count += 1
  return count
}
