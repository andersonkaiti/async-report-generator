import { randomUUID } from 'node:crypto'
import { getLeadsGenerator } from '@database/get-leads-generator'
import { makeMPUManager } from '@factories/mpu.manager.factory'
import { env } from '@shared/config/env'

const ONE_KILOBYTE = 1024
const ONE_MEGABYTE = 1024 * ONE_KILOBYTE
const MIN_CHUNK_SIZE = 6 * ONE_MEGABYTE

export async function handler() {
  const fileKey = `${new Date().toISOString()}-${randomUUID()}.csv`

  const mpuManager = makeMPUManager(env.REPORTS_BUCKET_NAME, fileKey)
  await mpuManager.start()

  try {
    const header = 'ID,Nome,E-mail,Cargo\n'

    let currentChunk = header

    for await (const { Items: leads = [] } of getLeadsGenerator()) {
      currentChunk += leads
        .map(
          (lead) => `${lead.id},${lead.name},${lead.email},${lead.jobTitle}\n`,
        )
        .join('')

      const currentChunkSize = Buffer.byteLength(currentChunk)

      if (currentChunkSize < MIN_CHUNK_SIZE) {
        continue
      }

      await mpuManager.uploadPart(Buffer.from(currentChunk, 'utf-8'))

      currentChunk = ''
    }

    if (currentChunk) {
      await mpuManager.uploadPart(Buffer.from(currentChunk, 'utf-8'))
    }

    await mpuManager.complete()
  } catch {
    await mpuManager.abort()
  }
}
