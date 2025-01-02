import { donations } from '@viaprize/core/database/schema/donations'
import { prizes } from '@viaprize/core/database/schema/prizes'
import { submissions } from '@viaprize/core/database/schema/submissions'
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
import { and, eq } from 'drizzle-orm'
import { LoopsClient } from 'loops'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import { formatUnits, parseUnits } from 'viem'
import type { z } from 'zod'
import { EMAIL_TEMPLATES, email, sendTransactionalEmail } from '../email'
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
    Events.Emails.Submission,
    Events.Emails.SubmissionEnd,
    Events.Emails.VotingEnd,

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
              await sendTransactionalEmail(
                'DONATION_EMAIL_TO_FUNDER',
                transaction.user.email,
                {
                  prizeTitle: transaction.prize.title,
                  donationAmount: `${getValueFromDonation(transaction)} USD`,
                  date: formatDate(new Date(), 'MMMM dd, yyyy'),
                  totalFunds: transaction.prize.funds.toString(),
                },
              )
            }
            if (transaction?.prize?.author?.email) {
              await sendTransactionalEmail(
                'DONATION_TO_PROPOSER',
                transaction.prize.author.email,
                {
                  prizeTitle: transaction.prize.title,
                  donationAmount: `${getValueFromDonation(transaction)} USD`,
                  proposer: transaction.prize.authorUsername,
                  date: formatDate(new Date(), 'MMMM dd, yyyy'),
                  donator: transaction.username ?? 'Anonymous',
                  totalFunds: transaction.prize.funds.toString(),
                },
              )
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
          await sendTransactionalEmail(
            'PRIZE_APPROVAL_PROPOSER',
            prize.author.email,
            {
              proposalTitle: prize.title,
            },
          )
        }
        break
      }
      case 'emails.submission': {
        const submission =
          await viaprize.database.database.query.submissions.findFirst({
            where: eq(
              submissions.submissionHash,
              event.properties.submissionId,
            ),
            with: {
              user: {
                columns: { email: true },
              },
              prize: {
                with: {
                  author: {
                    columns: { email: true, name: true },
                  },
                },
              },
            },
          })
        if (
          submission?.prize.author.email &&
          submission?.prize?.author?.name &&
          submission?.username
        ) {
          await sendTransactionalEmail(
            'SUBMISSION_EMAIL_TO_PROPOSER',
            submission.prize.author.email,
            {
              proposer: submission.prize.author.name,
              dateRecieved: formatDate(new Date(), 'MMMM dd, yyyy'),
              prizeTitle: submission.prize.title,
              contestantName: submission.username,
            },
          )
        }
        if (submission?.user?.email && submission?.prize?.author?.name) {
          await sendTransactionalEmail(
            'SUBMISSION_EMAIL_TO_CONTESTANT',
            submission.user.email,
            {
              prizeTitle: submission.prize.title,
              dateRecieved: formatDate(new Date(), 'MMMM dd, yyyy'),
              proposerName: submission.prize.author.name,
            },
          )
        }
        if (
          submission?.prizeId &&
          submission.prize.author.name &&
          submission.username
        ) {
          const donators = (
            await viaprize.database.database.query.donations.findMany({
              where: eq(donations.prizeId, submission.prizeId),
              with: {
                user: {
                  columns: { email: true },
                },
              },
            })
          ).filter((donation) => !!donation?.user?.email)
          const calls = []
          for (const donator of donators) {
            if (donator?.user?.email) {
              calls.push(
                sendTransactionalEmail(
                  'SUBMISSION_EMAIL_TO_FUNDERS',
                  donator.user.email,
                  {
                    prizeTitle: submission.prize.title,
                    dateRecieved: formatDate(new Date(), 'MMMM dd, yyyy'),
                    proposerName: submission.prize.author.name,
                    contestantName: submission.username,
                  },
                ),
              )
            }
          }
          await Promise.all(calls)
        }
        break
      }
      case 'emails.submissionEnd': {
        const prize = await viaprize.database.database.query.prizes.findFirst({
          where: eq(prizes.id, event.properties.prizeId),
          with: {
            author: {
              columns: { email: true, name: true },
            },
            submissions: {
              with: {
                user: {
                  columns: { email: true },
                },
              },
            },
          },
        })
        const donators = (
          await viaprize.database.database.query.donations.findMany({
            where: eq(donations.prizeId, event.properties.prizeId),
            with: {
              user: {
                columns: { email: true, name: true },
              },
            },
          })
        ).filter((donation) => !!donation?.user?.email)

        if (prize) {
          const votingDeadline = addMinutes(
            prize.startVotingDate,
            prize.votingDurationInMinutes,
          ).toDateString()
          if (prize.submissions.length > 0) {
            const submissionUsers = prize.submissions.map(
              (submission) => submission.user,
            )
            if (submissionUsers) {
              const calls = []
              for (const user of submissionUsers) {
                if (user?.email) {
                  calls.push(
                    sendTransactionalEmail(
                      'SUBMISSION_END_EMAIL_TO_CONTESTANTS',
                      user.email,
                      {
                        prizeTitle: prize.title,
                        numberOfSubmissions:
                          prize.submissions.length.toString(),
                        votingDeadline: votingDeadline,
                      },
                    ),
                  )
                }
              }
              await Promise.all(calls)
            }
            if (prize.author.email) {
              await sendTransactionalEmail(
                'SUBMISSION_END_EMAIL_TO_PROPOSER_GREATER_THAN_ZERO',
                prize.author.email,
                {
                  numberOfSubmissions: prize.submissions.length.toString(),
                  prizeTitle: prize.title,
                  votingDeadline: votingDeadline,
                  proposerName: prize.author.name ?? 'Unknown',
                },
              )
            }
            if (donators.length > 0) {
              const calls = []
              for (const donator of donators) {
                if (donator?.user?.email) {
                  calls.push(
                    sendTransactionalEmail(
                      'SUBMISSION_END_EMAIL_TO_FUNDERS_GREATER_THAN_ZERO',
                      donator.user.email,
                      {
                        prizeTitle: prize.title,
                        numberOfSubmissions:
                          prize.submissions.length.toString(),
                        votingDeadline: votingDeadline,
                        funderName: donator.user.name ?? 'Unknown',
                      },
                    ),
                  )
                }
              }
              await Promise.all(calls)
            }
          } else {
            if (prize.author.email) {
              await sendTransactionalEmail(
                'SUBMISSION_END_EMAIL_TO_PROPOSER_EQUAL_TO_ZERO',
                prize.author.email,
                {
                  prizeTitle: prize.title,
                  proposerName: prize.author.name ?? 'Unknown',
                },
              )
            }
            if (donators.length > 0) {
              const calls = []
              for (const donator of donators) {
                if (donator?.user?.email) {
                  calls.push(
                    sendTransactionalEmail(
                      'SUBMISSION_END_EMAIL_TO_FUNDERS_EQUAL_TO_ZERO',
                      donator.user.email,
                      {
                        prizeTitle: prize.title,
                        funderName: donator.user.name ?? 'Unknown',
                      },
                    ),
                  )
                }
              }
              await Promise.all(calls)
            }
          }
        }
        break
      }

      case 'emails.votingEnd': {
        const prize = await viaprize.database.database.query.prizes.findFirst({
          where: eq(prizes.id, event.properties.prizeId),
          with: {
            author: {
              columns: { email: true, name: true },
            },
            submissions: {
              with: {
                user: {
                  columns: { email: true },
                },
              },
            },
          },
        })
        const donators = (
          await viaprize.database.database.query.donations.findMany({
            where: eq(donations.prizeId, event.properties.prizeId),
            with: {
              user: {
                columns: { email: true, name: true },
              },
            },
          })
        ).filter((donation) => !!donation?.user?.email)

        if (prize) {
          if (prize.author.email) {
            await sendTransactionalEmail(
              'VOTING_END_EMAIL_TO_PROPOSER',
              prize.author.email,
              {
                prizeTitle: prize.title,
                proposerName: prize.author.name ?? 'Anonymous',
              },
            )
          }
          if (prize.submissions.length > 0) {
            const submissionUsers = prize.submissions.map(
              (submission) => submission.user,
            )
            if (submissionUsers) {
              const calls = []
              for (const user of submissionUsers) {
                if (user?.email) {
                  calls.push(
                    sendTransactionalEmail(
                      'VOTING_END_EMAIL_TO_CONTESTANTS',
                      user.email,
                      {
                        prizeTitle: prize.title,
                        numberOfSubmissions:
                          prize.submissions.length.toString(),
                      },
                    ),
                  )
                }
              }
              await Promise.all(calls)
            }
          }
          if (donators.length > 0) {
            const calls = []
            for (const donator of donators) {
              if (donator?.user?.email) {
                calls.push(
                  sendTransactionalEmail(
                    'VOTING_END_EMAIL_TO_FUNDERS',
                    donator.user.email,
                    {
                      prizeTitle: prize.title,
                      funderName: donator.user.name ?? 'Anonymous',
                    },
                  ),
                )
              }
            }
            await Promise.all(calls)
          }
        }
        break
      }
      case 'fiat.refund': {
        const normieTech = normieTechClient(
          'https://84i54kd5nk.execute-api.us-east-1.amazonaws.com',
        )

        const fiatDonatorsInDb =
          await viaprize.donations.db.query.donations.findMany({
            where: and(
              eq(donations.recipientAddress, event.properties.contractAddress),
              eq(donations.prizeId, event.properties.prizeId),
              eq(donations.isFiat, true),
            ),
          })
        if (!fiatDonatorsInDb) {
          throw new Error('No fiat donators found in the database')
        }
        let totalPaidInSmartContractDbInTokenDecimals =
          event.properties.funder.amountInTokenDecimals
        const totalPaidInFiatDbInTokenDecimals = fiatDonatorsInDb.reduce(
          (acc, curr) => acc + getValueFromDonation(curr),
          0,
        )
        if (
          totalPaidInSmartContractDbInTokenDecimals >
          totalPaidInFiatDbInTokenDecimals
        ) {
          throw new Error(
            'The total paid in the smart contract is greater than the total paid in fiat',
          )
        }
        let index = 0
        while (totalPaidInSmartContractDbInTokenDecimals > 0) {
          const fiatPayment = fiatDonatorsInDb[index]
          index = index + 1
          if (!fiatPayment) {
            break
          }

          if (
            totalPaidInSmartContractDbInTokenDecimals < fiatPayment.valueInToken
          ) {
            const res = await normieTech.POST('/v1/viaprize/0/refund', {
              body: {
                refundAmountInCents:
                  Number.parseFloat(
                    formatUnits(
                      BigInt(
                        totalPaidInSmartContractDbInTokenDecimals.toString(),
                      ),
                      6,
                    ),
                  ) * 100,
                transactionId: fiatPayment.paymentId ?? '',
              },
              params: {
                header: {
                  'x-api-key': '',
                },
              },
            })

            if (!res.error) {
              await viaprize.donations.db.update(donations).set({
                totalRefunded: (
                  fiatPayment.valueInToken -
                  totalPaidInSmartContractDbInTokenDecimals
                ).toString(),
                isPartiallyRefunded: true,
                isFullyRefunded: false,
              })
            }
            totalPaidInSmartContractDbInTokenDecimals = 0
          }
          if (
            totalPaidInSmartContractDbInTokenDecimals >=
            fiatPayment.valueInToken
          ) {
            const res = await normieTech.POST('/v1/viaprize/0/refund', {
              body: {
                refundAmountInCents:
                  Number.parseFloat(
                    formatUnits(BigInt(fiatPayment.valueInToken.toString()), 6),
                  ) * 100,
                transactionId: fiatPayment.paymentId ?? '',
              },
              params: {
                header: {
                  'x-api-key': '',
                },
              },
            })
            if (!res.error) {
              await viaprize.donations.db.update(donations).set({
                totalRefunded: fiatPayment.valueInToken.toString(),
                isPartiallyRefunded: false,
                isFullyRefunded: true,
              })
            }

            totalPaidInSmartContractDbInTokenDecimals -=
              fiatPayment.valueInToken
          }
        }
      }
    }
  },
)
