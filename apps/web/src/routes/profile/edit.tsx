import { PHOTO_MAX, PHOTO_MIN } from '@matchtable/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { ProfileForm } from '~/features/profile/ProfileForm'
import {
  deletePhotoMutationOptions,
  myProfileQueryOptions,
  reorderPhotosMutationOptions,
  setPrimaryPhotoMutationOptions,
  updateProfileMutationOptions,
  uploadPhotoMutationOptions,
} from '~/features/profile/queries'
import { dbToFormValues } from '~/features/profile/server'
import { requireAuth } from '~/lib/auth-guard'

const ONBOARDING_STEPS = [
  { key: 'basic', label: '基本信息' },
  { key: 'photos', label: '照片' },
  { key: 'publish', label: '发布' },
] as const

type OnboardingStep = (typeof ONBOARDING_STEPS)[number]['key']

const STEP_HINTS: Record<OnboardingStep, string> = {
  basic: '确认并完善你的基本信息，可随时返回修改。',
  photos: `上传至少 ${PHOTO_MIN} 张照片，第一张将作为头像展示。`,
  publish: '检查资料无误后，点击「发布相亲表」即可在发现广场展示。',
}

const profileEditSearchSchema = z.object({
  step: z.enum(['basic', 'photos', 'publish']).optional(),
})

export const Route = createFileRoute('/profile/edit')({
  validateSearch: (search) => profileEditSearchSchema.parse(search),
  beforeLoad: ({ context }) => requireAuth(context),
  component: EditProfilePage,
})

function EditProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { step } = Route.useSearch()
  const photosRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLElement>(null)
  const { data: profile, isLoading } = useQuery(myProfileQueryOptions)

  const updateMutation = useMutation({
    ...updateProfileMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate({ to: '/me' })
    },
  })

  const uploadMutation = useMutation({
    ...uploadPhotoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  const deleteMutation = useMutation({
    ...deletePhotoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  const reorderMutation = useMutation({
    ...reorderPhotosMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  const primaryMutation = useMutation({
    ...setPrimaryPhotoMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  })

  useEffect(() => {
    if (!step || !profile || profile.status !== 'hidden') return
    const target =
      step === 'photos'
        ? photosRef.current
        : step === 'basic' || step === 'publish'
          ? formRef.current
          : null
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step, profile])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (profile.photos.length >= PHOTO_MAX) return

    const buffer = await file.arrayBuffer()
    const base64 = btoa(new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ''))
    await uploadMutation.mutateAsync({
      fileName: file.name,
      contentType: file.type,
      base64,
    })
  }

  if (isLoading) return <div className="skeleton" style={{ height: 400 }} />
  if (!profile) {
    navigate({ to: '/profile/create' })
    return null
  }

  const isHidden = profile.status === 'hidden'
  const activeStep: OnboardingStep = step ?? 'basic'

  const initialValues = dbToFormValues(
    {
      id: profile.id,
      user_id: profile.userId,
      nickname: profile.nickname,
      gender: profile.gender,
      birthday: profile.birthday,
      avatar_url: profile.avatarUrl,
      height: profile.height,
      weight: profile.weight,
      education: profile.education,
      school: profile.school,
      city: profile.city,
      occupation: profile.occupation,
      income: profile.income,
      house: profile.house,
      car: profile.car,
      marital_status: profile.maritalStatus,
      accept_ldr: profile.acceptLdr,
      hobbies: profile.hobbies,
      requirements: profile.requirements,
      bio: profile.bio,
      status: profile.status,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    },
    {
      wechat: profile.wechat ?? '',
      line: profile.line ?? '',
      telegram: profile.telegram ?? '',
      email: profile.email ?? '',
    },
  )

  return (
    <div>
      <h1 className="pageTitle">编辑相亲表</h1>
      <p className="pageSubtitle">{isHidden ? '完善资料并发布到发现广场' : '更新资料与照片'}</p>

      {isHidden ? (
        <nav className="onboardingSteps" aria-label="发布步骤">
          {ONBOARDING_STEPS.map((item, index) => (
            <Link
              key={item.key}
              to="/profile/edit"
              search={{ step: item.key }}
              className={['onboardingStep', activeStep === item.key ? 'onboardingStepActive' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <span className="onboardingStepIndex">{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {isHidden ? <p className="onboardingStepHint">{STEP_HINTS[activeStep]}</p> : null}

      <section ref={photosRef} id="photos" style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>照片</h2>
        <div className="photoGrid">
          {profile.photos.map((photo, index) => (
            <div key={photo.id} className="photoItem">
              <img src={photo.url} alt="" />
              <div className="photoActions">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const ids = [...profile.photos.map((p) => p.id)]
                      ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
                      reorderMutation.mutate(ids)
                    }}
                  >
                    ↑
                  </button>
                ) : null}
                {index < profile.photos.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const ids = [...profile.photos.map((p) => p.id)]
                      ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
                      reorderMutation.mutate(ids)
                    }}
                  >
                    ↓
                  </button>
                ) : null}
                <button type="button" onClick={() => primaryMutation.mutate(photo.id)}>
                  ★
                </button>
                <button type="button" onClick={() => deleteMutation.mutate(photo.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        {profile.photos.length < PHOTO_MAX ? (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ marginTop: 16 }}
          />
        ) : null}
      </section>

      <section ref={formRef} id="basic">
        <ProfileForm
          initialValues={initialValues}
          showContact
          submitLabel={isHidden ? '发布相亲表' : '保存修改'}
          onSubmit={async (values) => {
            await updateMutation.mutateAsync(values)
          }}
        />
      </section>
    </div>
  )
}
