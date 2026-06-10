import {
  REPORT_DETAIL_MAX_LENGTH,
  REPORT_REASON_LABELS,
  REPORT_REASON_OPTIONS,
  submitReportSchema,
  type ReportReason,
  type SubmitReportInput,
} from '@matchtable/shared'
import { Button } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useEffect, useId, useRef, useState } from 'react'

import { sessionQueryOptions } from '~/features/auth/queries'
import { profileOwnerUserIdQueryOptions } from '~/features/social/queries'

import { submitReportMutationOptions } from './queries'

import styles from './ReportDialog.module.css'

export type ReportDialogProps = {
  profileId: string
}

type ReportFormValues = {
  reason: ReportReason
  detail: string
}

const defaultValues: ReportFormValues = {
  reason: 'fake_profile',
  detail: '',
}

export function ReportDialog({ profileId }: ReportDialogProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: session } = useQuery(sessionQueryOptions)
  const { data: targetUserId, isLoading: ownerLoading } = useQuery({
    ...profileOwnerUserIdQueryOptions(profileId),
    enabled: !!session && open,
  })

  const mutation = useMutation(submitReportMutationOptions)

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!targetUserId) {
        setSubmitError('无法获取用户信息')
        return
      }

      setSubmitError(null)
      const payload: SubmitReportInput = {
        targetUserId,
        reason: value.reason,
        detail: value.detail.trim(),
      }
      const parsed = submitReportSchema.safeParse(payload)
      if (!parsed.success) {
        setSubmitError(parsed.error.issues[0]?.message ?? '校验失败')
        return
      }

      try {
        await mutation.mutateAsync(parsed.data)
        form.reset()
        setOpen(false)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : '提交失败，请稍后重试')
      }
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      return
    }

    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleClose() {
    if (mutation.isPending) return
    setSubmitError(null)
    form.reset()
    mutation.reset()
    setOpen(false)
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="secondary">举报</Button>
      </Link>
    )
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        举报
      </Button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        onClose={handleClose}
        onCancel={(e) => {
          e.preventDefault()
          handleClose()
        }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            举报用户
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="关闭"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Field name="reason">
            {(field) => (
              <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
                <legend
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-sm)',
                  }}
                >
                  举报原因
                </legend>
                <ul className={styles.reasonList}>
                  {REPORT_REASON_OPTIONS.map((reason) => (
                    <li key={reason}>
                      <label className={styles.reasonOption}>
                        <input
                          type="radio"
                          name="report-reason"
                          value={reason}
                          checked={field.state.value === reason}
                          onChange={() => field.handleChange(reason)}
                        />
                        <span>{REPORT_REASON_LABELS[reason]}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </fieldset>
            )}
          </form.Field>

          <form.Field name="detail">
            {(field) => (
              <div className={styles.detailField}>
                <label htmlFor="report-detail">详细说明</label>
                <textarea
                  id="report-detail"
                  rows={4}
                  value={field.state.value}
                  maxLength={REPORT_DETAIL_MAX_LENGTH}
                  placeholder="请描述具体情况，便于我们核实处理"
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  required
                />
              </div>
            )}
          </form.Field>

          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={mutation.isPending || ownerLoading || !targetUserId}>
              {mutation.isPending ? '提交中…' : '提交举报'}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  )
}
