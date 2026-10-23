import { z } from 'zod'

const envSchema = z.object({
  LEADS_TABLE: z.string(),
  GENERATE_REPORT_QUEUE_URL: z.url(),
  REPORTS_BUCKET_NAME: z.string(),
  RESEND_API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
