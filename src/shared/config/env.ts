import { z } from 'zod'

const envSchema = z.object({
  LEADS_TABLE: z.string(),
  GENERATE_REPORT_QUEUE_URL: z.url(),
})

export const env = envSchema.parse(process.env)
