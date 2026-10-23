import { randomUUID } from 'node:crypto'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoDBClient } from '@clients/dynamo.client'
import { faker } from '@faker-js/faker'
import { env } from '@shared/config/env'
import { response } from '@shared/utils/response'

export async function handler() {
  const totalUsers = 5_000

  const commands = Array.from(
    { length: totalUsers },
    () =>
      new PutCommand({
        TableName: env.LEADS_TABLE,
        Item: {
          id: randomUUID(),
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          jobTitle: faker.person.jobTitle(),
        },
      }),
  )

  const responses = await Promise.allSettled(
    commands.map((command) => dynamoDBClient.send(command)),
  )

  const totalCreatedLeads = responses.filter(
    (response) => response.status === 'fulfilled',
  ).length

  return response({
    statusCode: 201,
    body: {
      totalCreatedLeads,
    },
  })
}
