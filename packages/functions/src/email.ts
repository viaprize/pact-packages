import { formatDate } from 'date-fns'
import { LoopsClient } from 'loops'
import { date, z } from 'zod'

export const email = new LoopsClient(
  (process.env.LOOPS_API_KEY as string) ?? '',
)
export const EMAIL_TEMPLATES = {
  DONATION_TO_PROPOSER: {
    id: 'cm2d1zq76000g3inurcjmv4oi',
    dataVariablesSchema: z.object({
      proposer: z.string(),
      prizeTitle: z.string(),
      donator: z.string(),
      donationAmount: z.string(),
      date: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      totalFunds: z.string(),
    }),
  },
  PRIZE_APPROVAL_PROPOSER: {
    id: 'cm2d1d0sr00ir6d50bj1i3cbw',
    dataVariablesSchema: z.object({
      proposalTitle: z.string(),
    }),
  },
  DONATION_EMAIL_TO_FUNDER: {
    id: 'cm28t5iav00ueo4s7f9dltleh',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      donationAmount: z.string(),
      date: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      totalFunds: z.string(),
    }),
  },
  SUBMISSION_EMAIL_TO_FUNDERS: {
    id: 'cm2d07of401reyaib0gdmbs07',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      dateRecieved: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      proposerName: z.string(),
      contestantName: z.string(),
    }),
  },
  SUBMISSION_EMAIL_TO_PROPOSER: {
    id: 'cm2d03ghr045310133l4kncat',
    dataVariablesSchema: z.object({
      proposer: z.string(),
      dateRecieved: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      prizeTitle: z.string(),
      contestantName: z.string(),
    }),
  },
  SUBMISSION_END_EMAILT_TO_CONTESTANTS: {
    id: 'cm2d0p1i401wlhiq2mszwrhy0',
    dataVariableSchema: z.object({
      proposer: z.string(),
      prizeTitle: z.string(),
    }),
  },
} as const
