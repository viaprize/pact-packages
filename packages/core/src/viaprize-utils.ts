import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import { erc20Abi, hashTypedData, parseEventLogs } from 'viem'
import { PRIZE_V2_ABI } from './lib/abi'
import type { ValidChainIDs } from './lib/constants'
import { Events, type Viaprize } from './viaprize'

export * as ViaprizeUtils from './viaprize-utils'
export async function publishActivity(
  properties: typeof Events.Activity.Create.$input,
) {
  await bus.publish(Resource.EventBus.name, Events.Activity.Create, properties)
}
export async function publishDeployedPrizeCacheDelete(
  viaprize: Viaprize,
  slug?: string | null,
) {
  const promises: Promise<any>[] = []
  promises.push(
    bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
      key: viaprize.prizes.getCacheTag('DEPLOYED_PRIZES'),
    }),
    bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
      key: viaprize.prizes.getCacheTag('PENDING_PRIZES'),
    }),
    bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
      key: viaprize.prizes.getCacheTag('ACTIVE_PRIZES_COUNT'),
    }),
    bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
      key: viaprize.prizes.getCacheTag('LATEST_PRIZE_ACTIVITIES'),
    }),
    bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
      key: viaprize.prizes.getCacheTag('TOTAL_PRIZE_POOL'),
    }),
  )

  if (slug) {
    promises.push(
      bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: viaprize.prizes.getCacheTag('SLUG_PRIZE', slug ?? ''),
      }),
    )
    promises.push(
      bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: viaprize.prizes.getCacheTag('FUNDERS_SLUG_PRIZE', slug ?? ''),
      }),
    )
  }
  await Promise.all(promises)
}
export async function handleEndDispute(
  viaprize: Viaprize,
  txBody: typeof Events.Wallet.Transaction.$input,
  prizeContractAddress: string,
) {
  const prize =
    await viaprize.prizes.getPrizeByContractAddress(prizeContractAddress)
  if (!txBody.transactions[0]) {
    throw new Error('No transaction data found')
  }
  const funders =
    await viaprize.prizes.getFundersByContractAddress(prizeContractAddress)
  const funderAddresses = funders
    .map((f) => f.user?.wallets?.[0]?.address)
    .filter((item) => item !== undefined)
  console.log({ funderAddresses })
  const submissions = await viaprize.prizes.getSubmittersByPrizeId(prize.id)
  const submitterAddress = submissions.map((s) => s.submitterAddress)
  const receipt = await viaprize.wallet.sendTransaction(
    txBody.transactions,
    txBody.walletType ?? 'gasless',
  )
  console.log({ receipt })

  const contractLogs = parseEventLogs({
    logs: receipt.logs,
    abi: PRIZE_V2_ABI,
    eventName: ['FunderRefund', 'DisputeEnded'],
  })
  console.log({ contractLogs })

  const transferLogs = parseEventLogs({
    logs: receipt.logs,
    abi: erc20Abi,
    eventName: 'Transfer',
  })
  const logs = [...contractLogs, ...transferLogs]

  const disputeEndedEvent = logs.filter((e) => e.eventName === 'DisputeEnded')
  const funderRefundEvents = logs.filter((e) => e.eventName === 'FunderRefund')

  const transferEvents = logs.filter((e) => e.eventName === 'Transfer')
  const totalFunderRefunded = funderRefundEvents.reduce(
    (acc, e) => acc + Number.parseInt(e.args._amount?.toString() ?? '0'),
    0,
  )
  const submitterTransactionLogs = transferEvents.filter((e) => {
    return submitterAddress
      .map((s) => s.toLowerCase())
      .includes(e.args.to.toLowerCase())
  })

  const submissionWon: {
    username: string | null
    submissionHash: string
    submitterAddress: string
    won: number
  }[] = []
  submitterTransactionLogs.forEach((log) => {
    const submission = submissions.find(
      (s) => s.submitterAddress.toLowerCase() === log.args.to.toLowerCase(),
    )
    if (!submission) {
      return
    }
    submissionWon.push({
      won: Number.parseInt(log.args.value.toString()),
      ...submission,
    })
  })
  const platformTransactionLogs = transferEvents.slice(-2)
  console.log({ platformTransactionLogs })
  if (disputeEndedEvent.length > 0) {
    await viaprize.prizes.endDisputeByContractAddress({
      contractAddress: prizeContractAddress,
      totalRefunded: totalFunderRefunded,
      updatedSubmissions: submissionWon,
    })
  }
}
export async function handleEndSubmissionTransaction(
  viaprize: Viaprize,
  txBody: typeof Events.Wallet.Transaction.$input,
  prizeContractAddress: string,
) {
  const prize =
    await viaprize.prizes.getPrizeByContractAddress(prizeContractAddress)
  if (!txBody.transactions[0]) {
    throw new Error('No transaction data found')
  }
  console.log({ prize })
  const finalTxData =
    prize.numberOfSubmissions > 0
      ? txBody.transactions
      : [txBody.transactions[0]]
  console.log({ finalTxData })
  // await viaprize.prizes.startVotingPeriodByContractAddress(prizeContractAddress)

  // const receipt = await viaprize.wallet.blockchainClient.getTransactionReceipt({
  //   hash: '0x9b1aa2464e84fd4ac56f849386da83562e384b0fe5c48eb0f402f6e4b1f2a328',
  // })
  // console.log(receipt.logs, 'logs')
  const final = await viaprize.wallet.withTransactionEvents(
    PRIZE_V2_ABI,
    finalTxData,
    'gasless',
    ['SubmissionEnded', 'VotingEnded', 'FunderRefund'],
    async (event) => {
      const submissionEndedEvents = event.filter(
        (e) => e.eventName === 'SubmissionEnded',
      )
      const votingEndedEvents = event.filter(
        (e) => e.eventName === 'VotingEnded',
      )

      const funderRefundEvents = event.filter(
        (e) => e.eventName === 'FunderRefund',
      )

      console.log({ votingEndedEvents })
      console.log({ submissionEndedEvents })
      console.log({ funderRefundEvents })

      if (submissionEndedEvents.length && votingEndedEvents.length) {
        await viaprize.prizes.startVotingPeriodByContractAddress(
          prizeContractAddress,
        )
      }
      if (submissionEndedEvents.length) {
        await viaprize.prizes.startVotingPeriodByContractAddress(
          prizeContractAddress,
        )
      }
      if (funderRefundEvents.length) {
        const totalFunderRefunded = funderRefundEvents.reduce(
          (acc, e) => acc + Number.parseInt(e.args._amount?.toString() ?? '0'),
          0,
        )

        await viaprize.prizes.refundByContractAddress({
          primaryContractAddress: prizeContractAddress,
          totalRefunded: totalFunderRefunded,
        })
      }
    },
  )
  console.log({ final })
  await publishDeployedPrizeCacheDelete(viaprize, prize.slug)
}
