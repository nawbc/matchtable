import { emailLoginSchema } from '@matchtable/shared'
import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { signInWithEmailPassword } from '~/features/auth/client'
import { mapAuthError } from '~/features/auth/errors'
import { sessionQueryOptions } from '~/features/auth/queries'

export function EmailLoginForm() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      setFieldErrors({})

      const parsed = emailLoginSchema.safeParse(value)
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
        await signInWithEmailPassword(parsed.data.email, parsed.data.password)
        await queryClient.invalidateQueries({ queryKey: sessionQueryOptions.queryKey })
        navigate({ to: '/me' })
      } catch (err) {
        console.error('Email login error:', err)
        setSubmitError(mapAuthError(err))
      }
    },
  })

  return (
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

      <form.Field name="password">
        {(field) => (
          <Input
            label="密码"
            type="password"
            autoComplete="current-password"
            placeholder="至少 6 位"
            value={field.state.value}
            error={fieldErrors.password}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>

      <div className="authForgotRow">
        <Link to="/forgot-password" className="authInlineLink">
          忘记密码？
        </Link>
      </div>

      {submitError ? <p className="authError">{submitError}</p> : null}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? '登录中…' : '登录'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
