import type { Http } from '@app-types/http'
import type { APIGatewayProxyResultV2 } from 'aws-lambda'

export function response({
  statusCode,
  body = {},
  headers = {},
}: Http.Response): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  }
}
