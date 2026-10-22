import type { APIGatewayProxyEventV2 } from 'aws-lambda'

export function parseEvent(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body ?? '{}')
  const params = event.pathParameters

  return {
    body,
    params,
  }
}
