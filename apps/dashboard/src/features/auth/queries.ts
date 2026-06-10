import { queryOptions } from '@tanstack/react-query'

import { getAuthSession } from './server'

export const sessionQueryOptions = queryOptions({
  queryKey: ['auth', 'session'],
  queryFn: () => getAuthSession(),
})
