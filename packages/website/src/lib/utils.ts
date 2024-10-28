import type { ContestantStage } from '@/components/prize/details/vfc-details/contestants-card'
import type { Submissions } from '@/types/submissions'
import { ERC20_PERMIT_SIGN_TYPE } from '@viaprize/core/lib/abi'
import type { ValidChainIDs } from '@viaprize/core/lib/constants'
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from 'date-fns'
import { encodePacked, hashTypedData, keccak256 } from 'viem'

export function containsUppercase(str: string) {
  return /^[A-Z]+$/.test(str)
}

export function formatUnderscoreString(input: string): string {
  return input.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export function timeAgo(givenDate: Date): string {
  const now = new Date()

  // Calculate the difference in days
  const daysDiff = differenceInDays(now, givenDate)
  if (daysDiff >= 1) {
    return 'a long time ago'
  }

  // Calculate the difference in hours
  const hoursDiff = differenceInHours(now, givenDate)
  if (hoursDiff >= 1) {
    return `${hoursDiff} hours ago`
  }

  // Calculate the difference in minutes
  const minutesDiff = differenceInMinutes(now, givenDate)
  if (minutesDiff >= 1) {
    return `${minutesDiff} minutes ago`
  }

  // Calculate the difference in seconds
  const secondsDiff = differenceInSeconds(now, givenDate)
  return `${secondsDiff} seconds ago`
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function getContestantStage<T>(
  contestants: T[],
  submissions: Submissions,
  username?: string,
): ContestantStage {
  if (!username) {
    return 'LOGIN'
  }
  if (submissions.some((s) => s.username === username)) {
    return 'SUBMITTED'
  }
  if (!contestants) {
    return 'NOT_JOINED'
  }

  if (contestants.some((c) => (c as any).username === username)) {
    return 'JOINED'
  }
  return 'NOT_JOINED'
}

export const usdcSignType = ({
  owner,
  spender,
  value,
  nonce,
  chainId,
  deadline,
  usdcContract,
}: {
  owner: string
  spender: string
  value: bigint
  nonce: bigint
  deadline: bigint
  chainId: ValidChainIDs
  usdcContract: `0x${string}`
}) => {
  return {
    message: {
      owner: owner as `0x${string}`,
      spender: spender as `0x${string}`,
      value,
      nonce,
      deadline,
    },
    types: ERC20_PERMIT_SIGN_TYPE,
    primaryType: 'Permit' as 'Permit' | 'EIP712Domain',
    domain: {
      chainId: chainId,
      verifyingContract: usdcContract,
      name: 'USD Coin',
      version: '2',
    },
  }
}

export const usdcSignTypeHash = (
  data: Parameters<typeof usdcSignType>[number],
) => {
  const usdcSign = usdcSignType(data)
  return {
    usdcSign,
    hash: hashTypedData(usdcSign as any),
  }
}
export function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  return format(date, 'MMMM dd, yyyy HH:mm') // e.g., January 1, 2024 23:59
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
