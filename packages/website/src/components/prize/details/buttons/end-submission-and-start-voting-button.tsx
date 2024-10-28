'use client'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function EndSubmissionAndStartVotingButton({
  prizeContractAddress,
}: {
  prizeContractAddress: string
}) {
  const { mutateAsync: endSubmissionAndStartVoting, isPending } =
    api.prizes.endSubmissionAndStartVoting.useMutation()

  const handleEndSubmissionAndStartVoting = async () => {
    try {
      await endSubmissionAndStartVoting({
        contractAddress: prizeContractAddress,
      })
      toast.success('Submission ended and voting started successfully!')
    } catch (error) {
      toast.error('Failed to end submission and start voting')
    }
  }

  return (
    <Button onClick={handleEndSubmissionAndStartVoting} disabled={isPending}>
      {isPending ? (
        <div className="flex items-center">
          <LoaderIcon className="mr-2" />
          Ending Submission....
        </div>
      ) : (
        'End Submission And Start Voting'
      )}
    </Button>
  )
}
