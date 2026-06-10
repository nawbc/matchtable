export function calculateAge(birthday: string | Date | null | undefined): number | null {
  if (!birthday) return null

  let birthYear: number
  let birthMonth: number
  let birthDay: number

  if (typeof birthday === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthday)
    if (!match) return null
    birthYear = Number(match[1])
    birthMonth = Number(match[2]) - 1
    birthDay = Number(match[3])
  } else if (Number.isNaN(birthday.getTime())) {
    return null
  } else {
    birthYear = birthday.getFullYear()
    birthMonth = birthday.getMonth()
    birthDay = birthday.getDate()
  }

  const today = new Date()
  let age = today.getFullYear() - birthYear
  const monthDiff = today.getMonth() - birthMonth
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age -= 1
  }
  return age
}
