import { createFileRoute } from '@tanstack/react-router'

import { RequestList } from '~/features/social/RequestList'
import { requireAuth } from '~/lib/auth-guard'

export const Route = createFileRoute('/me/requests')({
  beforeLoad: ({ context }) => requireAuth(context),
  component: RequestsPage,
})

function RequestsPage() {
  return (
    <div>
      <h1 className="pageTitle">牵线请求</h1>
      <p className="pageSubtitle">发送与管理牵线请求，接受后可查看联系方式</p>
      <RequestList />
    </div>
  )
}
