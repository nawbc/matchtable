import { useQuery } from '@tanstack/react-query'

import { contactForUserQueryOptions } from './queries'

import styles from './ContactInfo.module.css'

type ContactInfoProps = {
  targetUserId: string
}

export function ContactInfo({ targetUserId }: ContactInfoProps) {
  const { data: contact, isLoading, error } = useQuery(contactForUserQueryOptions(targetUserId))

  if (isLoading) return <p className={styles.loading}>加载联系方式…</p>
  if (error || !contact) return null

  const fields = [
    { label: '微信', value: contact.wechat },
    { label: 'LINE', value: contact.line },
    { label: 'Telegram', value: contact.telegram },
    { label: '邮箱', value: contact.email },
  ].filter((f) => f.value)

  if (fields.length === 0) {
    return <p className={styles.empty}>对方尚未填写联系方式</p>
  }

  return (
    <dl className={styles.list}>
      {fields.map((f) => (
        <div key={f.label} className={styles.item}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}
