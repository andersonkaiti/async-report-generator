import { S3MPUManager } from '@storage/mpu.manager'

export function makeMPUManager(bucketName: string, fileKey: string) {
  return new S3MPUManager(bucketName, fileKey)
}
