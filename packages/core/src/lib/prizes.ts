import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  sql,
  sum,
} from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { ViaprizeDatabase } from '../database'
import {
  type SubmissionInsert,
  activities,
  donations,
  type insertDonationSchema,
  type insertPrizeType,
  prizeComments,
  prizes,
  prizesToContestants,
  submissions,
  users,
} from '../database/schema'
import { CacheTag } from './cache-tag'
import { CONTRACT_CONSTANTS_PER_CHAIN, type ValidChainIDs } from './constants'
import { PrizesBlockchain } from './smart-contracts/prizes'
import {
  getTextFromDonation,
  getValueFromDonation,
  stringToSlug,
} from './utils'

const CACHE_TAGS = {
  PENDING_PRIZES: { value: 'pending-prizes', requiresSuffix: false },
  ACTIVE_PRIZES_COUNT: { value: 'active-prizes-count', requiresSuffix: false },
  DEPLOYED_PRIZES: { value: 'deployed-prizes', requiresSuffix: false },
  SLUG_PRIZE: { value: 'slug-prize-in-', requiresSuffix: true },
  TOTAL_PRIZE_POOL: { value: 'total-prize-pool', requiresSuffix: false },
  LATEST_PRIZE_ACTIVITIES: {
    value: 'latest-prize-activities',
    requiresSuffix: false,
  },
  FUNDERS_SLUG_PRIZE: { value: 'funders-slug-prize-in-', requiresSuffix: true },
} as const

interface FilterOptions {
  categories?: string[]
  prizeStatus?: 'active' | 'ended'
  minAmount?: number
  maxAmount?: number
  sort?: 'ASC' | 'DESC'
}
export type PrizeStages = typeof prizes.stage._.data | null
export type PrizeStagesWithoutNull = typeof prizes.stage._.data
export class Prizes extends CacheTag<typeof CACHE_TAGS> {
  db
  chainId: number
  blockchain: PrizesBlockchain

  constructor(viaprizeDb: ViaprizeDatabase, chainId: number, rpcUrl: string) {
    super(CACHE_TAGS)
    this.db = viaprizeDb.database
    this.chainId = chainId
    this.blockchain = new PrizesBlockchain(rpcUrl, chainId)
  }

  async getTotalFunds() {
    const totalFunds = await this.db
      .select({ total: sum(prizes.funds) })
      .from(prizes)
    console.log(totalFunds[0]?.total, 'total')
    return totalFunds[0]?.total || '0'
  }
  async getFundersByPrizeId(prizeId: string) {
    const funders = await this.db.query.donations.findMany({
      where: eq(donations.prizeId, prizeId),
      with: {
        user: true,
      },
    })

    const funderMap: { [key: string]: (typeof funders)[number] } = {}
    funders.forEach((funder) => {
      if (funder.username) {
        const funderKey = `${funder.username}-${funder.token}-${funder.decimals}`
        if (funderMap[funderKey]) {
          // Merge donation values if same username, token, and decimals
          const existingFunder = funderMap[funderKey]
          existingFunder.valueInToken += funder.valueInToken
        } else {
          // Add new funder to the map
          funderMap[funderKey] = { ...funder }
        }
      } else {
        // If no username, just add the funder as is with a unique key
        funderMap[`no-username-${funder.id}`] = { ...funder }
      }
    })

    return Object.values(funderMap).map((f) => ({
      ...f,
      donationText: getTextFromDonation(f),
    }))
  }

  async getSubmittersByPrizeId(prizeId: string) {
    const submitters = await this.db.query.submissions.findMany({
      where: eq(submissions.prizeId, prizeId),
      columns: {
        submitterAddress: true,
        submissionHash: true,
        username: true,
      },
    })
    return submitters
  }

  async getFundersByContractAddress(contractAddress: string) {
    const funders = await this.db.query.donations.findMany({
      where: eq(donations.recipientAddress, contractAddress),
      with: {
        user: {
          with: {
            wallets: {
              columns: {
                address: true,
              },
            },
          },
        },
      },
      columns: {
        username: true,
      },
    })

    return funders
  }
  async getContestants(prizeId: string) {
    const contestants = await this.db.query.prizesToContestants.findMany({
      where: eq(prizesToContestants.prizeId, prizeId),
      with: {
        user: {
          columns: {
            username: true,
            image: true,
            name: true,
          },
        },
      },
    })
    return contestants
  }

