import {
  EDUCATION_LABELS,
  EDUCATION_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  INCOME_LABELS,
  INCOME_OPTIONS,
  MARITAL_STATUS_LABELS,
  MARITAL_STATUS_OPTIONS,
  profileFormSchema,
  type ProfileFormValues,
} from '@matchtable/shared'
import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

const defaultValues: ProfileFormValues = {
  nickname: '',
  gender: 'other',
  birthday: '',
  height: undefined,
  weight: undefined,
  education: undefined,
  school: '',
  city: '',
  occupation: '',
  income: undefined,
  house: false,
  car: false,
  maritalStatus: undefined,
  acceptLdr: false,
  hobbies: [],
  bio: '',
  requirements: '',
  wechat: '',
  line: '',
  telegram: '',
  email: '',
}

export type ProfileFormProps = {
  initialValues?: Partial<ProfileFormValues>
  onSubmit: (values: ProfileFormValues) => Promise<void>
  submitLabel?: string
  showContact?: boolean
}

export function ProfileForm({
  initialValues,
  onSubmit,
  submitLabel = '保存资料',
  showContact = false,
}: ProfileFormProps) {
  const [hobbyInput, setHobbyInput] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { ...defaultValues, ...initialValues },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const parsed = profileFormSchema.safeParse(value)
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? '校验失败')
        return
      }
      await onSubmit(parsed.data)
    },
  })

  return (
    <form
      className="formSection"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field name="nickname">
        {(field) => (
          <Input
            label="昵称"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            required
          />
        )}
      </form.Field>

      <div className="formRow">
        <form.Field name="gender">
          {(field) => (
            <div className="filterField">
              <label htmlFor="gender">性别</label>
              <select
                id="gender"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as ProfileFormValues['gender'])}
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {GENDER_LABELS[g]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
        <form.Field name="birthday">
          {(field) => (
            <Input
              label="生日"
              type="date"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              required
            />
          )}
        </form.Field>
      </div>

      <div className="formRow">
        <form.Field name="height">
          {(field) => (
            <Input
              label="身高 (cm)"
              type="number"
              value={field.state.value ?? ''}
              onChange={(e) =>
                field.handleChange(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          )}
        </form.Field>
        <form.Field name="weight">
          {(field) => (
            <Input
              label="体重 (kg)"
              type="number"
              value={field.state.value ?? ''}
              onChange={(e) =>
                field.handleChange(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          )}
        </form.Field>
      </div>

      <div className="formRow">
        <form.Field name="city">
          {(field) => (
            <Input
              label="城市"
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
        <form.Field name="occupation">
          {(field) => (
            <Input
              label="职业"
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      </div>

      <div className="formRow">
        <form.Field name="education">
          {(field) => (
            <div className="filterField">
              <label htmlFor="education">学历</label>
              <select
                id="education"
                value={field.state.value ?? ''}
                onChange={(e) =>
                  field.handleChange(
                    (e.target.value || undefined) as ProfileFormValues['education'],
                  )
                }
              >
                <option value="">—</option>
                {EDUCATION_OPTIONS.map((e) => (
                  <option key={e} value={e}>
                    {EDUCATION_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
        <form.Field name="income">
          {(field) => (
            <div className="filterField">
              <label htmlFor="income">年收入</label>
              <select
                id="income"
                value={field.state.value ?? ''}
                onChange={(e) =>
                  field.handleChange((e.target.value || undefined) as ProfileFormValues['income'])
                }
              >
                <option value="">—</option>
                {INCOME_OPTIONS.map((i) => (
                  <option key={i} value={i}>
                    {INCOME_LABELS[i]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="school">
        {(field) => (
          <Input
            label="学校"
            value={field.state.value ?? ''}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      <form.Field name="maritalStatus">
        {(field) => (
          <div className="filterField">
            <label htmlFor="marital">婚姻状况</label>
            <select
              id="marital"
              value={field.state.value ?? ''}
              onChange={(e) =>
                field.handleChange(
                  (e.target.value || undefined) as ProfileFormValues['maritalStatus'],
                )
              }
            >
              <option value="">—</option>
              {MARITAL_STATUS_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {MARITAL_STATUS_LABELS[m]}
                </option>
              ))}
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="hobbies">
        {(field) => (
          <div className="filterField">
            <label htmlFor="hobbies">兴趣爱好</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="hobbies"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                placeholder="添加标签"
                className="filterField"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (hobbyInput.trim()) {
                    field.handleChange([...field.state.value, hobbyInput.trim()])
                    setHobbyInput('')
                  }
                }}
              >
                添加
              </Button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {field.state.value.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 4,
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => field.handleChange(field.state.value.filter((t) => t !== tag))}
                    style={{ marginLeft: 4, border: 'none', background: 'none', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      <form.Field name="bio">
        {(field) => (
          <div className="filterField">
            <label htmlFor="bio">个人简介</label>
            <textarea
              id="bio"
              rows={4}
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
              style={{
                padding: 'var(--space-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="requirements">
        {(field) => (
          <div className="filterField">
            <label htmlFor="requirements">择偶要求</label>
            <textarea
              id="requirements"
              rows={3}
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
              style={{
                padding: 'var(--space-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
              }}
            />
          </div>
        )}
      </form.Field>

      <div className="formRow">
        <form.Field name="house">
          {(field) => (
            <label className="checkboxLabel">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              有房
            </label>
          )}
        </form.Field>
        <form.Field name="car">
          {(field) => (
            <label className="checkboxLabel">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              有车
            </label>
          )}
        </form.Field>
        <form.Field name="acceptLdr">
          {(field) => (
            <label className="checkboxLabel">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              接受异地
            </label>
          )}
        </form.Field>
      </div>

      {showContact ? (
        <>
          <h3 className="pageTitle" style={{ fontSize: '1.125rem' }}>
            联系方式（私密）
          </h3>
          <form.Field name="wechat">
            {(field) => (
              <Input
                label="WeChat"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <form.Field name="line">
            {(field) => (
              <Input
                label="LINE"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <form.Field name="telegram">
            {(field) => (
              <Input
                label="Telegram"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
          <form.Field name="email">
            {(field) => (
              <Input
                label="邮箱"
                type="email"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </>
      ) : null}

      {submitError ? (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.875rem' }}>{submitError}</p>
      ) : null}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中…' : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
