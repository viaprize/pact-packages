export const imageBucket = sst.aws.Bucket.get(
  'ImageUploads',
  'viaprize-image-uploads-production',
)
