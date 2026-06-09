import { PHOTO_MAX } from '@matchtable/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

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

export const Route = createFileRoute('/profile/edit')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: EditProfilePage,
})

function EditProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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

  const initialValues = dbToFormValues({
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
    wechat: profile.wechat,
    telegram: profile.telegram,
    line: profile.line,
    email: profile.email,
    status: profile.status,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  })

  return (
    <div>
      <h1 className="pageTitle">编辑相亲表</h1>
      <p className="pageSubtitle">更新资料与照片</p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
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

      <ProfileForm
        initialValues={initialValues}
        showContact
        submitLabel="保存修改"
        onSubmit={async (values) => {
          await updateMutation.mutateAsync(values)
        }}
      />
    </div>
  )
}
