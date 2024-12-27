import slugify from 'slugify'
import { encodePacked, keccak256 } from 'viem'
import { optimism, sepolia } from 'viem/chains'
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

type ValidChainIds = 10 | 11155111
export const getChain = (chainId: ValidChainIds) => {
  switch (chainId) {
    case 10:
      return optimism
    case 11155111:
      return sepolia
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

export function voteMessageHash(
  submission: string,
  amount: number,
  nonce: number,
  contractAddress: string,
): string {
  const encodedMessage = encodePacked(
    [
      'string',
      'bytes32',
      'string',
      'uint256',
      'string',
      'uint256',
      'string',
      'address',
    ],
    [
      'VOTE FOR ',
      submission as `0x${string}`,
      ' WITH AMOUNT ',
      BigInt(amount),
      ' AND NONCE ',
      BigInt(nonce),
      ' WITH PRIZE CONTRACT ',
      contractAddress as `0x${string}`,
    ],
  )
  const messageHash = keccak256(encodedMessage)
  return messageHash
}

export const usdcSignType = ({
  owner,
  spender,
  value,
  nonce,
  deadline,
  usdc,
  chainId,
  tokenName,
  version,
}: {
  owner: string
  spender: string
  value: BigInt
  nonce: BigInt
  deadline: BigInt
  usdc: string

  chainId: number
  tokenName: string
  version: string
}) => {
  return {
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
    types: {
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    },
    primaryType: 'Permit',
    domain: {
      chainId: chainId,
      verifyingContract: usdc,
      // name: 'USD Coin',
      // version: '2',
      name: tokenName,
      version: version,
    },
  }
}
