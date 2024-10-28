'use client'
import { api } from '@/trpc/react'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@viaprize/ui/card'
import { Suspense } from 'react'

export default function VisionaryFunderCard({
  name,
  avatar,
  numberOfFunders,
  totalFunds,
  slug,
  prizeId,
}: {
  avatar?: string | null
  name: string
  numberOfFunders: number
  totalFunds: number
  prizeId: string
  slug: string
}) {
  const [funders] = api.prizes.getFunders.useSuspenseQuery({
    prizeId,
    slug,
  })
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Card className="px-3 py-4">
        <div className="text-muted-foreground text-lg font-normal">
          Visionary
        </div>

        <div className="flex items-center space-x-2 mt-2">
          <Avatar className="border">
            <AvatarImage src={avatar ?? undefined} alt="@shadcn" />
            <AvatarFallback>{name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>{name}</div>
        </div>

        <div className="text-muted-foreground text-lg font-normal mt-5 mb-2">
          Funders ({funders?.length ?? numberOfFunders})
        </div>
        {funders?.map((funder) => (
          <div
            key={funder.id}
            className="flex items-center my-4 justify-between"
          >
            <div className="flex items-center space-x-2">
              <Avatar className="border">
                <AvatarImage
                  src={funder?.user?.image ?? undefined}
                  alt={funder.donor}
                />
                <AvatarFallback>{funder.donor.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>{funder.donor}</div>
            </div>
            <div className="text-primary">${funder.donationText}</div>
          </div>
        ))}
      </Card>
    </Suspense>
  )
}
