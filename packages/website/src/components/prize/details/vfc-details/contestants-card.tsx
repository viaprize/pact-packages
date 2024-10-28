'use client'
import SubmitWorkButton from '@/components/prize/details/submissions-voting/submit-work-button'
import { useAuth } from '@/hooks/useAuth'
import { getContestantStage } from '@/lib/utils'
import { api } from '@/trpc/react'
import type { Submissions } from '@/types/submissions'
import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Badge } from '@viaprize/ui/badge'
import { Card } from '@viaprize/ui/card'
import { Suspense } from 'react'
import JoinContestantButton from './join-contestant-button'
export type ContestantStage = 'NOT_JOINED' | 'JOINED' | 'SUBMITTED' | 'LOGIN'
export type Contestants = typeof api.prizes.getContestants.useQuery
function ContestantCardButton({
  stage,
  prizeId,
  prizeStage,
  slug,
  totalFunds,
}: {
  stage: ContestantStage
  prizeId: string
  slug: string
  prizeStage: PrizeStages
  totalFunds: number
}) {
  console.log({ stage })
  return (
    <>
      {(() => {
        if (prizeStage !== 'SUBMISSIONS_OPEN') {
          console.log("`prizeStage` is not 'SUBMISSIONS_OPEN'")
          return <Badge>Submissions are closed</Badge>
        }
        switch (stage) {
          case 'LOGIN':
            return <Badge>Log in to join</Badge>

          case 'NOT_JOINED':
            return <JoinContestantButton prizeId={prizeId} slug={slug} />
          case 'JOINED':
            return (
              <SubmitWorkButton
                totalFunds={totalFunds}
                prizeStage={prizeStage}
                prizeId={prizeId}
              />
            )
          case 'SUBMITTED':
            return null
        }
      })()}
    </>
  )
}
export default function ContestantsCard({
  prizeId,
  slug,
  prizeStage,
  totalFunds,
  submissions,
}: {
  prizeId: string
  slug: string
  prizeStage: PrizeStages
  totalFunds: number
  submissions: Submissions
}) {
  const [contestants] = api.prizes.getContestants.useSuspenseQuery(prizeId)
  const { session } = useAuth()
  console.log({ submissions })
  const contestantStage = getContestantStage<(typeof contestants)[number]>(
    contestants,
    submissions,
    session?.user.username,
  )
  console.log({ contestants })
  return (
    <Suspense fallback={<Card className="px-3 py-4">Loading...</Card>}>
      <Card className="px-3 py-4">
        <div className="text-muted-foreground text-lg font-normal">
          Contestants ({contestants?.length})
        </div>
        {contestants?.map((contestant) => (
          <div
            className="flex items-center space-x-2 my-4"
            key={contestant.username}
          >
            <Avatar>
              <AvatarImage
                src={contestant.user.image ?? undefined}
                alt={contestant.user?.name?.substring(0, 2)}
              />
              <AvatarFallback>
                {contestant.user.name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>{contestant.user.name}</div>
          </div>
        ))}
        <ContestantCardButton
          totalFunds={totalFunds}
          prizeStage={prizeStage}
          stage={contestantStage}
          prizeId={prizeId}
          slug={slug}
        />
      </Card>
    </Suspense>
  )
}
