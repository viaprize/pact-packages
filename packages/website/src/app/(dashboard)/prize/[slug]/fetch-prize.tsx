'use client'
import LoaderCircle from '@/components/common/loader-circle'
import EarlyDisputeButton from '@/components/prize/details/buttons/early-dispute-button'
import EndSubmissionAndStartVotingButton from '@/components/prize/details/buttons/end-submission-and-start-voting-button'
import EndVotingButton from '@/components/prize/details/buttons/end-voting-button'
import StartSubmissionButton from '@/components/prize/details/buttons/start-submission-button'
import Details from '@/components/prize/details/details'
import SubmissionVoting from '@/components/prize/details/submissions-voting/submission-voting'
import ContestantsCard, {
  type ContestantStage,
} from '@/components/prize/details/vfc-details/contestants-card'
import VisionaryFunderCard from '@/components/prize/details/vfc-details/visionary-funder-card'
import Winners from '@/components/prize/details/vfc-details/winners'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/server/auth'
import { api } from '@/trpc/react'
import type { Submissions } from '@/types/submissions'

import { IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@viaprize/ui/button'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import { Separator } from '@viaprize/ui/separator'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import PrizeDetailsSkeleton from './detail-prize-skeleton'

export default function FetchPrize({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const [prize] = api.prizes.getPrizeBySlug.useSuspenseQuery(slug)
  const { session } = useAuth()
  if (!prize || !prize.primaryContractAddress) {
    return notFound()
  }

  return (
    <Suspense fallback={<PrizeDetailsSkeleton />}>
      <div className="lg:flex h-full">
        <ScrollArea className="w-full   md:w-[75%] h-full  border-r-[0.5px] border-border">
          <Details
            {...prize}
            authorUsername={prize.authorUsername}
            imageUrl={prize.imageUrl}
            authorName={prize.author.name ?? prize.authorUsername}
            authorImage={prize.author.image ?? ''}
          />
          <SubmissionVoting
            prizeStage={prize.stage}
            contractAddress={prize.primaryContractAddress}
            submissions={prize.submissions}
          />

          {prize.primaryContractAddress && session && session.user.isAdmin ? (
            <div className="p-3 space-x-3">
              <StartSubmissionButton
                prizeContractAddress={prize.primaryContractAddress}
              />
              <EndSubmissionAndStartVotingButton
                prizeContractAddress={prize.primaryContractAddress}
              />
              <EndVotingButton
                prizeContractAddress={prize.primaryContractAddress}
              />
              <EarlyDisputeButton
                prizeContractAddress={prize.primaryContractAddress}
              />
            </div>
          ) : null}
        </ScrollArea>
        <div className="w-full lg:w-[25%] mt-5 mx-3 space-y-5  lg:overflow-auto">
          <Winners
            submissions={prize.submissions as Submissions}
            prizeStage={prize.stage}
          />
          <VisionaryFunderCard
            slug={slug}
            prizeId={prize.id}
            name={prize.author.name ?? prize.authorUsername}
            numberOfFunders={prize.numberOfFunders}
            totalFunds={prize.funds}
            avatar={prize.author.image}
          />
          <ContestantsCard
            submissions={prize.submissions}
            prizeStage={prize.stage}
            prizeId={prize.id}
            slug={slug}
            totalFunds={prize.funds}
          />
        </div>
      </div>
    </Suspense>
  )
}
