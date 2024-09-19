import slugify from 'slugify'
import { optimism } from 'viem/chains'
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
