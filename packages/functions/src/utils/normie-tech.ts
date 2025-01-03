import { normieTechClient } from '@viaprize/core/normie-tech'
import { Resource } from 'sst'
export const normieTech = normieTechClient(
  process.env.NORMIE_TECH_API_KEY ?? '',
)
