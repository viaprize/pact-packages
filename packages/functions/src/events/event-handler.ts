import { donations } from '@viaprize/core/database/schema/donations'
import { prizes } from '@viaprize/core/database/schema/prizes'
import { getValueFromDonation } from '@viaprize/core/lib/utils'
import { normieTechClient } from '@viaprize/core/normie-tech'
import { Events } from '@viaprize/core/viaprize'
import { ViaprizeUtils } from '@viaprize/core/viaprize-utils'
import {
  addDays,
  addMinutes,
  addSeconds,
  formatDate,
  isBefore,
  subMinutes,
} from 'date-fns'
import { eq } from 'drizzle-orm'
import { LoopsClient } from 'loops'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import type { z } from 'zod'
import { EMAIL_TEMPLATES, email } from '../email'
import { Cache } from '../utils/cache'
import { schedule } from '../utils/schedule'
import { viaprize } from '../utils/viaprize'
const cache = new Cache()

export const handler = bus.subscriber(
  [
    Events.Activity.Create,
    Events.Wallet.Transaction,
    Events.Wallet.StartSubmission,
    Events.Wallet.EndVoting,
    Events.Wallet.EndSubmissionAndStartVoting,

    Events.Cache.Set,
    Events.Cache.Delete,

    Events.Indexer.ConfirmEvent,

    Events.Prize.ScheduleStartSubmission,
    Events.Prize.ScheduleEndSubmissionAndStartVoting,
    Events.Prize.ScheduleEndVoting,
    Events.Prize.ScheduleEndDispute,
    Events.Prize.Approve,

    Events.Emails.Newsletter,
    Events.Emails.Welcome,
    Events.Emails.PrizeCreated,
    Events.Emails.Donated,
    Events.Emails.PrizeApproved,

    Events.Fiat.Refund,
  ],
  async (event) => {
    console.log(
      `================================================ Processing ${event.type} event =========================================`,
    )
    switch (event.type) {
      case 'activity.create':
        await viaprize.activities.createActivity(event.properties)
        break
      case 'wallet.transaction': {
        console.log(event.properties.transactions)
        const hash = await viaprize.wallet.sendTransaction(
          event.properties.transactions,
          event.properties.walletType,
        )
        console.log('Transaction hash', hash)
        break
      }
      case 'prize.approve': {
        const contract = await viaprize.prizes.approveDeployedPrize(
          event.properties.prizeId,
          event.properties.contractAddress,
        )
        if (contract) {
          const prize = await viaprize.prizes.getPrizeById(
            event.properties.prizeId,
          )

          if (prize?.submissionDurationInMinutes) {
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleStartSubmission,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                submissionDurationInMinutes: prize.submissionDurationInMinutes,
                startSubmissionDate: prize.startSubmissionDate,
              },
            )
          }
          if (prize?.votingDurationInMinutes) {
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleEndSubmissionAndStartVoting,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                submissionDurationInMinutes: prize.submissionDurationInMinutes,
                startSubmissionDate: prize.startSubmissionDate,
                votingDurationInMinutes: prize.votingDurationInMinutes,
              },
            )
            await bus.publish(
              Resource.EventBus.name,
              Events.Prize.ScheduleEndVoting,
              {
                contractAddress: event.properties.contractAddress.toLowerCase(),
                startVotingDate: prize.startVotingDate,
                votingDurationInMinutes: prize.votingDurationInMinutes,
              },
            )
          }
        }
        await ViaprizeUtils.publishDeployedPrizeCacheDelete(viaprize)
        break
      }
      case 'cache.set':
        console.log('Processing cache set event')
        switch (event.properties.type) {
          case 'dynamodb': {
            await cache.set(
              event.properties.key,
              event.properties.value,
              event.properties.ttl ?? 3600,
            )
            break
          }
        }
        break
      case 'cache.delete':
        await cache.delete(event.properties.key)
        break

      case 'prize.scheduleStartSubmission': {
        const data = await viaprize.prizes.blockchain.getEncodedStartSubmission(
          event.properties.submissionDurationInMinutes,
        )

        const triggerDate = isBefore(
          event.properties.startSubmissionDate,
          new Date(),
        )
          ? addSeconds(new Date(), 20)
          : new Date(event.properties.startSubmissionDate)

        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `StartSubmission-${event.properties.contractAddress}`,
          payload: {
            type: 'wallet.startSubmission',
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: '0',
                },
              ],
              walletType: 'gasless',
            } as typeof Events.Wallet.Transaction.$input,
          },
          triggerDate: triggerDate,
        })
        break
      }
      case 'prize.scheduleEndSubmissionAndStartVoting': {
        const data =
          await viaprize.prizes.blockchain.getEncodedEndSubmissionAndStartVoting(
            {
              votingDurationInMinutes: event.properties.votingDurationInMinutes,
            },
          )

        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndSubStartVoting-${event.properties.contractAddress}`,
          payload: {
            type: 'wallet.endSubmissionAndStartVoting',
            body: {
              transactions: [
                {
                  data: data.endSubmissionPeriodData,
                  to: event.properties.contractAddress,
                  value: '0',
                },
                {
                  data: data.startVotingPeriodData,
                  to: event.properties.contractAddress,
                  value: '0',
                },
              ],
              walletType: 'gasless',
            } as typeof Events.Wallet.Transaction.$input,
          },
          triggerDate: addMinutes(
            event.properties.startSubmissionDate,
            event.properties.submissionDurationInMinutes,
          ),
        })
        break
      }
      case 'prize.scheduleEndVoting': {
        const data = await viaprize.prizes.blockchain.getEncodedEndVoting()
        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndVoting-${event.properties.contractAddress}`,
          payload: {
            type: 'wallet.endVoting',
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: '0',
                },
              ],
              walletType: 'gasless',
            } as typeof Events.Wallet.Transaction.$input,
          },
          triggerDate: addMinutes(
            event.properties.startVotingDate,
            event.properties.votingDurationInMinutes,
          ),
        })
        break
      }
      case 'prize.scheduleEndDispute': {
        const prize = await viaprize.prizes.getPrizeByContractAddress(
          event.properties.contractAddress,
        )
        const data = await viaprize.prizes.blockchain.getEncodedEndSubmission()
        await schedule({
          functionArn: Resource.ScheduleReceivingLambda.arn,
          name: `EndDispute-${prize.id}`,
          payload: {
            type: 'wallet.endDispute',
            body: {
              transactions: [
                {
                  data,
                  to: event.properties.contractAddress,
                  value: '0',
                },
              ],
              walletType: 'gasless',
            } as typeof Events.Wallet.Transaction.$input,
          },
          triggerDate: addDays(new Date(), 2),
        })
        break
      }

      case 'emails.donated': {
        try {
          const transaction =
            await viaprize.database.database.query.donations.findFirst({
              where: eq(donations.id, event.properties.donationId),
              with: {
                user: {
                  columns: { email: true },
                },
                prize: {
                  columns: { authorUsername: true, title: true, funds: true },
                  with: {
                    author: {
                      columns: { email: true },
                    },
                  },
                },
              },
            })
          console.log('transaction', transaction)
          if (transaction?.prize?.title) {
            if (transaction?.user?.email) {
              await email.sendTransactionalEmail({
                transactionalId: EMAIL_TEMPLATES.DONATION_EMAIL_TO_FUNDER.id,
                email: transaction.user?.email,
                dataVariables: {
                  prizeTitle: transaction.prize.title,
                  donationAmount: `${getValueFromDonation(transaction)} USD`,
                  date: formatDate(new Date(), 'MMMM dd, yyyy'),
                  totalFunds: transaction.prize.funds.toString(),
                } as z.infer<
                  typeof EMAIL_TEMPLATES.DONATION_EMAIL_TO_FUNDER.dataVariablesSchema
                >,
              })
            }
            if (transaction?.prize?.author?.email) {
              await email
                .sendTransactionalEmail({
                  transactionalId: EMAIL_TEMPLATES.DONATION_TO_PROPOSER.id,
                  email: transaction.prize.author?.email,
                  dataVariables: {
                    prizeTitle: transaction.prize.title,
                    donationAmount: `${getValueFromDonation(transaction)} USD`,
                    proposer: transaction.prize.authorUsername,
                    date: formatDate(new Date(), 'MMMM dd, yyyy'),
                    donator: transaction.username,
                    totalFunds: transaction.prize.funds.toString(),
                  } as z.infer<
                    typeof EMAIL_TEMPLATES.DONATION_TO_PROPOSER.dataVariablesSchema
                  >,
                })
                .catch((e) => {
                  console.error('Error sending email to proposer', e)
                })
            }
          }
        } catch (error) {
          console.error('the error while sending donation email....', error)
        }
        break
      }
      case 'emails.prizeApproved': {
        const prize = await viaprize.database.database.query.prizes.findFirst({
          where: eq(prizes.id, event.properties.prizeId),
          with: {
            author: {
              columns: { email: true },
            },
          },
          columns: { title: true, authorUsername: true },
        })
        if (prize?.author.email) {
          await email.sendTransactionalEmail({
            transactionalId: EMAIL_TEMPLATES.PRIZE_APPROVAL_PROPOSER.id,
            email: prize.author.email,
            dataVariables: {
              proposalTitle: prize.title,
            } as z.infer<
              typeof EMAIL_TEMPLATES.PRIZE_APPROVAL_PROPOSER.dataVariablesSchema
            >,
          })
        }
        break
      }
    }
  },
)
