import { paginateScan } from '@aws-sdk/lib-dynamodb'
import { dynamoDBClient } from '@clients/dynamo.client'
import { env } from '@shared/config/env'

export function getLeadsGenerator() {
  const paginator = paginateScan(
    { client: dynamoDBClient },
    { TableName: env.LEADS_TABLE },
  )

  return paginator
}