  async getLatestActivitiesInPrizes(limit = 5) {
    const latestActivities = await this.db.query.activities.findMany({
      orderBy: desc(activities.createdAt),
      where: eq(activities.tag, 'PRIZE'),
      columns: {
        createdAt: true,
        activity: true,
        link: true,
      },
      with: {
        user: {
          columns: {
            username: true,
            image: true,
          },
        },
      },
      limit,
    })
    return latestActivities
  }

  async getDeployedPrizesCount() {
    const countPrize = await this.db
      .select({ count: count() })
      .from(prizes)
      .where(
        or(
          eq(prizes.stage, 'SUBMISSIONS_OPEN'),
          eq(prizes.stage, 'VOTING_OPEN'),
          eq(prizes.stage, 'NOT_STARTED'),
        ),
      )
    return countPrize[0]?.count || 0
  }

  async getFilteredPrizes(filters: FilterOptions) {
    const { categories, prizeStatus, minAmount, maxAmount, sort } = filters
    const conditions: Array<any> = [] // Replace `any` with a more specific type if possible

    // Define the valid stages based on the prize status
    const stages: PrizeStagesWithoutNull[] =
      prizeStatus === 'active'
        ? [
            'NOT_STARTED',
            'SUBMISSIONS_OPEN',
            'VOTING_OPEN',
            'DISPUTE_AVAILABLE',
            'DISPUTE_ACTIVE',
          ]
        : ['WON', 'REFUNDED']

    // Use inArray for stage filtering
    conditions.push(inArray(prizes.stage, stages))

    // Filter by prize amount
    if (minAmount !== undefined) {
      conditions.push(gte(prizes.funds, minAmount))
    }
    if (maxAmount !== undefined) {
      conditions.push(lte(prizes.funds, maxAmount))
    }

    // Filter by categories
    if (categories?.length) {
      const categoryConditions = categories.map(
        (category) => sql`${prizes.skillSets}::jsonb ? ${category}`,
      )
      conditions.push(or(...categoryConditions))
    }

    // Combine conditions using `and`
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Construct and execute the query
    return await this.db.query.prizes.findMany({
      where: whereClause,
      orderBy: sort === 'ASC' ? asc(prizes.createdAt) : desc(prizes.createdAt),
    })
  }

  async getPendingPrizes() {
    const proposals = await this.db.query.prizes.findMany({
      where: eq(prizes.proposalStage, 'PENDING'),
      orderBy: desc(prizes.createdAt),
    })

    return proposals
  }

