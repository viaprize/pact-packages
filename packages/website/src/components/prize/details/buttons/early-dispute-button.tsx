'use client'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
import React from 'react'
export default function EarlyDisputeButton({
  prizeContractAddress,
}: {
  prizeContractAddress: string
}) {
  const { mutateAsync: endDisputeEarly, isPending } =
    api.prizes.endDisputeEarly.useMutation()
  const util = api.useUtils()

  return (
    <Button
      onClick={async () => {
        await endDisputeEarly({
          contractAddress: prizeContractAddress,
        })
        await util.prizes.getPrizeBySlug.invalidate()
      }}
      disabled={isPending}
    >
      End Dispute
    </Button>
  )
}
