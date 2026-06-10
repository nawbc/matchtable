import { Button, Input } from '@matchtable/ui'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { sendPhoneOtp, verifyPhoneOtp } from '~/features/auth/client'
import { mapAuthError } from '~/features/auth/errors'
import { resolveAuthNavigationDestination } from '~/features/auth/post-auth'

type PhoneOtpFormProps = {
  mode: 'login' | 'register'
  redirect?: string
}

export function PhoneOtpForm({ mode, redirect }: PhoneOtpFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)

  const form = useForm({
    defaultValues: { phone: '', code: '' },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        if (!otpSent) {
          if (!value.phone.trim()) {
            setSubmitError('请输入手机号码')
            return
          }
          await sendPhoneOtp(value.phone)
          setOtpSent(true)
          return
        }

        await verifyPhoneOtp(value.phone, value.code)
        const destination = await resolveAuthNavigationDestination(
          queryClient,
          mode === 'login' ? redirect : undefined,
        )
        navigate({ href: destination })
      } catch (err) {
        console.error('Phone OTP error:', err)
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
      <form.Field name="phone">
        {(field) => (
          <Input
            label="手机号码"
            type="tel"
            autoComplete="tel"
            placeholder="+8613800138000"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            disabled={otpSent}
          />
        )}
      </form.Field>

      {otpSent ? (
        <form.Field name="code">
          {(field) => (
            <Input
              label="验证码"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6 位验证码"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>
      ) : null}

      {submitError ? <p className="authError">{submitError}</p> : null}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {otpSent
              ? isSubmitting
                ? '验证中…'
                : mode === 'login'
                  ? '验证并登录'
                  : '验证并继续'
              : '发送验证码'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}
