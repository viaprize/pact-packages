'use client'

import SubmissionDialog from '@/components/submission/trigger'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { Badge } from '@viaprize/ui/badge'

export default function SubmitWorkButton({
  prizeId,
  prizeStage,
  totalFunds,
}: {
  prizeId: string
  prizeStage: PrizeStages
  totalFunds: number
}) {
  const { session } = useAuth()
  if (!session?.user) {
    return <Badge>Please sign in to submit your work</Badge>
  }
  if (!session.user.username) {
    return <Badge>Please complete your profile to submit your work</Badge>
  }

  return (
    <>
      {(() => {
        switch (prizeStage) {
          case 'SUBMISSIONS_OPEN':
            return (
              <SubmissionDialog prizeId={prizeId} totalFunds={totalFunds} />
            )
          default:
            return (
              <Badge variant="destructive" className="text-md">
                Submissions are closed
              </Badge>
            )
        }
      })()}
    </>
  )
}
