import { z } from 'zod'

export const AGE_MIN = 18
export const AGE_MAX = 99
export const HEIGHT_MIN = 100
export const HEIGHT_MAX = 250
export const WEIGHT_MIN = 30
export const WEIGHT_MAX = 200

const intAge = z
  .number({ error: '请输入有效年龄' })
  .int('年龄须为整数')
  .min(AGE_MIN, `年龄不能小于 ${AGE_MIN} 岁`)
  .max(AGE_MAX, `年龄不能大于 ${AGE_MAX} 岁`)

const intHeight = z
  .number({ error: '请输入有效身高' })
  .int('身高须为整数')
  .min(HEIGHT_MIN, `身高不能低于 ${HEIGHT_MIN} cm`)
  .max(HEIGHT_MAX, `身高不能超过 ${HEIGHT_MAX} cm`)

const intWeight = z
  .number({ error: '请输入有效体重' })
  .int('体重须为整数')
  .min(WEIGHT_MIN, `体重不能低于 ${WEIGHT_MIN} kg`)
  .max(WEIGHT_MAX, `体重不能超过 ${WEIGHT_MAX} kg`)

const coercedIntAge = z.coerce
  .number({ error: '请输入有效年龄' })
  .int('年龄须为整数')
  .min(AGE_MIN, `年龄不能小于 ${AGE_MIN} 岁`)
  .max(AGE_MAX, `年龄不能大于 ${AGE_MAX} 岁`)

const coercedIntHeight = z.coerce
  .number({ error: '请输入有效身高' })
  .int('身高须为整数')
  .min(HEIGHT_MIN, `身高不能低于 ${HEIGHT_MIN} cm`)
  .max(HEIGHT_MAX, `身高不能超过 ${HEIGHT_MAX} cm`)

export const optionalAge = intAge.optional()
export const optionalHeight = intHeight.optional()
export const optionalWeight = intWeight.optional()

export const requiredHeight = intHeight
export const requiredCity = z
  .string()
  .trim()
  .min(1, '请填写城市')
  .max(100, '城市不能超过 100 个字符')

export const optionalCoercedAge = coercedIntAge.optional()
export const optionalCoercedHeight = coercedIntHeight.optional()

export const optionalEmail = z.string().email('请输入有效邮箱地址').optional().or(z.literal(''))

export const shortText = (max: number, label = '内容') =>
  z.string().max(max, `${label}不能超过 ${max} 个字符`)
