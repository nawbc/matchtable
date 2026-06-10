/** Format an ISO timestamp as YYYY/M/D without locale-dependent APIs (SSR-safe). */
export function formatDateZhCN(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  const date = typeof iso === 'string' ? new Date(iso) : iso
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}
