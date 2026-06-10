import type { SubmitReportInput } from '@matchtable/shared'
import { mutationOptions } from '@tanstack/react-query'

import { submitReport } from './server'

export const submitReportMutationOptions = mutationOptions({
  mutationFn: (data: SubmitReportInput) => submitReport({ data }),
})
