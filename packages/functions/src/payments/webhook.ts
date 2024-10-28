import { PRIZE_V2_ABI, RESERVE_FUND_ABI } from '@viaprize/core/lib/abi'
import {
  CONTRACT_CONSTANTS_PER_CHAIN,
  type ValidChainIDs,
} from '@viaprize/core/lib/constants'
import { ViaprizeUtils } from '@viaprize/core/viaprize-utils'
import type { APIGatewayProxyHandlerV2 } from 'aws-lambda'
import Stripe from 'stripe'
import { parseEventLogs, parseSignature } from 'viem'
import { Charge, type Charges } from '../types'
import { viaprize } from '../utils/viaprize'
import { WEBHOOK_TAG, checkoutMetadataSchema } from './checkout'

const isCampaign = (str: string) => str !== 'https://stripe.com'
export const handler: APIGatewayProxyHandlerV2 = async (event, ctx) => {
  console.log(
    '=======================================EVENT=======================================',
  )
  const signature = event.headers['stripe-signature']
  const body = event.body
  if (!process.env.WEBHOOK_SECRET) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No stripe webhook secret provided' }),
    }
  }
  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No stripe event body provided' }),
    }
  }
  if (!signature) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No stripe signature provided' }),
    }
  }

  const webhookEvent = Stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.WEBHOOK_SECRET,
  )

  switch (webhookEvent.type) {
    case 'checkout.session.completed': {
      if (isCampaign(webhookEvent.data.object?.success_url ?? '')) {
        if (!webhookEvent.data.object.metadata) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'No metadata provided' }),
          }
        }

        const eventData = webhookEvent.data.object
        if (
          !eventData.metadata ||
          !eventData.metadata.tag ||
          eventData.metadata.tag !== WEBHOOK_TAG
        ) {
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Metadata  tag not matched provided',
            }),
          }
        }

        const email = eventData.customer_details?.email
        if (!email) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: 'No receipt email provided' }),
          }
        }
        const campaignMetadata = checkoutMetadataSchema.parse(
          webhookEvent.data.object.metadata,
        )
        if (!eventData.amount_total || !eventData.amount_subtotal) {
          return {
            statusCode: 400,
            body: 'Invalid request without payment intent or amount total',
          }
        }
        let username = campaignMetadata.username
        let signature: string | undefined = campaignMetadata.signature
        let hash: string | undefined = campaignMetadata.ethSignedMessage
        let key: string | undefined
        console.log({ username, signature, hash, key })

        const user = campaignMetadata.username
          ? await viaprize.users.getUserByUsername(campaignMetadata.username)
          : await viaprize.users.getUserByEmail(email.toLocaleLowerCase())
        if (!campaignMetadata.username && user) {
          username = user.username ?? undefined
          key = user.wallets[0].key ?? undefined
        }
        if (!campaignMetadata.username && !user) {
          const preBoardedUser = await viaprize.users.preBoardUserByEmail(
            email.toLowerCase(),
          )
          username = preBoardedUser.username
          key = preBoardedUser.wallet.key
        }
        if (!campaignMetadata.username && key) {
          const custodialSign =
            await viaprize.wallet.signUsdcTransactionForCustodial({
              deadline: Number.parseInt(campaignMetadata.deadline),
              key: key,
              spender: campaignMetadata.spender as `0x${string}`,
              value: Number.parseInt(campaignMetadata.amount),
            })
          hash = custodialSign.hash
          signature = custodialSign.signature
        }

        if (!hash || !signature) {
          return {
            statusCode: 400,
            body: 'Invalid request without hash or signature',
          }
        }
        const reserveAddress = await viaprize.wallet.getAddress(
          'reserve',
          'vault',
        )
        const chainId = Number.parseInt(campaignMetadata.chainId)
        const constants = CONTRACT_CONSTANTS_PER_CHAIN[chainId as ValidChainIDs]
        const rsv = parseSignature(signature as `0x${string}`)

        const data = viaprize.prizes.blockchain.getEncodedReserveAddFunds(
          campaignMetadata.spender as `0x${string}`,
          reserveAddress as `0x${string}`,
          Number.parseInt(campaignMetadata.amount),
          Number.parseInt(campaignMetadata.deadline),
          Number.parseInt(rsv.v?.toString() ?? '1'),
          rsv.s,
          rsv.r,
          hash as `0x${string}`,
        )
        console.log({ data })

        const txReceipt = await viaprize.wallet.sendTransaction(
          [
            {
              data,
              to: constants.RESERVE_FUND_PRIZE_ADDRESS,
              value: '0',
            },
          ],
          'reserve',
        )

        const events = parseEventLogs({
          abi: PRIZE_V2_ABI,
          logs: txReceipt.logs,
          eventName: 'Donation',
        })
        const donationEvents = events.filter((e) => e.eventName === 'Donation')
        if (donationEvents.length === 0) {
          return {
            statusCode: 400,
            body: 'Invalid request without donation event',
          }
        }
        const donor = campaignMetadata.username
          ? user?.name ?? 'Anonymous'
          : eventData.customer_details?.name ?? 'Anonymous'

        console.log({ donor })

        await viaprize.prizes.addUsdcFunds({
          donor: donor,
          isFiat: true,
          recipientAddress: campaignMetadata.spender,
          valueInToken: Number.parseInt(
            donationEvents[0].args.amount.toString(),
          ),
          prizeId: campaignMetadata.backendId,
          username: username,
          paymentId: eventData.payment_intent?.toString() ?? undefined,
          transactionId: txReceipt.transactionHash,
        })
        const prize = await viaprize.prizes.getPrizeById(
          campaignMetadata.backendId,
        )
        if (campaignMetadata.username && username) {
          await ViaprizeUtils.publishActivity({
            activity: `Donated ${Number.parseFloat(campaignMetadata.amount) / 1_000_000} USD`,
            username: username,
          })
        }

        await ViaprizeUtils.publishDeployedPrizeCacheDelete(
          viaprize,
          prize.slug,
        )
      }
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  }
}
