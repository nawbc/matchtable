import { z } from 'zod'

export const emailLoginSchema = z.object({
  email: z.string().trim().email('请输入有效邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
})

export type EmailLoginValues = z.infer<typeof emailLoginSchema>

export const emailRegisterSchema = emailLoginSchema
  .extend({
    confirmPassword: z.string().min(6, '请再次输入密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

export type EmailRegisterValues = z.infer<typeof emailRegisterSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('请输入有效邮箱地址'),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
