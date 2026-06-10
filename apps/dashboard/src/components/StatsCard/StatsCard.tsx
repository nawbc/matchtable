import styles from './StatsCard.module.css'

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>
}

export function StatsCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  )
}
