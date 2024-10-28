'use server'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Resource } from 'sst'

export async function getImageUploadUrl() {
  const command = new PutObjectCommand({
    Key: crypto.randomUUID(),
    Bucket: Resource.ImageUploads.name,
  })
  return await getSignedUrl(
    new S3Client({
      region: 'us-east-2',
    }),
    command,
  )
}
