import {
  calculateAge,
  EDUCATION_LABELS,
  GENDER_LABELS,
  type PublicProfile,
} from '@matchtable/shared'
import { Flex, Heading, Text } from '@radix-ui/themes'

import { Card } from '../Card/Card'

import styles from './TableCard.module.css'

export type TableCardProps = {
  profile: PublicProfile
  href?: string
  compact?: boolean
  footer?: React.ReactNode
}

export function TableCard({ profile, href, compact = false, footer }: TableCardProps) {
  const age = calculateAge(profile.birthday)
  const category = profile.city ?? profile.occupation ?? '相亲资料'

  const content = (
    <Card className={styles.radixCard}>
      <Flex mb="2">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.nickname ?? '用户照片'}
            className={styles.mediaImage}
          />
        ) : (
          <div className={styles.mediaPlaceholder} aria-hidden />
        )}
      </Flex>

      <Flex direction="column" gap="1" mb="2">
        <Text size="2" color="gray" weight="bold" highContrast>
          {category}
        </Text>
        <Heading size="3" mb="0">
          {profile.nickname ?? '匿名'}
        </Heading>
      </Flex>

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
        <Flex gap="1" wrap="wrap" mt="2">
          {profile.hobbies.slice(0, compact ? 3 : 5).map((tag) => (
            <Text key={tag} size="1" className={styles.tag}>
              {tag}
            </Text>
          ))}
        </Flex>
      ) : null}

      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </Card>
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
