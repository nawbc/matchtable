import type { ZodError } from 'zod'

const FIELD_LABELS: Record<string, string> = {
  ageMin: '年龄下限',
  ageMax: '年龄上限',
  heightMin: '身高下限',
  heightMax: '身高上限',
  height: '身高',
  weight: '体重',
  nickname: '昵称',
  birthday: '生日',
  email: '邮箱',
  bio: '个人简介',
  requirements: '择偶要求',
  detail: '举报详情',
  message: '留言',
  keyword: '关键词',
  city: '城市',
  notes: '补充说明',
}

export function firstZodIssueMessage(error: ZodError, fallback = '填写有误，请检查后重试'): string {
  const issue = error.issues[0]
  if (!issue) return fallback

  const field = issue.path[0]
  if (typeof field === 'string' && FIELD_LABELS[field]) {
    return `${FIELD_LABELS[field]}：${issue.message}`
  }

  return issue.message
}

export function zodFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !errors[key]) {
      errors[key] = issue.message
    }
  }

  return errors
}
