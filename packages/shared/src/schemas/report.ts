import { z } from 'zod'

import { REPORT_DETAIL_MAX_LENGTH, REPORT_REASON_OPTIONS } from '../constants'

export const reportReasonSchema = z.enum(REPORT_REASON_OPTIONS)

export const submitReportSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: reportReasonSchema,
  detail: z.string().min(1).max(REPORT_DETAIL_MAX_LENGTH),
})

export type SubmitReportInput = z.infer<typeof submitReportSchema>
