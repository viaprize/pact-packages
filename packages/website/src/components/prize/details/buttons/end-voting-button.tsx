'use client'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function EndVotingButton({
  prizeContractAddress,
}: {
  prizeContractAddress: string
}) {
  const { mutateAsync: endVoting, isPending } =
    api.prizes.endVoting.useMutation()

  const handleEndVoting = async () => {
    try {
      await endVoting({ contractAddress: prizeContractAddress })
      toast.success('Voting ended successfully!')
    } catch (error) {
      toast.error('Failed to end voting')
    }
  }

  return (
    <Button onClick={handleEndVoting} disabled={isPending}>
      {isPending ? (
        <div className="flex items-center">
          <LoaderIcon className="mr-2" />
          Ending Voting...
        </div>
      ) : (
        'End Voting'
      )}
    </Button>
  )
}
