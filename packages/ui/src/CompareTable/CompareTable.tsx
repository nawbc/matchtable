import {
  calculateAge,
  EDUCATION_LABELS,
  formatRequirementsDisplay,
  INCOME_LABELS,
  MARITAL_STATUS_LABELS,
  type PublicProfile,
} from '@matchtable/shared'
import { type ReactNode, useState } from 'react'

import styles from './CompareTable.module.css'

export type CompareColumn = {
  id: string
  profile: PublicProfile
  label?: string
  isOwn?: boolean
  onRemove?: () => void
  actions?: ReactNode
}

export type CompareTableProps = {
  columns: CompareColumn[]
  pinOwnProfile?: boolean
}

type CompareRow = {
  key: string
  label: string
  getValue: (profile: PublicProfile) => string
  longText?: boolean
}

const ROWS: CompareRow[] = [
  {
    key: 'age',
    label: '年龄',
    getValue: (p) => {
      const age = calculateAge(p.birthday)
      return age !== null ? String(age) : '—'
    },
  },
  {
    key: 'heightWeight',
    label: '身高 / 体重',
    getValue: (p) => {
      const h = p.height ? `${p.height} cm` : '—'
      const w = p.weight ? `${p.weight} kg` : '—'
      return `${h} / ${w}`
    },
  },
  {
    key: 'education',
    label: '学历 / 学校',
    getValue: (p) => {
      const edu = p.education ? EDUCATION_LABELS[p.education] : '—'
      const school = p.school ?? '—'
      return `${edu} / ${school}`
    },
  },
  { key: 'city', label: '城市', getValue: (p) => p.city ?? '—' },
  {
    key: 'occupation',
    label: '职业 / 收入',
    getValue: (p) => {
      const occ = p.occupation ?? '—'
      const inc = p.income ? INCOME_LABELS[p.income] : '—'
      return `${occ} / ${inc}`
    },
  },
  {
    key: 'assets',
    label: '房产 / 车辆',
    getValue: (p) => `${p.house ? '有' : '无'} / ${p.car ? '有' : '无'}`,
  },
  {
    key: 'marital',
    label: '婚姻状况',
    getValue: (p) => (p.maritalStatus ? MARITAL_STATUS_LABELS[p.maritalStatus] : '—'),
  },
  {
    key: 'ldr',
    label: '接受异地',
    getValue: (p) => (p.acceptLdr ? '是' : '否'),
  },
  {
    key: 'hobbies',
    label: '兴趣爱好',
    getValue: (p) => (p.hobbies?.length ? p.hobbies.join(', ') : '—'),
  },
  {
    key: 'bio',
    label: '个人简介',
    getValue: (p) => p.bio ?? '—',
    longText: true,
  },
  {
    key: 'requirements',
    label: '择偶要求',
    getValue: (p) => formatRequirementsDisplay(p.requirements) || '—',
    longText: true,
  },
]

function CellValue({ value, longText }: { value: string; longText?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  if (!longText || value === '—' || value.length <= 80) {
    return <span>{value}</span>
  }
  return (
    <span>
      {expanded ? value : `${value.slice(0, 80)}…`}
      <button type="button" className={styles.expandBtn} onClick={() => setExpanded(!expanded)}>
        {expanded ? '收起' : '展开'}
      </button>
    </span>
  )
}

export function CompareTable({ columns, pinOwnProfile = false }: CompareTableProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.labelCol}>对比</th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={[styles.profileCol, pinOwnProfile && col.isOwn ? styles.ownCol : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.headerCell}>
                    {col.profile.avatarUrl ? (
                      <img
                        src={col.profile.avatarUrl}
                        alt={col.profile.nickname ?? '用户照片'}
                        className={styles.headerAvatar}
                      />
                    ) : (
                      <div className={styles.headerAvatarPlaceholder} />
                    )}
                    <span>{col.label ?? col.profile.nickname ?? '资料'}</span>
                    {col.onRemove ? (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={col.onRemove}
                        aria-label="从对比中移除"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.key}>
                <th className={styles.labelCol}>{row.label}</th>
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={[styles.profileCol, pinOwnProfile && col.isOwn ? styles.ownCol : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <CellValue value={row.getValue(col.profile)} longText={row.longText} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th className={styles.labelCol}>操作</th>
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={[styles.profileCol, pinOwnProfile && col.isOwn ? styles.ownCol : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  {!col.isOwn && col.actions ? (
                    <div className={styles.footerActions}>{col.actions}</div>
                  ) : null}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
