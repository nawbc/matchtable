import type { RequestWithProfile } from '@matchtable/shared'
import { Button, TableCard } from '@matchtable/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import {
  acceptRequestMutationOptions,
  cancelRequestMutationOptions,
  contactForUserQueryOptions,
  receivedRequestsQueryOptions,
  rejectRequestMutationOptions,
  sentRequestsQueryOptions,
} from './queries'

import styles from './RequestList.module.css'

type Tab = 'sent' | 'received'

const STATUS_LABELS: Record<string, string> = {
  pending: '待处理',
  accepted: '已接受',
  rejected: '已拒绝',
  cancelled: '已取消',
}

function ContactInfo({ targetUserId }: { targetUserId: string }) {
  const { data: contact, isLoading, error } = useQuery(contactForUserQueryOptions(targetUserId))

  if (isLoading) return <p className={styles.contactLoading}>加载联系方式…</p>
  if (error || !contact) return null

  const fields = [
    { label: '微信', value: contact.wechat },
    { label: 'LINE', value: contact.line },
    { label: 'Telegram', value: contact.telegram },
    { label: '邮箱', value: contact.email },
  ].filter((f) => f.value)

  if (fields.length === 0) {
    return <p className={styles.contactEmpty}>对方尚未填写联系方式</p>
  }

  return (
    <dl className={styles.contactList}>
      {fields.map((f) => (
        <div key={f.label} className={styles.contactItem}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RequestItem({ request, tab }: { request: RequestWithProfile; tab: Tab }) {
  const queryClient = useQueryClient()
  const otherUserId = tab === 'sent' ? request.toUserId : request.fromUserId

  const acceptMutation = useMutation({
    ...acceptRequestMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social'] }),
  })
  const rejectMutation = useMutation({
    ...rejectRequestMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social'] }),
  })
  const cancelMutation = useMutation({
    ...cancelRequestMutationOptions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['social'] }),
  })

  const isPending = acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending

  return (
    <article className={styles.item}>
      <div className={styles.itemHeader}>
        <span className={[styles.status, styles[`status_${request.status}`]].join(' ')}>
          {STATUS_LABELS[request.status] ?? request.status}
        </span>
        <time className={styles.time} dateTime={request.createdAt}>
          {new Date(request.createdAt).toLocaleDateString('zh-CN')}
        </time>
      </div>

      <TableCard profile={request.profile} href={`/profile/${request.profile.id}`} compact />

      {request.message ? (
        <blockquote className={styles.message}>{request.message}</blockquote>
      ) : null}

      {request.status === 'accepted' ? <ContactInfo targetUserId={otherUserId} /> : null}

      {request.status === 'pending' ? (
        <div className={styles.actions}>
          {tab === 'received' ? (
            <>
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => acceptMutation.mutate(request.id)}
              >
                接受
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={isPending}
                onClick={() => rejectMutation.mutate(request.id)}
              >
                拒绝
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending}
              onClick={() => cancelMutation.mutate(request.id)}
            >
              取消请求
            </Button>
          )}
        </div>
      ) : null}
    </article>
  )
}

export function RequestList() {
  const [tab, setTab] = useState<Tab>('received')

  const sentQuery = useQuery(sentRequestsQueryOptions)
  const receivedQuery = useQuery(receivedRequestsQueryOptions)

  const requests = tab === 'sent' ? (sentQuery.data ?? []) : (receivedQuery.data ?? [])
  const isLoading = tab === 'sent' ? sentQuery.isLoading : receivedQuery.isLoading

  return (
    <div className={styles.root}>
      <div className={styles.tabs} role="tablist" aria-label="牵线请求">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'received'}
          className={[styles.tab, tab === 'received' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('received')}
        >
          已接收
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sent'}
          className={[styles.tab, tab === 'sent' ? styles.tabActive : ''].join(' ')}
          onClick={() => setTab('sent')}
        >
          已发送
        </button>
      </div>

      {isLoading ? (
        <div className="skeleton" style={{ height: 200 }} />
      ) : requests.length === 0 ? (
        <div className="emptyState">
          <p>{tab === 'sent' ? '暂无已发送的请求。' : '暂无收到的请求。'}</p>
          <Link to="/discover" search={{ sort: 'newest', page: 1, pageSize: 20 }}>
            去发现广场
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((request) => (
            <RequestItem key={request.id} request={request} tab={tab} />
          ))}
        </div>
      )}
    </div>
  )
}
