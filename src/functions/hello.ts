import { response } from '@utils/response'

export async function handler() {
  return response({
    statusCode: 200,
    body: {
      message: 'Hello, World!',
    },
  })
}
