import {
  calculateAge,
  COMPARE_MAX,
  COMPARE_MIN,
  EDUCATION_LABELS,
  GENDER_LABELS,
  type PublicProfile,
} from '@matchtable/shared'
import { Box, Button, Card, Flex, Heading, Separator, TableCard, Text } from '@matchtable/ui'
import { Link } from '@tanstack/react-router'

import styles from './HomeShowcase.module.css'

function buildCompareRows(a: PublicProfile, b: PublicProfile) {
  const ageA = calculateAge(a.birthday)
  const ageB = calculateAge(b.birthday)

  return [
    {
      label: '年龄',
      a: ageA !== null ? `${ageA}` : '—',
      b: ageB !== null ? `${ageB}` : '—',
    },
    {
      label: '身高',
      a: a.height ? `${a.height} cm` : '—',
      b: b.height ? `${b.height} cm` : '—',
    },
    {
      label: '城市',
      a: a.city ?? '—',
      b: b.city ?? '—',
    },
    {
      label: '学历',
      a: a.education ? EDUCATION_LABELS[a.education] : '—',
      b: b.education ? EDUCATION_LABELS[b.education] : '—',
    },
  ]
}

export function ComparePreviewCard({ profiles }: { profiles: PublicProfile[] }) {
  const [first, second] = profiles
  if (!first || !second) return null

  const rows = buildCompareRows(first, second)

  return (
    <Card>
      <Flex align="baseline" justify="between" gap="3" mb="2">
        <Heading size="3">横向对比</Heading>
        <Text size="1" color="gray">
          {COMPARE_MIN}–{COMPARE_MAX} 位资料
        </Text>
      </Flex>
      <Text as="p" size="2" color="gray" mb="4">
        并排查看关键字段，快速判断匹配度。
      </Text>
      <table className={styles.compareTable}>
        <thead>
          <tr>
            <th scope="col">字段</th>
            <th scope="col">{first.nickname ?? '资料 A'}</th>
            <th scope="col">{second.nickname ?? '资料 B'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.a}</td>
              <td>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Separator size="lg" className={styles.sectionDivider} />
      <Link to="/compare">
        <Button variant="soft" size="md" fullWidth>
          打开对比页
        </Button>
      </Link>
    </Card>
  )
}

export function ShowcaseTableCard({ profile }: { profile: PublicProfile }) {
  return <TableCard profile={profile} href={`/profile/${profile.id}`} compact />
}

export function DiscoverPreviewCard() {
  return (
    <Card>
      <Heading size="3" mb="1">
        发现广场
      </Heading>
      <Text as="p" size="2" color="gray" mb="4">
        按条件筛选公开资料，支持关键词与学历等维度。
      </Text>
      <Flex direction="column" gap="2" mb="4">
        <Flex align="center" justify="between" className={styles.filterRow}>
          <Text size="2" color="gray">
            性别
          </Text>
          <Text size="2" weight="medium">
            全部
          </Text>
        </Flex>
        <Flex align="center" justify="between" className={styles.filterRow}>
          <Text size="2" color="gray">
            关键词
          </Text>
          <Text size="2" weight="medium">
            昵称、城市、职业…
          </Text>
        </Flex>
        <Flex align="center" justify="between" className={styles.filterRow}>
          <Text size="2" color="gray">
            排序
          </Text>
          <Text size="2" weight="medium">
            最新发布
          </Text>
        </Flex>
      </Flex>
      <Link to="/discover" search={{ sort: 'newest', page: 1, pageSize: 20 }}>
        <Button variant="soft" size="md" fullWidth>
          去筛选资料
        </Button>
      </Link>
    </Card>
  )
}

export function RecentProfilesCard({ profiles }: { profiles: PublicProfile[] }) {
  const items = profiles.slice(0, 5)

  return (
    <Card>
      <Heading size="3" mb="1">
        最新资料
      </Heading>
      <Text as="p" size="2" color="gray" mb="4">
        平台最近更新的公开相亲表。
      </Text>
      {items.length === 0 ? (
        <Text size="2" color="gray">
          暂无公开资料，欢迎率先创建。
        </Text>
      ) : (
        <Flex direction="column" gap="1">
          {items.map((profile) => {
            const age = calculateAge(profile.birthday)
            const metaParts = [
              profile.city,
              profile.gender ? GENDER_LABELS[profile.gender] : null,
              age !== null ? `${age}岁` : null,
            ].filter(Boolean)

            return (
              <Box key={profile.id} className={styles.recentItem}>
                <Link to="/profile/$id" params={{ id: profile.id }}>
                  <Flex align="center" justify="between" gap="3">
                    <Text size="2" weight="bold">
                      {profile.nickname ?? '匿名'}
                    </Text>
                    <Text size="2" color="gray">
                      {metaParts.join(' · ')}
                    </Text>
                  </Flex>
                </Link>
              </Box>
            )
          })}
        </Flex>
      )}
    </Card>
  )
}
