import { forgotPasswordSchema } from '@matchtable/shared'
import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { sendPasswordResetEmail } from '~/features/auth/client'
import { mapAuthError } from '~/features/auth/errors'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState(false)

  const form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      setFieldErrors({})

      const parsed = forgotPasswordSchema.safeParse(value)
      if (!parsed.success) {
        const next: Record<string, string> = {}
        for (const issue of parsed.error.issues) {
          const key = issue.path[0]
          if (typeof key === 'string' && !next[key]) {
            next[key] = issue.message
          }
        }
        setFieldErrors(next)
        return
      }

      try {
        await sendPasswordResetEmail(parsed.data.email)
        setSent(true)
      } catch (err) {
        console.error('Password reset error:', err)
        setSubmitError(mapAuthError(err))
      }
    },
  })

  return (
    <div className="authCard">
      <header className="authHeader">
        <h1 className="pageTitle">重置密码</h1>
        <p className="pageSubtitle">输入注册邮箱，我们将发送重置链接</p>
      </header>

      {sent ? (
        <div className="authNotice">
          <p>如果该邮箱已注册，你会收到一封包含重置链接的邮件。请检查收件箱与垃圾邮件文件夹。</p>
          <Link to="/login" className="authInlineLink">
            返回登录
          </Link>
        </div>
      ) : (
        <form
          className="authFormStack"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field name="email">
            {(field) => (
              <Input
                label="邮箱地址"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={field.state.value}
                error={fieldErrors.email}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>

          {submitError ? <p className="authError">{submitError}</p> : null}

          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? '发送中…' : '发送重置链接'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      )}

      <p className="authFooterLink">
        想起密码了？<Link to="/login">返回登录</Link>
      </p>
    </div>
  )
}
