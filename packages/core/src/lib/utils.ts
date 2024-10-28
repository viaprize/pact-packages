import slugify from 'slugify'
import { optimism } from 'viem/chains'
import type { donations } from '../database/schema'
export const stringToSlug = (str: string) => {
  return slugify(str, {
    replacement: '_', // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: 'en', // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  })
}

type ValidChainIds = 10
export const getChain = (chainId: ValidChainIds) => {
  switch (chainId) {
    case 10:
      return optimism
    default:
      throw new Error('Invalid chain ID')
  }
}
export function getValueFromDonation(donation: typeof donations.$inferSelect) {
  return donation.valueInToken / 10 ** donation.decimals
}

export function getTextFromDonation(donation: typeof donations.$inferSelect) {
  const value = donation.valueInToken / 10 ** donation.decimals
  return `${value} ${donation.token}`
}
