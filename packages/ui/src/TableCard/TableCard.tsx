import {
  calculateAge,
  EDUCATION_LABELS,
  GENDER_LABELS,
  type PublicProfile,
} from '@matchtable/shared'

import styles from './TableCard.module.css'

export type TableCardProps = {
  profile: PublicProfile
  href?: string
  compact?: boolean
  footer?: React.ReactNode
}

export function TableCard({ profile, href, compact = false, footer }: TableCardProps) {
  const age = calculateAge(profile.birthday)
  const content = (
    <article className={[styles.card, compact ? styles.compact : ''].filter(Boolean).join(' ')}>
      <header className={styles.header}>
        <span className={styles.brand}>MatchTable</span>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt="" className={styles.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder} aria-hidden />
        )}
      </header>
      <div className={styles.body}>
        <h3 className={styles.nickname}>{profile.nickname ?? '匿名'}</h3>
        <table className={styles.table}>
          <tbody>
            {age !== null ? (
              <tr>
                <th>年龄</th>
                <td>{age}</td>
              </tr>
            ) : null}
            {profile.height ? (
              <tr>
                <th>身高</th>
                <td>{profile.height} cm</td>
              </tr>
            ) : null}
            {profile.city ? (
              <tr>
                <th>城市</th>
                <td>{profile.city}</td>
              </tr>
            ) : null}
            {profile.occupation ? (
              <tr>
                <th>职业</th>
                <td>{profile.occupation}</td>
              </tr>
            ) : null}
            {profile.education ? (
              <tr>
                <th>学历</th>
                <td>{EDUCATION_LABELS[profile.education]}</td>
              </tr>
            ) : null}
            {profile.gender ? (
              <tr>
                <th>性别</th>
                <td>{GENDER_LABELS[profile.gender]}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        {profile.hobbies && profile.hobbies.length > 0 ? (
          <div className={styles.tags}>
            {profile.hobbies.slice(0, compact ? 3 : 5).map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </article>
  )

  if (href) {
    return (
      <a href={href} className={styles.link}>
        {content}
      </a>
    )
  }

  return content
}
