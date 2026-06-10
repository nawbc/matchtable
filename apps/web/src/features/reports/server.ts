import { submitReportSchema, type SubmitReportInput } from '@matchtable/shared'
import { createServerFn } from '@tanstack/react-start'

import { getServerSupabase, requireAuthUserId } from '~/lib/supabase-server'

export const submitReport = createServerFn({ method: 'POST' })
  .validator((data: SubmitReportInput) => submitReportSchema.parse(data))
  .handler(async ({ data }) => {
    const reporterId = await requireAuthUserId()

    if (reporterId === data.targetUserId) {
      throw new Error('不能举报自己')
    }

    const supabase = getServerSupabase()

    const { error } = await supabase.from('reports').insert({
      reporter_id: reporterId,
      target_user_id: data.targetUserId,
      reason: data.reason,
      detail: data.detail,
    })

    if (error) {
      console.error('submitReport error:', error.message)
      throw new Error(error.message)
    }

    return { success: true as const }
  })
