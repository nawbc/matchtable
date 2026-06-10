import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'

import { ProfileForm } from '~/features/profile/ProfileForm'
import { createProfileMutationOptions } from '~/features/profile/queries'
import { prefetchMyProfile } from '~/lib/auth-guard'

export const Route = createFileRoute('/profile/create')({
  loader: async ({ context, location }) => {
    const profile = await prefetchMyProfile({ ...context, location })
    if (profile) {
      throw redirect({ to: '/profile/edit' })
    }
    return null
  },
  component: CreateProfilePage,
})

function CreateProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    ...createProfileMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      navigate({ to: '/profile/edit', search: { step: 'photos' } })
    },
  })

  return (
    <div>
      <h1 className="pageTitle">创建相亲表</h1>
      <p className="pageSubtitle">填写你的结构化相亲资料</p>
      <ProfileForm
        showContact
        submitLabel="创建资料"
        onSubmit={async (values) => {
          await mutation.mutateAsync(values)
        }}
      />
    </div>
  )
}
