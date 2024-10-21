import { and, desc, eq, isNotNull } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { z } from 'zod'
import type { ViaprizeDatabase } from '../database'
import {
  activities,
  donations,
  type insertUserSchema,
  prizes,
  prizesToContestants,
  submissions,
  users,
  wallets,
} from '../database/schema'
import { CacheTag } from './cache-tag'
import type { Wallet } from './wallet'

const CACHE_TAGS = {
  LASTEST_LEADERBOARD: { value: 'latest-leaderboard', requiresSuffix: false },
} as const

export class Users extends CacheTag<typeof CACHE_TAGS> {
  db
  wallet
  constructor(viaprizeDb: ViaprizeDatabase, wallet: Wallet) {
    super(CACHE_TAGS)
    this.db = viaprizeDb.database
    this.wallet = wallet
  }
  async getLatestUsersByTotalFundsWon(limit = 3) {
    return await this.db.query.users.findMany({
      orderBy: desc(users.totalFundsWon),
      limit,
    })
  }
  async updateUserById(id: string, data: z.infer<typeof insertUserSchema>) {
    await this.db
      .update(users)
      .set(data as any)
      .where(eq(users.id, id))
  }
  async getUserByEmail(email: string) {
    return await this.db.query.users.findFirst({
      columns: {
        username: true,
        email: true,
        image: true,
        name: true,
        isAdmin: true,
      },
      with: {
        wallets: {
          columns: {
            address: true,
            key: true,
          },
        },
      },
      where: eq(users.email, email),
    })
  }
  async getUserById(id: string) {
    return await this.db.query.users.findFirst({
      columns: {
        username: true,
        email: true,
        image: true,
        name: true,
        isAdmin: true,
      },
      with: {
        wallets: {
          columns: {
            address: true,
            key: true,
          },
        },
      },
      where: eq(users.id, id),
    })
  }

  async usernameExists(username: string) {
    const result = await this.db
      .select({
        username: users.username,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    return result.length > 0
  }

  async getUserByWalletAddress(walletAddress: string) {
    const address = walletAddress.toLowerCase()
    const result = await this.db.query.wallets.findFirst({
      with: {
        user: {
          columns: {
            name: true,
            id: true,
            email: true,
            isAdmin: true,
          },
        },
      },
      where: and(
        eq(wallets.address, address),
        eq(wallets.username, users.username),
      ),
    })

    return result?.user
  }
  async getStatisticsByUsername(username: string) {
    const prizeWith = {
      prize: {
        with: {
          author: {
            columns: {
              username: true,
              image: true,
              name: true,
            },
          },
        },
      },
    }
    const stats = await this.db.transaction(async (tx) => {
      const userActivities = await tx.query.activities.findMany({
        where: eq(activities.username, username),
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
      const createdPrizes = await tx.query.prizes.findMany({
        where: eq(prizes.authorUsername, username),
        with: {
          author: {
            columns: {
              username: true,
              image: true,
              name: true,
            },
          },
        },
      })
      const wonPrizes = await tx.query.submissions.findMany({
        columns: {
          prizeId: true,
        },
        where: eq(submissions.username, username),
        with: prizeWith,
      })
      const prizesFunded = await tx.query.donations.findMany({
        where: and(
          eq(donations.username, username),
          isNotNull(donations.prizeId),
        ),
        columns: {
          prizeId: true,
        },
        with: {
          ...prizeWith,
        },
      })
      const prizesContested = await tx.query.prizesToContestants.findMany({
        where: eq(prizesToContestants.username, username),
        with: prizeWith,
      })

      return {
        userActivities,
        createdPrizes,
        wonPrizes,
        prizesFunded,
        prizesContested,
      }
    })
    return stats
  }

  async getActivitiesByUsername(username: string) {
    const userActivities = await this.db.query.activities.findMany({
      orderBy: desc(activities.createdAt),
      where: eq(activities.username, username),
      columns: {
        createdAt: true,
        activity: true,
      },
      with: {
        user: {
          columns: {
            username: true,
            image: true,
          },
        },
      },
    })
    return userActivities
  }

  async getUserByUsername(username: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        wallets: {
          columns: {
            address: true,
            network: true,
            key: true,
          },
        },
        prizes: true,
      },
    })
    return user
  }
  async preBoardUserByEmail(email: string) {
    const wallet = await this.wallet.generateWallet()

    await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        email: email,
        username: wallet.address.toLowerCase(),
      })

      await tx.insert(wallets).values({
        address: wallet.address.toLowerCase(),
        network: 'optimism',
        key: wallet.key,
        username: wallet.address.toLowerCase(),
      })
    })
    return {
      username: wallet.address.toLowerCase(),
      wallet: wallet,
    }
  }

  async onboardUser(data: {
    name: string
    email: string
    walletAddress?: string
    network: string
    username: string
    userId: string
  }) {
    let address = data.walletAddress
      ? data.walletAddress.toLowerCase()
      : undefined
    let key: string | undefined = undefined
    if (!address) {
      const wallet = await this.wallet.generateWallet()
      address = wallet.address.toLowerCase()
      key = wallet.key
    }
    if (!address) {
      throw new Error('Address is required either not generated')
    }

    await this.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          name: data.name,
          email: data.email,
          username: data.username,
        })
        .where(eq(users.id, data.userId))
      await tx.insert(wallets).values({
        address: address,
        network: data.network,
        key: key,
        username: data.username,
      })
    })
    return true
  }

  async createUserFromWalletAddress(data: {
    walletAddress: string
    network: string
  }) {
    const userId = nanoid(12)
    await this.db.transaction(async (tx) => {
      await tx.insert(users).values({
        username: data.walletAddress,
        id: userId,
      })
      await tx.insert(wallets).values({
        address: data.walletAddress.toLowerCase(),
        network: data.network,
        username: data.walletAddress,
      })
    })

    return userId
  }
}
