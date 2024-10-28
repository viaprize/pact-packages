import {
  encodeFunctionData,
  encodePacked,
  hexToString,
  keccak256,
  parseSignature,
  stringToHex,
} from 'viem'
import type { prizes } from '../../database/schema'
import { PRIZE_FACTORY_ABI, PRIZE_V2_ABI, RESERVE_FUND_ABI } from '../abi'
import { CONTRACT_CONSTANTS_PER_CHAIN } from '../constants'
import { Blockchain } from './blockchain'

export class PrizesBlockchain extends Blockchain {
  getRefundSubmissionHash() {
    return keccak256(encodePacked(['string'], ['REFUND']))
  }
  async getRefundVotes(prizeAddress: `0x${string}`) {
    const refundVotes = await this.blockchainClient.readContract({
      abi: PRIZE_V2_ABI,
      functionName: 'getSubmissionByHash',
      args: [this.getRefundSubmissionHash()],
      address: prizeAddress,
    })
    return refundVotes.usdcVotes
  }

  getEncodedReserveAddFunds(
    spender: `0x${string}`,
    reserveAddress: `0x${string}`,
    amount: number,
    deadline: number,
    v: number,
    s: `0x${string}`,
    r: `0x${string}`,
    ethSignedMessageHash: `0x${string}`,
  ) {
    console.log({
      spender,
      reserveAddress,
      amount,
      deadline,
      v,
      s,
      r,
      ethSignedMessageHash,
    })
    const data = encodeFunctionData({
      abi: RESERVE_FUND_ABI,
      functionName: 'fundUsingUsdc',
      args: [
        reserveAddress,
        spender,
        BigInt(amount),
        BigInt(deadline),
        v,
        r,
        s,
        ethSignedMessageHash,
      ],
    })
    return data
  }

  async getEncodedStartSubmission(submissionDurationInMinutes: number) {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'startSubmissionPeriod',
      args: [BigInt(submissionDurationInMinutes)],
    })
    return data
  }
  async isVoter(prizeAddress: `0x${string}`, voterAddress: `0x${string}`) {
    const isCryptoVoter = await this.blockchainClient.readContract({
      abi: PRIZE_V2_ABI,
      address: prizeAddress,
      functionName: 'isCryptoFunder',
      args: [voterAddress],
    })
    const isFiatVoter = await this.blockchainClient.readContract({
      abi: PRIZE_V2_ABI,
      address: prizeAddress,
      functionName: 'isFiatFunder',
      args: [voterAddress],
    })
    return isCryptoVoter || isFiatVoter
  }
  async getTotalVotingLeft(
    prizeAddress: `0x${string}`,
    funderAddress: `0x${string}`,
  ) {
    const fiatFunderAmount = await this.blockchainClient.readContract({
      abi: PRIZE_V2_ABI,
      address: prizeAddress,
      functionName: 'fiatFunderAmount',
      args: [funderAddress],
    })
    const cryptoFunderAmount = await this.blockchainClient.readContract({
      abi: PRIZE_V2_ABI,
      address: prizeAddress,
      functionName: 'cryptoFunderAmount',
      args: [funderAddress],
    })
    return fiatFunderAmount + cryptoFunderAmount
  }
  getPrizeFactoryV2Address() {
    const constants =
      CONTRACT_CONSTANTS_PER_CHAIN[
        this.chainId as keyof typeof CONTRACT_CONSTANTS_PER_CHAIN
      ]
    return constants.PRIZE_FACTORY_V2_ADDRESS
  }
  async getEncodedEndVoting() {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'endVotingPeriod',
      args: [],
    })
    return data
  }
  getEncodedAllocateFunds(
    voter: `0x${string}`,
    amount: bigint,
    deadline: bigint,
    v: number,
    s: `0x${string}`,
    r: `0x${string}`,
    ethSignedMessageHash: `0x${string}`,
    fiatPayment: boolean,
  ) {
    return encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'addTokenFunds',
      args: [
        voter,
        amount,
        deadline,
        v,
        s,
        r,
        ethSignedMessageHash,
        fiatPayment,
      ],
    })
  }
  getEncodedEndDisputeEarly() {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'endDisputePeriodEarly',
      args: [],
    })
    return data
  }
  async getEncodedEndDispute() {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'endDispute',
      args: [],
    })
    return data
  }
  getEncodedAddUsdcFunds(
    amount: bigint,
    deadline: bigint,
    v: number,
    s: `0x${string}`,
    r: `0x${string}`,
    ethSignedMessageHash: `0x${string}`,
    fiatPayment: boolean,
  ) {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'addUsdcFunds',
      args: [amount, deadline, v, s, r, ethSignedMessageHash, fiatPayment],
    })
    return data
  }
  getEncodedAddVoteDataWithSignature(
    submissionHash: `0x${string}`,
    voteAmount: bigint,
    signature: `0x${string}`,
  ) {
    const rsv = parseSignature(signature)

    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'vote',
      args: [
        submissionHash,
        voteAmount,
        Number.parseInt(rsv.v?.toString() ?? '0'),
        rsv.s,
        rsv.r,
      ],
    })
    return data
  }
  async getEncodedAddSubmissionData(
    contestant: `0x${string}`,
    submissionText: string,
  ) {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'addSubmission',
      args: [contestant, stringToHex(submissionText)],
    })
    return data
  }
  async getEncodedDeployPrizeData(
    customPrize: Pick<
      typeof prizes.$inferSelect,
      'id' | 'proposerAddress' | 'platformFeePercentage' | 'authorFeePercentage'
    >,
  ) {
    const constants =
      CONTRACT_CONSTANTS_PER_CHAIN[
        this.chainId as keyof typeof CONTRACT_CONSTANTS_PER_CHAIN
      ]
    const data = encodeFunctionData({
      abi: PRIZE_FACTORY_ABI,
      functionName: 'createViaPrize',
      args: [
        customPrize.id,
        customPrize.proposerAddress as `0x${string}`,
        constants.ADMINS,
        customPrize.platformFeePercentage,
        customPrize.authorFeePercentage,
        constants.USDC,
        constants.USDC_BRIDGE,
        constants.SWAP_ROUTER,
        constants.USDC_TO_USDCE_POOL,
        constants.USDC_TO_ETH_POOL,
        constants.ETH_PRICE,
        constants.WETH,
      ],
    })
    return data
  }

  async getEncodedEndSubmissionAndStartVoting(
    customPrize: Pick<typeof prizes.$inferInsert, 'votingDurationInMinutes'>,
  ) {
    const endSubmissionPeriodData = await this.getEncodedEndSubmission()
    const startVotingPeriodData = await this.getEncodedStartVoting({
      votingDurationInMinutes: customPrize.votingDurationInMinutes,
    })

    return {
      endSubmissionPeriodData,
      startVotingPeriodData,
    }
  }
  async getEncodedEndSubmission() {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'endSubmissionPeriod',
      args: [],
    })
    return data
  }
  async getEncodedStartVoting(
    customPrize: Pick<typeof prizes.$inferInsert, 'votingDurationInMinutes'>,
  ) {
    const data = encodeFunctionData({
      abi: PRIZE_V2_ABI,
      functionName: 'startVotingPeriod',
      args: [BigInt(customPrize.votingDurationInMinutes)],
    })
    return data
  }
}
