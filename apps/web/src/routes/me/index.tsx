import { Button, TableCard } from '@matchtable/ui'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'

import { myProfileQueryOptions } from '~/features/profile/queries'
import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/me/')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: MeIndexPage,
})

function MeIndexPage() {
  const navigate = useNavigate()
  const { data: profile, isLoading } = useQuery(myProfileQueryOptions)

  if (isLoading) return <div className="skeleton" style={{ height: 400 }} />

  if (!profile) {
    return (
      <div className="emptyState">
        <h1 className="pageTitle">我的相亲表</h1>
        <p>你还没有创建资料。</p>
        <Link to="/profile/create">
          <Button style={{ marginTop: 16 }}>创建资料</Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="pageTitle">我的相亲表</h1>
        <Button variant="secondary" onClick={() => navigate({ to: '/profile/edit' })}>
          编辑
        </Button>
      </div>
      <TableCard profile={profile} />
    </div>
  )
}
