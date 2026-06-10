import {
  EDUCATION_LABELS,
  EDUCATION_OPTIONS,
  GENDER_LABELS,
  GENDER_OPTIONS,
  INCOME_LABELS,
  INCOME_OPTIONS,
  MARITAL_STATUS_LABELS,
  MARITAL_STATUS_OPTIONS,
  parseRequirementsRaw,
  profileFormSchema,
  serializeRequirements,
  type ProfileFormValues,
  type Requirements,
} from '@matchtable/shared'
import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useMemo, useState } from 'react'

const emptyRequirements: Requirements = {}

function buildInitialRequirements(initial?: Partial<ProfileFormValues>) {
  const parsed = parseRequirementsRaw(initial?.requirements)
  if (parsed.kind === 'structured') return parsed.data
  return emptyRequirements
}

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
  const initialParsed = useMemo(
    () => parseRequirementsRaw(initialValues?.requirements),
    [initialValues?.requirements],
  )
  const [isRawRequirements] = useState(initialParsed.kind === 'raw')
  const [rawRequirements, setRawRequirements] = useState(
    initialParsed.kind === 'raw' ? initialParsed.text : '',
  )
  const [requirementsFields, setRequirementsFields] = useState<Requirements>(() =>
    buildInitialRequirements(initialValues),
  )

  const form = useForm({
    defaultValues: { ...defaultValues, ...initialValues },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      const requirements = isRawRequirements
        ? rawRequirements
        : serializeRequirements(requirementsFields)
      const parsed = profileFormSchema.safeParse({ ...value, requirements })
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

      <div className="filterField">
        <span className="filterFieldLabel">择偶要求</span>
        {isRawRequirements ? (
          <>
            <textarea
              id="requirements-raw"
              rows={3}
              value={rawRequirements}
              onChange={(e) => setRawRequirements(e.target.value)}
              style={{
                padding: 'var(--space-sm)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
              无法解析为结构化格式，显示为原始文本。
            </p>
          </>
        ) : (
          <>
            <div className="formRow">
              <Input
                label="年龄下限"
                type="number"
                value={requirementsFields.ageMin ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    ageMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                label="年龄上限"
                type="number"
                value={requirementsFields.ageMax ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    ageMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="formRow">
              <Input
                label="身高下限 (cm)"
                type="number"
                value={requirementsFields.heightMin ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    heightMin: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
              <Input
                label="身高上限 (cm)"
                type="number"
                value={requirementsFields.heightMax ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    heightMax: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="formRow">
              <div className="filterField">
                <label htmlFor="req-education">学历要求</label>
                <select
                  id="req-education"
                  value={requirementsFields.education ?? ''}
                  onChange={(e) =>
                    setRequirementsFields((prev) => ({
                      ...prev,
                      education: (e.target.value || undefined) as Requirements['education'],
                    }))
                  }
                >
                  <option value="">—</option>
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {EDUCATION_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="城市要求"
                value={requirementsFields.city ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    city: e.target.value || undefined,
                  }))
                }
              />
            </div>
            <div className="filterField">
              <label htmlFor="req-marital">婚姻状况要求</label>
              <select
                id="req-marital"
                value={requirementsFields.maritalStatus ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    maritalStatus: (e.target.value || undefined) as Requirements['maritalStatus'],
                  }))
                }
              >
                <option value="">—</option>
                {MARITAL_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {MARITAL_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>
            <div className="filterField">
              <label htmlFor="req-notes">补充说明</label>
              <textarea
                id="req-notes"
                rows={3}
                value={requirementsFields.notes ?? ''}
                onChange={(e) =>
                  setRequirementsFields((prev) => ({
                    ...prev,
                    notes: e.target.value || undefined,
                  }))
                }
                style={{
                  padding: 'var(--space-sm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </>
        )}
      </div>

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
