'use client'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function EarlyDisputeButton({
  prizeContractAddress,
}: {
  prizeContractAddress: string
}) {
  const { mutateAsync: endDisputeEarly, isPending } =
    api.prizes.endDisputeEarly.useMutation()
  const util = api.useUtils()

  const handleEndDisputeEarly = async () => {
    try {
      await endDisputeEarly({ contractAddress: prizeContractAddress })
      await util.prizes.getPrizeBySlug.invalidate()
      toast.success('Dispute ended successfully!')
    } catch (error) {
      toast.error('Failed to end dispute')
    }
  }

  return (
    <Button onClick={handleEndDisputeEarly} disabled={isPending}>
      {isPending ? (
        <div className="flex items-center">
          <LoaderIcon className="mr-2" />
          Ending Dispute...
        </div>
      ) : (
        'End Dispute'
      )}
    </Button>
  )
}
