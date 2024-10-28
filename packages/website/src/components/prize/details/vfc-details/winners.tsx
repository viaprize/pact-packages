import { api } from '@/trpc/react'
import type { Submissions } from '@/types/submissions'
import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Card } from '@viaprize/ui/card'
import React from 'react'

export default function Winners({
  prizeStage,
  submissions,
}: { prizeStage: PrizeStages; submissions: Submissions }) {
  if (prizeStage !== 'WON') return null
  const winners = submissions.filter((submission) => submission.won > 0)
  return (
    <Card className="px-3 py-4">
      <div className="text-muted-foreground text-lg font-normal mb-3">
        Winners ({winners.length})
      </div>
      <div className="flex items-center justify-between mb-2">
        {winners.map((winner) => {
          if (!winner.user?.username || !winner.user?.name) return null
          return (
            <>
              <div
                className="flex items-center space-x-2 "
                key={`s${winner.submissionHash}`}
              >
                <Avatar>
                  <AvatarImage
                    src={winner.user?.image ?? undefined}
                    alt={winner.user.username}
                  />
                  <AvatarFallback>
                    {winner.user.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>{winner.user.name}</div>
              </div>
              <div
                className="text-primary"
                key={`btn-${winner.submissionHash}`}
              >
                ${winner.won.toFixed(2)} <span className="text-black">Won</span>
              </div>
            </>
          )
        })}
      </div>
    </Card>
  )
}