  async startSubmissionPeriodByContractAddress(contractAddress: string) {
    await this.db
      .update(prizes)
      .set({
        stage: 'SUBMISSIONS_OPEN',
      })
      .where(eq(prizes.primaryContractAddress, contractAddress.toLowerCase()))
  }
  async endDisputePeriodByContractAddress(contractAddress: string) {
    await this.db
      .update(prizes)
      .set({
        stage: 'WON',
      })
      .where(eq(prizes.primaryContractAddress, contractAddress))
  }
  async endVotingPeriodByContractAddress(contractAddress: string) {
    await this.db
      .update(prizes)
      .set({
        stage: 'DISPUTE_AVAILABLE',
      })
      .where(eq(prizes.primaryContractAddress, contractAddress.toLowerCase()))
  }
  async addPrizeActivity(
    data: Pick<typeof activities.$inferInsert, 'activity' | 'username'>,
  ) {
    await this.db.insert(activities).values({
      ...data,
      tag: 'PRIZE',
    })
  }
  async endDisputeByContractAddress({
    contractAddress,
    totalRefunded,
    updatedSubmissions,
  }: {
    contractAddress: string
    totalRefunded: number
    updatedSubmissions: Pick<
      SubmissionInsert,
      'submissionHash' | 'submitterAddress' | 'won' | 'username'
    >[]
  }) {
    console.log('Ending dispute')
    console.log({ contractAddress, totalRefunded, updatedSubmissions })
    await this.db.transaction(async (trx) => {
      const prize = await trx.query.prizes.findFirst({
        where: eq(prizes.primaryContractAddress, contractAddress.toLowerCase()),
      })

      if (!prize) {
        throw new Error(
          `Prize not found with contract address ${contractAddress}`,
        )
      }
      const shouldRefund = totalRefunded > prize?.funds / 2
      await trx
        .update(prizes)
        .set({
          stage: shouldRefund ? 'REFUNDED' : 'WON',
          totalRefunded: totalRefunded,
        })
        .where(eq(prizes.id, prize.id))
      for (const submission of updatedSubmissions) {
        const wonInUSDC = (submission.won ?? 0) / 1_000_000
        await trx
          .update(submissions)
          .set({
            won: sql`${submissions.won} + ${wonInUSDC}`,
          })
          .where(eq(submissions.submissionHash, submission.submissionHash))
        await trx.update(users).set({
          totalFundsWon: sql`${users.totalFundsWon} + ${wonInUSDC}`,
        })
        if (submission.username) {
          await trx.insert(activities).values({
            activity: `Won ${wonInUSDC}`,
            tag: 'PRIZE',
            username: submission.username,
          })
        }
      }
    })
  }

  async startVotingPeriodByContractAddress(contractAddress: string) {
    await this.db.transaction(async (trx) => {
      const prize = await trx.query.prizes.findFirst({
        where: eq(prizes.primaryContractAddress, contractAddress.toLowerCase()),
      })
      if (!prize) {
        throw new Error(
          `Prize not found with contract address ${contractAddress}`,
        )
      }
      await trx
        .update(prizes)
        .set({
          stage: 'VOTING_OPEN',
        })
        .where(eq(prizes.primaryContractAddress, contractAddress.toLowerCase()))
    })
  }

  async refundByContractAddress({
    primaryContractAddress,
    totalRefunded,
  }: {
    primaryContractAddress: string
    totalRefunded: number
  }) {
    await this.db
      .update(prizes)
      .set({
        stage: 'REFUNDED',
        totalRefunded: totalRefunded,
      })
      .where(
        eq(prizes.primaryContractAddress, primaryContractAddress.toLowerCase()),
      )
  }

  async getPrizeByContractAddress(contractAddress: string) {
    console.log(contractAddress)
    const prize = await this.db.query.prizes.findFirst({
      where: eq(prizes.primaryContractAddress, contractAddress),
    })
    console.log(prize)
    if (!prize) {
      throw new Error(
        `Prize not found with contract address ${contractAddress}`,
      )
    }
    return prize
  }

  async getDeployedPrizes() {
    const deployedPrizes = await this.db.query.prizes.findMany({
      where: eq(prizes.proposalStage, 'APPROVED'),
      orderBy: desc(prizes.createdAt),
    })
    return deployedPrizes
  }

  async getPrizeById(prizeId: string) {
    const prize = await this.db.query.prizes.findFirst({
      where: eq(prizes.id, prizeId),
    })
    if (!prize) {
      throw new Error('Prize not found')
    }
    return prize
  }

