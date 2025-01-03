export const cacheTable = new sst.aws.Dynamo('Cache', {
  fields: {
    key: 'string',
  },
  primaryIndex: { hashKey: 'key' }, // Primary index uses hashKey, not partitionKey
  ttl: 'expireAt',
})
