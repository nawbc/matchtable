import { CONNECTION_REQUEST_MESSAGE_MAX, connectionRequestSchema } from '@matchtable/shared'
import { Button } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { sessionQueryOptions } from '~/features/auth/queries'

import {
  profileOwnerUserIdQueryOptions,
  sendRequestMutationOptions,
  sentRequestsQueryOptions,
} from './queries'

import styles from './RequestDialog.module.css'

export type RequestDialogProps = {
  profileId: string
  triggerLabel?: string
}

type FormValues = {
  message: string
}

export function RequestDialog({ profileId, triggerLabel = '发送牵线' }: RequestDialogProps) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  const { data: session } = useQuery(sessionQueryOptions)
  const { data: toUserId, isLoading: ownerLoading } = useQuery({
    ...profileOwnerUserIdQueryOptions(profileId),
    enabled: !!session && open,
  })
  const { data: sentRequests = [] } = useQuery({
    ...sentRequestsQueryOptions,
    enabled: !!session,
  })

  const pendingToUser = toUserId
    ? sentRequests.find((r) => r.toUserId === toUserId && r.status === 'pending')
    : undefined
  const acceptedToUser = toUserId
    ? sentRequests.find((r) => r.toUserId === toUserId && r.status === 'accepted')
    : undefined

  const mutation = useMutation({
    ...sendRequestMutationOptions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'requests'] })
      setOpen(false)
      setSubmitError(null)
    },
    onError: (error: Error) => {
      setSubmitError(error.message)
    },
  })

  const form = useForm({
    defaultValues: { message: '' } satisfies FormValues,
    onSubmit: async ({ value }) => {
      if (!toUserId) return
      setSubmitError(null)
      const parsed = connectionRequestSchema.safeParse({
        toUserId,
        message: value.message,
      })
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? '校验失败')
        return
      }
      await mutation.mutateAsync(parsed.data)
      form.reset()
    },
  })

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="secondary">{triggerLabel}</Button>
      </Link>
    )
  }

  if (acceptedToUser) {
    return (
      <Button variant="secondary" disabled>
        已接受
      </Button>
    )
  }

  if (pendingToUser) {
    return (
      <Button variant="secondary" disabled>
        请求待处理
      </Button>
    )
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="request-dialog-title"
        onClose={() => setOpen(false)}
      >
        <h2 id="request-dialog-title" className={styles.title}>
          发送牵线请求
        </h2>
        <p className={styles.subtitle}>
          附上一段简短留言（可选，最多 {CONNECTION_REQUEST_MESSAGE_MAX} 字）
        </p>

        {ownerLoading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : (
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field name="message">
              {(field) => (
                <div className={styles.field}>
                  <label htmlFor="request-message">留言</label>
                  <textarea
                    id="request-message"
                    className={styles.textarea}
                    value={field.state.value}
                    maxLength={CONNECTION_REQUEST_MESSAGE_MAX}
                    rows={4}
                    placeholder="你好，我对你的资料很感兴趣…"
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <span className={styles.counter}>
                    {field.state.value.length}/{CONNECTION_REQUEST_MESSAGE_MAX}
                  </span>
                </div>
              )}
            </form.Field>

            {submitError ? <p className={styles.error}>{submitError}</p> : null}

            <div className={styles.actions}>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                取消
              </Button>
              <Button type="submit" disabled={mutation.isPending || !toUserId}>
                {mutation.isPending ? '发送中…' : '发送'}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
