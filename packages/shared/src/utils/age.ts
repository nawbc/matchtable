export function calculateAge(birthday: string | Date | null | undefined): number | null {
  if (!birthday) return null
  const birth = typeof birthday === 'string' ? new Date(birthday) : birthday
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}
