import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '@clients/s3.client'

interface IGetPresignedURLParams {
  bucket: string
  fileKey: string
}

const ONE_MINUTE = 60
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

export async function getPresignedURL({
  bucket,
  fileKey,
}: IGetPresignedURLParams) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileKey,
  })

  const presignedURL = await getSignedUrl(s3Client, command, {
    expiresIn: ONE_DAY,
  })

  return presignedURL
}
