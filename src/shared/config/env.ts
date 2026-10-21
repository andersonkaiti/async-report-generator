import { z } from 'zod'

const envSchema = z.object({
  LEADS_TABLE: z.string(),
})

export const env = envSchema.parse(process.env)
