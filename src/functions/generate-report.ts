import { SendMessageCommand } from '@aws-sdk/client-sqs'
import { sqsClient } from '@clients/sqs.client'
import { env } from '@shared/config/env'
import { parseEvent } from '@shared/utils/parse-event'
import { response } from '@shared/utils/response'
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import { z } from 'zod'

const generateReportSchema = z.object({
  userId: z.string(),
  filters: z.unknown().optional(),
})

export async function handler(event: APIGatewayProxyEventV2) {
  const { success, error, data } = generateReportSchema.safeParse(
    parseEvent(event).body,
  )

  if (!success) {
    return response({
      statusCode: 400,
      body: {
        error: z.prettifyError(error),
      },
    })
  }

  const { userId, filters } = data

  const command = new SendMessageCommand({
    QueueUrl: env.GENERATE_REPORT_QUEUE_URL,
    MessageBody: JSON.stringify({
      userId,
      filters,
    }),
  })

  await sqsClient.send(command)

  return response({
    statusCode: 200,
    body: {
      message:
        "The report is being generated. You'll receive an email when it's ready",
    },
  })
}