  async getPrizeBySlug(slug: string) {
    const prize = await this.db.query.prizes.findFirst({
      where: eq(prizes.slug, slug),
      with: {
        submissions: {
          with: {
            user: true,
          },
          orderBy: desc(submissions.createdAt),
        },
        comments: {
          orderBy: desc(prizeComments.createdAt),
        },

        author: {
          columns: {
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })
    return prize
  }

  async approveDeployedPrize(prizeId: string, contractAddress: string) {
    const prize = (
      await this.db
        .select()
        .from(prizes)
        .where(eq(prizes.id, prizeId))
        .limit(1)
        .execute()
    )[0]
    if (!prize) {
      console.error('Prize not found')
      return
    }
    if (prize.proposalStage === 'APPROVED') {
      console.error(new Error('Prize already approved'))
      return
    }
    if (prize.proposalStage !== 'APPROVED_BUT_NOT_DEPLOYED') {
      throw new Error('Prize not in correct stage')
    }

    const [res] = await this.db
      .update(prizes)
      .set({
        primaryContractAddress: contractAddress.toLowerCase(),
        proposalStage: 'APPROVED',
      })
      .where(eq(prizes.id, prizeId))
      .returning({ contractAddress: prizes.primaryContractAddress })

    return res
  }

  async approvePrizeProposal(prizeId: string) {
    await this.db
      .update(prizes)
      .set({
        proposalStage: 'APPROVED_BUT_NOT_DEPLOYED',
      })
      .where(eq(prizes.id, prizeId))
  }

  async addPrizeProposal(data: insertPrizeType) {
    const slug = stringToSlug(data.title)
    const randomId = nanoid(3)
    const prizeId = await this.db.transaction(async (trx) => {
      const slugExists = await trx.query.prizes.findFirst({
        where: eq(prizes.slug, slug),
        columns: {
          slug: true,
        },
      })
      const [prize] = await trx
        .insert(prizes)
        .values({
          ...data,
          slug: slugExists ? `${slug}_${randomId}` : slug,
        })
        .returning({
          id: prizes.id,
        })
      if (!prize) {
        throw new Error('Prize not created in database')
      }
      return prize.id
    })

    return prizeId
  }

  async addSubmission(data: typeof submissions.$inferInsert) {
    const submissionId = await this.db.transaction(async (trx) => {
      const [submission] = await trx
        .insert(submissions)
        .values({
          submissionHash: data.submissionHash,
          description: data.description,
          submitterAddress: data.submitterAddress,
          prizeId: data.prizeId,
          username: data.username,
        })
        .returning({
          submissionHash: submissions.submissionHash,
        })
      await trx
        .update(prizes)
        .set({
          numberOfSubmissions: sql`${prizes.numberOfSubmissions} + 1`,
        })
        .where(eq(prizes.id, data.prizeId))

      if (!submission) {
        throw new Error('Submission not created in database')
      }
      return submissions.submissionHash
    })

    return submissionId
  }

  async addContestant({
    prizeId,
    username,
  }: Pick<typeof prizesToContestants.$inferSelect, 'prizeId' | 'username'>) {
    await this.db.transaction(async (trx) => {
      await trx.insert(prizesToContestants).values({
        username: username,
        prizeId: prizeId,
      })

      await trx
        .update(prizes)
        .set({
          numberOfContestants: sql`${prizes.numberOfContestants} + 1`,
        })
        .where(eq(prizes.id, prizeId))
    })
  }

  async addVote(
    data: Pick<typeof submissions.$inferSelect, 'submissionHash' | 'votes'>,
  ) {
    await this.db.transaction(async (trx) => {
      const submission = await trx.query.submissions.findFirst({
        where: eq(submissions.submissionHash, data.submissionHash),
        columns: {
          votes: true,
        },
      })
      if (!submission) {
        throw new Error('Submission not found')
      }
      await trx
        .update(submissions)
        .set({
          votes: submission.votes + data.votes,
        })
        .where(eq(submissions.submissionHash, data.submissionHash))
    })
  }
  async addUsdcFunds(
    data: Omit<typeof donations.$inferInsert, 'token' | 'decimals'>,
  ) {
    await this.db.transaction(async (trx) => {
      await trx.insert(donations).values({
        ...data,
        token: 'USD',
        recipientType: 'PRIZE',

        decimals: 6,
      })
      console.log('Donation added')
      const prize = await trx.query.prizes.findFirst({
        where: eq(prizes.primaryContractAddress, data.recipientAddress),
        columns: {
          funds: true,
        },
      })

      if (!prize) {
        throw new Error(
          `Prize not found with contract address ${data.recipientAddress}`,
        )
      }
      console.log('Prize found')

      await trx.update(prizes).set({
        funds:
          Number.parseFloat(data.valueInToken?.toString() ?? '0') / 1_000_000 +
          prize.funds,
        numberOfFunders: sql`${prizes.numberOfFunders} + 1`,
      })
      console.log('Prize updated')
    })
  }
}
