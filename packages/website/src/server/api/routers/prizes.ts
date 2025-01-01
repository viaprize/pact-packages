import { env } from '@/env'
import { NORMIE_TECH_URL } from '@/lib/constant'
import { userSessionSchema } from '@/server/auth'
import { viaprize } from '@/server/viaprize'
import { TRPCError } from '@trpc/server'
import { insertPrizeSchema } from '@viaprize/core/database/schema/prizes'
import { PRIZE_FACTORY_ABI, PRIZE_V2_ABI } from '@viaprize/core/lib/abi'
import {
  CONTRACT_CONSTANTS_PER_CHAIN,
  type ValidChainIDs,
} from '@viaprize/core/lib/constants'
import { normieTechClient } from '@viaprize/core/normie-tech'
import { Events } from '@viaprize/core/viaprize'
import { ViaprizeUtils } from '@viaprize/core/viaprize-utils'
import { nanoid } from 'nanoid'
import { Resource } from 'sst'
import { bus } from 'sst/aws/bus'
import { parseSignature } from 'viem'
import { any, z } from 'zod'
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  withCache,
} from '../trpc'
import { prizesAiRouter } from './prize-ai'

export const prizeRouter = createTRPCRouter({
  ai: prizesAiRouter,
  getFunders: publicProcedure
    .input(z.object({ prizeId: z.string(), slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const funders = await withCache(
        ctx,
        ctx.viaprize.prizes.getCacheTag('FUNDERS_SLUG_PRIZE', input.slug),
        async () =>
          await ctx.viaprize.prizes.getFundersByPrizeId(input.prizeId),
      )
      return funders
    }),
  getContestants: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const contestants = await ctx.viaprize.prizes.getContestants(input)
      return contestants
    }),
  getTotalFunds: publicProcedure.query(async ({ ctx }) => {
    const total = await withCache(
      ctx,
      ctx.viaprize.prizes.getCacheTag('TOTAL_PRIZE_POOL'),
      async () => await ctx.viaprize.prizes.getTotalFunds(),
    )
    return total
  }),
  getPrizeActivities: publicProcedure.query(async ({ ctx }) => {
    const totalPrizePool =
      (Number(
        await withCache(
          ctx,
          ctx.viaprize.prizes.getCacheTag('TOTAL_PRIZE_POOL'),
          async () => await ctx.viaprize.prizes.getTotalFunds(),
        ),
      ) ?? 0) + 65_000
    const totalIdeas =
      ((await withCache(
        ctx,
        ctx.viaprize.prizes.getCacheTag('ACTIVE_PRIZES_COUNT'),
        async () => await ctx.viaprize.prizes.getDeployedPrizesCount(),
      )) ?? 0) + 36
    const recentActivities =
      (await withCache(
        ctx,
        ctx.viaprize.prizes.getCacheTag('LATEST_PRIZE_ACTIVITIES'),
        async () => await ctx.viaprize.prizes.getLatestActivitiesInPrizes(),
      )) ?? []
    const leaderboards =
      (await withCache(
        ctx,
        ctx.viaprize.users.getCacheTag('LASTEST_LEADERBOARD'),
        async () => await ctx.viaprize.users.getLatestUsersByTotalFundsWon(),
      )) ?? []
    return {
      totalPrizePool,
      totalIdeas,
      recentActivities: recentActivities,
      leaderboards,
    }
  }),

  getFilteredPrizes: publicProcedure
    .input(
      z.object({
        categories: z.array(z.string()).optional(),
        prizeStatus: z.enum(['active', 'ended']).optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        sort: z.enum(['ASC', 'DESC']).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const prizes = await ctx.viaprize.prizes.getFilteredPrizes(input)
      return prizes
    }),

  getActivePrizes: publicProcedure.query(async ({ ctx }) => {
    const count = await withCache(
      ctx,
      ctx.viaprize.prizes.getCacheTag('ACTIVE_PRIZES_COUNT'),
      async () => await ctx.viaprize.prizes.getDeployedPrizesCount(),
    )
    return count ?? 0
  }),
  getTotalVotingDetail: protectedProcedure
    .input(
      z.object({
        contractAddress: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = userSessionSchema.parse(ctx.session.user)
      const total = await ctx.viaprize.prizes.blockchain.getTotalVotingLeft(
        input.contractAddress as `0x${string}`,
        user.wallet.address as `0x${string}`,
      )
      const isVoter = await ctx.viaprize.prizes.blockchain.isVoter(
        input.contractAddress as `0x${string}`,
        user.wallet.address as `0x${string}`,
      )
      const refundVotes = await ctx.viaprize.prizes.blockchain.getRefundVotes(
        input.contractAddress as `0x${string}`,
      )

      return {
        total: Number.parseInt(total.toString()) / 1_000_000,
        isVoter,
        refundVotes: Number.parseInt(refundVotes.toString()) / 1_000_000,
        refundSubmissionHash:
          ctx.viaprize.prizes.blockchain.getRefundSubmissionHash(),
      }
    }),

  getPrizeBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const prize = await withCache(
          ctx,
          ctx.viaprize.prizes.getCacheTag('SLUG_PRIZE', input),
          async () => await ctx.viaprize.prizes.getPrizeBySlug(input),
        )
        return prize
      } catch (e) {
        console.log(e)
        return null
      }
    }),
  getDeployedPrizes: publicProcedure.query(async ({ ctx }) => {
    const prizes = await withCache(
      ctx,
      ctx.viaprize.prizes.getCacheTag('DEPLOYED_PRIZES'),
      async () => {
        const a = await ctx.viaprize.prizes.getDeployedPrizes()

        return a
      },
    )
    return prizes
  }),
  getPendingPrizes: adminProcedure.query(async ({ ctx }) => {
    const prizes = await withCache(
      ctx,
      ctx.viaprize.prizes.getCacheTag('PENDING_PRIZES'),
      async () => await ctx.viaprize.prizes.getPendingPrizes(),
    )
    return prizes
  }),
  deployPrize: adminProcedure
    .input(
      z.object({
        prizeId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const prize = await ctx.viaprize.prizes.getPrizeById(input.prizeId)

      const txData =
        await ctx.viaprize.prizes.blockchain.getEncodedDeployPrizeData({
          authorFeePercentage: prize.authorFeePercentage,
          id: prize.id,
          platformFeePercentage: prize.platformFeePercentage,
          proposerAddress: prize.proposerAddress,
        })
      console.log({
        authorFeePercentage: prize.authorFeePercentage,
        id: prize.id,
        platformFeePercentage: prize.platformFeePercentage,
        proposerAddress: prize.proposerAddress,
      })
      const prizeFactoryAddress =
        ctx.viaprize.prizes.blockchain.getPrizeFactoryV2Address()

      const txHash = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_FACTORY_ABI,
        [
          {
            data: txData,
            to: prizeFactoryAddress,
            value: '0',
          },
        ],
        'gasless',
        ['NewViaPrizeCreated'],
        async (events) => {
          console.log({ events })
          await ctx.viaprize.prizes.approvePrizeProposal(input.prizeId)
          if (!events[0]?.args.viaPrizeAddress) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Contract address not found',
              cause: 'Contract address not found',
            })
          }
          if (events[0]?.args.viaPrizeAddress) {
            await Promise.all([
              bus.publish(Resource.EventBus.name, Events.Prize.Approve, {
                contractAddress: events[0].args.viaPrizeAddress,
                prizeId: input.prizeId,
              }),
              ViaprizeUtils.publishActivity({
                activity: 'Created a prize',
                username: prize.authorUsername,
                link: `/prize/${prize.slug}`,
              }),
              bus.publish(Resource.EventBus.name, Events.Emails.PrizeApproved, {
                prizeId: input.prizeId,
              }),
            ])
          }
        },
      )
      await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: ctx.viaprize.prizes.getCacheTag('PENDING_PRIZES'),
      })

      return txHash
    }),

  createPrize: protectedProcedure
    .input(
      insertPrizeSchema.omit({
        authorUsername: true,
        proposerAddress: true,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = userSessionSchema.parse(ctx.session.user)

      const prizeId = await ctx.viaprize.prizes.addPrizeProposal({
        ...input,
        authorUsername: user.username,
        proposerAddress: user.wallet.address,
      })
      await ViaprizeUtils.publishActivity({
        activity: 'Created a prize proposal',
        username: user.username,
      })
      await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: ctx.viaprize.prizes.getCacheTag('PENDING_PRIZES'),
      })

      return prizeId
    }),

  addSubmission: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
        submissionText: z.string().min(10, {
          message: 'Submission must be at least 10 characters.',
        }),
        projectLink: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const submitterAddress = ctx.session.user.wallet?.address
      console.log({ submitterAddress })
      const prize = await ctx.viaprize.prizes.getPrizeById(input.prizeId)
      const user = userSessionSchema.parse(ctx.session.user)
      if (!submitterAddress) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must have a wallet address to create a prize',
          cause: 'User does not have a wallet address',
        })
      }

      if (!ctx.session.user.wallet?.address) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must have a wallet address to create a prize',
          cause: 'User does not have a wallet address',
        })
      }

      const txData =
        await ctx.viaprize.prizes.blockchain.getEncodedAddSubmissionData(
          submitterAddress as `0x${string}`,
          input.submissionText,
        )

      const txHash = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        [
          {
            data: txData,
            to: prize.primaryContractAddress as `0x${string}`,
            value: '0',
          },
        ],
        'gasless',
        'SubmissionCreated',
        async (events) => {
          const submissionCreatedEvents = events.filter(
            (e) => e.eventName === 'SubmissionCreated',
          )
          if (!submissionCreatedEvents[0]?.args.submissionHash) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Submission hash not found',
              cause: 'Submission hash not found',
            })
          }
          await ctx.viaprize.prizes.addSubmission({
            submissionHash: submissionCreatedEvents[0].args.submissionHash,
            submitterAddress: submitterAddress,
            description: input.submissionText,
            prizeId: input.prizeId,
            username: ctx.session.user.username as string,
          })
        },
      )
      if (txHash) {
        await ViaprizeUtils.publishActivity({
          activity: 'Created a submission',
          username: user.username,
          link: `/prize/${prize.slug}`,
        })

        await ViaprizeUtils.publishDeployedPrizeCacheDelete(
          viaprize,
          prize.slug,
        )
      }
      return txHash
    }),

  addContestant: protectedProcedure
    .input(
      z.object({
        prizeId: z.string(),
        slug: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user.username) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to enter a prize',
          cause: 'User is not logged in',
        })
      }

      await ctx.viaprize.prizes.addContestant({
        prizeId: input.prizeId,
        username: ctx.session.user.username,
      })

      await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: ctx.viaprize.prizes.getCacheTag('DEPLOYED_PRIZES'),
      })
      await bus.publish(Resource.EventBus.name, Events.Cache.Delete, {
        key: ctx.viaprize.prizes.getCacheTag('SLUG_PRIZE', input.slug),
      })
    }),
  addVotes: protectedProcedure
    .input(
      z.object({
        signature: z.string().optional(),
        submissionHash: z.string(),
        amountInUSDC: z.number(),
        contractAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = userSessionSchema.parse(ctx.session.user)
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const isCustodial = !!user.wallet.key
      console.log(isCustodial, 'isCustodial')
      let signature = isCustodial ? '' : input.signature
      if (isCustodial) {
        const res = await ctx.viaprize.wallet.signVoteForCustodial({
          amount: input.amountInUSDC,
          contractAddress: input.contractAddress as `0x${string}`,
          encryptedKey: user.wallet.key as `0x${string}`,
          submissionHash: input.submissionHash as `0x${string}`,
        })
        signature = res.signature
      }
      if (!signature) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must sign the transaction to vote',
          cause: 'User did not sign the transaction',
        })
      }

      const txReceipt = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        [
          {
            to: input.contractAddress,
            value: '0',
            data: ctx.viaprize.prizes.blockchain.getEncodedAddVoteDataWithSignature(
              input.submissionHash as `0x${string}`,
              BigInt(input.amountInUSDC),
              signature as `0x${string}`,
            ),
          },
        ],
        'gasless',
        'Voted',
        async (events) => {
          const eventsFiltered = events.filter((e) => e.eventName === 'Voted')
          if (!eventsFiltered[0]?.args.amountVoted) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'No vote found',
              cause: 'No vote found',
            })
          }
          console.log(
            Number.parseInt(eventsFiltered[0]?.args.amountVoted.toString()) /
              1_000_000,
            'skjdkfjdl',
          )
          console.log({ eventsFiltered })
          await ctx.viaprize.prizes.addVote({
            submissionHash: input.submissionHash,
            votes:
              Number.parseInt(eventsFiltered[0]?.args.amountVoted.toString()) /
              1_000_000,
          })
        },
      )
      console.log({ slug: prize.slug })

      await ViaprizeUtils.publishDeployedPrizeCacheDelete(viaprize, prize.slug)
      return txReceipt
    }),
  addUsdcFundsFiatForUser: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
        spender: z.string(),
        hash: z.string().optional(),
        signature: z.string().optional(),
        deadline: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Donation with card')
      let signature = input.signature
      let hash = input.hash
      const user = userSessionSchema.parse(ctx.session.user)

      console.log({ input })
      if (user.wallet.key && !input.signature && !input.hash) {
        const res = await ctx.viaprize.wallet.signUsdcTransactionForCustodial({
          deadline: input.deadline,
          key: user.wallet.key,
          spender: input.spender as `0x${string}`,
          value: input.amount,
        })
        signature = res.signature
        hash = res.hash
      }
      console.log({ signature, hash })
      if (!signature || !hash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must sign the transaction to donate',
          cause: 'User did not  sign the transaction',
        })
      }
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.spender,
      )

      const constants =
        CONTRACT_CONSTANTS_PER_CHAIN[
          Number.parseInt(env.CHAIN_ID) as ValidChainIDs
        ]
      console.log({
        contractAddress: input.spender,
        userAddress: user.wallet.address,
        deadline: input.deadline,
        signature: signature,
        tokenAddress: constants.USDC,
        amountApproved: input.amount,
        ethSignedMessage: hash,
      })
      console.log(parseSignature(signature))
      console.log('chainId', env.CHAIN_ID)
      const customId = nanoid(20)
      const url = await normieTechClient(NORMIE_TECH_URL).POST(
        '/v1/viaprize/0/checkout',
        {
          params: {
            header: {
              'x-api-key': env.NORMIE_TECH_API_KEY,
            },
          },
          body: {
            customId: customId,
            name: prize.title,
            images: [prize.imageUrl ?? 'https://placehold.jp/150x150.png'],
            amount: (input.amount / 1_000_000) * 100,
            success_url: `${input.successUrl}?transactionId=${customId}`,
            chainId: Number.parseInt(env.CHAIN_ID),
            extraMetadata: {
              prizeId: prize.id,
              username: user.username,
              prizeSlug: prize.slug,
            },
            metadata: {
              contractAddress: input.spender,
              userAddress: user.wallet.address,
              deadline: input.deadline,
              signature: signature,
              tokenAddress: constants.USDC,
              amountApproved: input.amount,
              ethSignedMessage: hash,
            },
          },
        },
      )
      if (url.error) {
        console.log(url.error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `${(url.error as any).title ?? 'Error creating payment'} ${(url.error as any).detail}`,
          cause: (url.error as any).detail ?? 'Error creating payment',
        })
      }
      return url.data?.url
    }),
  addUsdcFundsFiatForAnonymousUser: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        successUrl: z.string(),
        cancelUrl: z.string(),
        spender: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // console.log('Donation with card anonymously')
      // const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
      //   input.spender,
      // )
      // const checkoutUrl = (
      //   await (
      //     await fetch(`/payment/checkout`, {
      //       method: 'POST',
      //       body: JSON.stringify({
      //         title: prize.title,
      //         imageUrl: prize.imageUrl,
      //         successUrl: input.successUrl,
      //         cancelUrl: input.cancelUrl,
      //         checkoutMetadata: {
      //           spender: prize.primaryContractAddress,
      //           deadline: (Math.floor(Date.now() / 1000) + 100_000).toString(),
      //           backendId: prize.id,
      //           chainId: env.CHAIN_ID,
      //           amount: input.amount.toString(),
      //         },
      //       }),
      //     })
      //   ).json()
      // ).url as string
      return ''
    }),
  addUsdcFundsCryptoForAnonymousUser: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        deadline: z.number(),
        v: z.number(),
        s: z.string(),
        r: z.string(),
        ethSignedHash: z.string(),
        sender: z.string(),
        contractAddress: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const constants =
        CONTRACT_CONSTANTS_PER_CHAIN[
          Number.parseInt(env.CHAIN_ID) as ValidChainIDs
        ]
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )

      const transactions = []
      const permitData =
        ctx.viaprize.prizes.blockchain.getEncodedERC20PermitFunction(
          input.sender as `0x${string}`,
          prize.primaryContractAddress as `0x${string}`,
          BigInt(input.amount),
          BigInt(input.deadline),
          input.v,
          input.r as `0x${string}`,
          input.s as `0x${string}`,
        )
      const transferToContractData =
        ctx.viaprize.prizes.blockchain.getEncodedAddUsdcFunds(
          BigInt(input.amount),
          input.sender as `0x${string}`,
          false,
        )
      transactions.push(
        {
          to: constants.USDC,
          value: '0',
          data: permitData,
        },
        {
          to: prize.primaryContractAddress as `0x${string}`,
          value: '0',
          data: transferToContractData,
        },
      )

      const txHash = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        transactions,
        'gasless',
        'Donation',
        async (events) => {
          const fundsAddedEvents = events.filter(
            (e) => e.eventName === 'Donation',
          )
          if (!fundsAddedEvents[0]?.args.amount) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'No donation found',
              cause: 'No donation found',
            })
          }
          await ctx.viaprize.prizes.addUsdcFunds({
            recipientAddress: prize.primaryContractAddress as `0x${string}`,
            donor: 'Anonymous',
            valueInToken: Number.parseInt(
              fundsAddedEvents[0]?.args.amount.toString(),
            ),
            isFiat: false,
          })
          await ViaprizeUtils.publishDeployedPrizeCacheDelete(
            viaprize,
            prize.slug,
          )
        },
      )
      // await bus.publish(Resource.EventBus.name, Events.Emails.Donated, {
      //   amount: input.amount,
      //   // email: ctx.session.user.email ?? 'email',
      //   email: user.email,
      //   name: user.username,
      //   prizeTitle: prize.title,
      // })
      return txHash
    }),
  addUsdcFundsCryptoForUser: protectedProcedure
    .input(
      z.object({
        sender: z.string(),
        amount: z.number(),
        deadline: z.number(),
        v: z.number(),
        s: z.string(),
        r: z.string(),
        ethSignedHash: z.string(),
        owner: z.string(),
        contractAddress: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const constants =
        CONTRACT_CONSTANTS_PER_CHAIN[
          Number.parseInt(env.CHAIN_ID) as ValidChainIDs
        ]
      const user = userSessionSchema.parse(ctx.session.user)
      const transactions = []
      const permitData =
        ctx.viaprize.prizes.blockchain.getEncodedERC20PermitFunction(
          input.sender as `0x${string}`,
          prize.primaryContractAddress as `0x${string}`,
          BigInt(input.amount),
          BigInt(input.deadline),
          input.v,
          input.r as `0x${string}`,
          input.s as `0x${string}`,
        )
      const transferToContractData =
        ctx.viaprize.prizes.blockchain.getEncodedAllocateFunds(
          user.wallet.address as `0x${string}`,
          BigInt(input.amount),
          input.sender as `0x${string}`,
          false,
        )
      transactions.push(
        {
          to: constants.USDC,
          value: '0',
          data: permitData,
        },
        {
          to: prize.primaryContractAddress as `0x${string}`,
          value: '0',
          data: transferToContractData,
        },
      )
      const txHash = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        transactions,
        'gasless',
        'Donation',
        async (events) => {
          const fundsAddedEvents = events.filter(
            (e) => e.eventName === 'Donation',
          )
          console.log({ fundsAddedEvents })
          if (!fundsAddedEvents[0]?.args.amount) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'No donation found',
              cause: 'No donation found',
            })
          }
          const id = await ctx.viaprize.prizes.addUsdcFunds({
            recipientAddress: prize.primaryContractAddress as `0x${string}`,
            username: ctx.session.user.username,
            donor: ctx.session.user.name ?? 'Anonymous',
            valueInToken: Number.parseFloat(
              fundsAddedEvents[0]?.args.amount.toString(),
            ),
            isFiat: false,
            prizeId: prize.id,
          })
          const calls = [
            ViaprizeUtils.publishDeployedPrizeCacheDelete(viaprize, prize.slug),
            ViaprizeUtils.publishActivity({
              activity: `Donated ${input.amount / 1_000_000} USD`,
              username: user.username,
              link: `/prize/${prize.slug}`,
            }),
            id
              ? bus.publish(Resource.EventBus.name, Events.Emails.Donated, {
                  donationId: id,
                })
              : Promise.resolve(),
          ]
          await Promise.all(calls)
        },
      )
      return txHash
    }),

  endVoting: adminProcedure
    .input(z.object({ contractAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const data = await ctx.viaprize.prizes.blockchain.getEncodedEndVoting()
      await viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        [
          {
            data,
            to: input.contractAddress,
            value: '0',
          },
        ],
        'gasless',
        'VotingEnded',
        async (events) => {
          const votingEndedEvents = events.filter(
            (e) => e.eventName === 'VotingEnded',
          )
          if (!votingEndedEvents[0]?.args.endedAt) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'No voting found',
              cause: 'No voting found',
            })
          }
          await ctx.viaprize.prizes.endVotingPeriodByContractAddress(
            input.contractAddress,
          )
        },
      )
      await ViaprizeUtils.publishDeployedPrizeCacheDelete(
        ctx.viaprize,
        prize.slug,
      )
    }),
  endDisputeEarly: adminProcedure
    .input(z.object({ contractAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const res = ViaprizeUtils.handleEndDispute(
        ctx.viaprize,
        {
          transactions: [
            {
              data: ctx.viaprize.prizes.blockchain.getEncodedEndDisputeEarly(),
              to: input.contractAddress,
              value: '0',
            },
          ],
        },
        input.contractAddress,
      )
      await ViaprizeUtils.publishDeployedPrizeCacheDelete(
        ctx.viaprize,
        prize.slug,
      )
      return res
    }),
  endSubmissionAndStartVoting: adminProcedure
    .input(z.object({ contractAddress: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const data =
        await ctx.viaprize.prizes.blockchain.getEncodedEndSubmissionAndStartVoting(
          {
            votingDurationInMinutes: prize.votingDurationInMinutes,
          },
        )
      await ViaprizeUtils.handleEndSubmissionTransaction(
        viaprize,
        {
          transactions: [
            {
              data: data.endSubmissionPeriodData,
              to: input.contractAddress,
              value: '0',
            },
            {
              data: data.startVotingPeriodData,
              to: input.contractAddress,
              value: '0',
            },
          ],
          walletType: 'gasless',
        },
        input.contractAddress,
      )
    }),
  startSubmission: adminProcedure
    .input(
      z.object({
        contractAddress: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const prize = await ctx.viaprize.prizes.getPrizeByContractAddress(
        input.contractAddress,
      )
      const txData =
        await ctx.viaprize.prizes.blockchain.getEncodedStartSubmission(
          prize.submissionDurationInMinutes,
        )
      const txReceipt = await ctx.viaprize.wallet.withTransactionEvents(
        PRIZE_V2_ABI,
        [
          {
            data: txData,
            to: input.contractAddress,
            value: '0',
          },
        ],
        'gasless',
        'SubmissionStarted',
        async (events) => {
          const submissionStartedEvents = events.filter(
            (e) => e.eventName === 'SubmissionStarted',
          )
          if (!submissionStartedEvents[0]?.args.startedAt) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'No submission found',
              cause: 'No submission found',
            })
          }
          await ctx.viaprize.prizes.startSubmissionPeriodByContractAddress(
            input.contractAddress,
          )
        },
      )
      await ViaprizeUtils.publishDeployedPrizeCacheDelete(
        ctx.viaprize,
        prize.slug,
      )
      return txReceipt
    }),
})
