import { Button } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { sessionQueryOptions } from '~/features/auth/queries'

import { favoritesQueryOptions, toggleFavoriteMutationOptions } from './queries'

export type FavoriteButtonProps = {
  profileId: string
}

export function FavoriteButton({ profileId }: FavoriteButtonProps) {
  const queryClient = useQueryClient()
  const { data: session } = useQuery(sessionQueryOptions)
  const { data: favorites = [] } = useQuery({
    ...favoritesQueryOptions,
    enabled: !!session,
  })

  const isFavorited = favorites.some((p) => p.id === profileId)

  const mutation = useMutation({
    ...toggleFavoriteMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'favorites'] })
    },
  })

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="secondary">收藏</Button>
      </Link>
    )
  }

  return (
    <Button
      variant={isFavorited ? 'primary' : 'secondary'}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate(profileId)}
    >
      {mutation.isPending ? '处理中…' : isFavorited ? '已收藏' : '收藏'}
    </Button>
  )
}
