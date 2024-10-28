import { Events } from '@viaprize/core/viaprize'
import { ViaprizeUtils } from '@viaprize/core/viaprize-utils'
import { addDays, addMinutes, addSeconds, isBefore, subMinutes } from 'date-fns'
import { LoopsClient } from 'loops'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import { email } from '../email'
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

    Events.Emails.Welcome,
    Events.Emails.prizeCreated,
    Events.Emails.Donated,
    Events.Emails.submissionCreated,
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
      case 'indexer.confirmEvent':
        await viaprize.indexerEvents.createEvent(event.properties.eventId)
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
          const toFunder = await email.sendTransactionalEmail({
            transactionalId: 'cm28t5iav00ueo4s7f9dltleh',
            email: event.properties.funder,
            dataVariables: {
              prizeTitle: event.properties.prizeTitle,
              donationAmount: event.properties.donationAmount,
              date: event.properties.date,
              totalFunds: event.properties.totalFunds,
            },
          })
          console.log('donation email response', { toFunder })

          const toProposer = await email.sendTransactionalEmail({
            transactionalId: 'cm2d1zq76000g3inurcjmv4oi',
            email: event.properties.proposer,
            dataVariables: {
              prizeTitle: event.properties.prizeTitle,
              proposer: event.properties.proposerName,
              donator: event.properties.funderName,
              donationAmount: event.properties.donationAmount,
              date: event.properties.date,
              totalFunds: event.properties.totalFunds,
            },
          })
          console.log('donation email response', { toProposer })
        } catch (error) {
          console.error('the error while sending donation email....', error)
        }
        break
      }
      case 'emails.submissionCreated': {
        try {
          const toProposer = await email.sendTransactionalEmail({
            transactionalId: 'cm2d03ghr045310133l4kncat',
            email: event.properties.proposer,
            dataVariables: {
              proposer: event.properties.proposer,
              prizeTitle: event.properties.prizeTitle,
              submissionTitle: event.properties.submissionTitle,
              dateReceived: event.properties.dateReceived,
              contestant: event.properties.contestant,
              tags: event.properties.tags[event.properties.tags.length],
            },
          })
          console.log('toProposer email response:', toProposer)

          const toContestant = await email.sendTransactionalEmail({
            transactionalId: 'cm2d0ckng00lu4p5yi2wch60p',
            email: event.properties.contestant,
            dataVariables: {
              prizeTitle: event.properties.prizeTitle,
              submissionTitle: event.properties.submissionTitle,
              dateReceived: event.properties.dateReceived,
              contestant: event.properties.contestant,
              tags: event.properties.tags[event.properties.tags.length],
            },
          })
          console.log('toContestant email response:', toContestant)

          const toFunder = await email.sendTransactionalEmail({
            transactionalId: 'cm2d07of401reyaib0gdmbs07',
            email: event.properties.funder,
            dataVariables: {
              funder: event.properties.funder,
              prizeTitle: event.properties.prizeTitle,
              submissionTitle: event.properties.submissionTitle,
              dateReceived: event.properties.dateReceived,
              contestant: event.properties.contestant,
              tags: event.properties.tags[event.properties.tags.length],
            },
          })
          console.log('toFunder email response:', toFunder)
        } catch (error) {
          console.error(
            'Error while sending submission created emails...',
            error,
          )
        }
        break
      }
      case 'emails.prizeCreated': {
        console.log('prize created email event', event)
        try {
          const response = await email.sendTransactionalEmail({
            transactionalId: 'cm2d1d0sr00ir6d50bj1i3cbw',
            email: event.properties.email,
            dataVariables: {
              proposalTitle: event.properties.prizeTitle,
            },
          })
          console.log('prize created email response:', response)
        } catch (error) {
          console.error('Error while sending prize created email...', error)
        }
        break
      }
    }
  },
)
