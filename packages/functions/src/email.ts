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
      proposer: z.string().default('Anonymous'),
      dateRecieved: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      prizeTitle: z.string(),
      contestantName: z.string().default('Anonymous'),
    }),
  },
  SUBMISSION_EMAIL_TO_CONTESTANT: {
    id: 'cm2d0ckng00lu4p5yi2wch60p',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      dateRecieved: z.string().default(formatDate(new Date(), 'yyyy-MM-dd')),
      proposerName: z.string(),
    }),
  },
  SUBMISSION_END_EMAIL_TO_CONTESTANTS: {
    id: 'cm2d0p1i401wlhiq2mszwrhy0',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      numberOfSubmissions: z.string(),
      votingDeadline: z.string(),
    }),
  },
  SUBMISSION_END_EMAIL_TO_FUNDERS_GREATER_THAN_ZERO: {
    id: 'cm2d0mx5k01kfzjhuhscjq8sb',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      numberOfSubmissions: z.string(),
      votingDeadline: z.string(),
      funderName: z.string(),
    }),
  },
  SUBMISSION_END_EMAIL_TO_PROPOSER_GREATER_THAN_ZERO: {
    id: 'cm2d0i2gj03dn3e6o0z3n2k3e',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      numberOfSubmissions: z.string(),
      votingDeadline: z.string(),
      proposerName: z.string(),
    }),
  },
  SUBMISSION_END_EMAIL_TO_PROPOSER_EQUAL_TO_ZERO: {
    id: 'cm2d0f9v802qm1vdub40y39m3',
    dataVariablesSchema: z.object({
      proposerName: z.string(),
      prizeTitle: z.string(),
    }),
  },
  SUBMISSION_END_EMAIL_TO_FUNDERS_EQUAL_TO_ZERO: {
    id: 'cm2d0f9v802qm1vdub40y39m3',
    dataVariablesSchema: z.object({
      funderName: z.string(),
      prizeTitle: z.string(),
    }),
  },
  VOTING_END_EMAIL_TO_CONTESTANTS: {
    id: 'cm2d17a5j03i911osnz9uuwbk',
    dataVariablesSchema: z.object({
      prizeTitle: z.string(),
      numberOfSubmissions: z.string(),
    }),
  },
  VOTING_END_EMAIL_TO_FUNDERS: {
    id: 'cm2d15694032n9ur0z3auyq3g',
    dataVariablesSchema: z.object({
      funderName: z.string(),
      prizeTitle: z.string(),
    }),
  },
  VOTING_END_EMAIL_TO_PROPOSER: {
    id: 'cm2d1344e02nj14dfd1f376uh',
    dataVariablesSchema: z.object({
      proposerName: z.string(),
      prizeTitle: z.string(),
    }),
  },
} as const
type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES
export function sendTransactionalEmail<K extends EmailTemplateKey>(
  templateKey: K,
  recipientEmail: string,
  data: z.infer<(typeof EMAIL_TEMPLATES)[K]['dataVariablesSchema']>,
) {
  // 3) Retrieve the template details
  const template = EMAIL_TEMPLATES[templateKey]

  // 4) Validate or parse 'data' with Zod (optional but recommended)
  //    This will throw if invalid
  const parsedData = template.dataVariablesSchema.parse(data)

  // 5) Send the email
  return email.sendTransactionalEmail({
    transactionalId: template.id,
    email: recipientEmail,
    dataVariables: parsedData,
  })
}
