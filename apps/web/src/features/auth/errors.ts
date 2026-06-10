import type { AuthError } from '@supabase/supabase-js'

export function mapAuthError(error: unknown): string {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return '操作失败，请稍后重试'
  }

  const message = String((error as AuthError).message).toLowerCase()

  if (message.includes('invalid login credentials')) {
    return '邮箱或密码错误'
  }
  if (message.includes('email not confirmed')) {
    return '请先验证邮箱后再登录'
  }
  if (message.includes('user already registered')) {
    return '该邮箱已注册，请直接登录'
  }
  if (message.includes('password should be at least')) {
    return '密码至少 6 位'
  }
  if (message.includes('unable to validate email address')) {
    return '邮箱格式无效'
  }
  if (message.includes('signup is disabled')) {
    return '当前暂不支持注册'
  }
  if (message.includes('rate limit')) {
    return '操作过于频繁，请稍后再试'
  }

  return (error as AuthError).message
}
