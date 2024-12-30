'use client'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
import { LoaderIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

export default function StartSubmissionButton({
  prizeContractAddress,
}: {
  prizeContractAddress: string
}) {
  const { mutateAsync: startSubmission, isPending } =
    api.prizes.startSubmission.useMutation()

  const handleStartSubmission = async () => {
    try {
      await startSubmission({ contractAddress: prizeContractAddress })
      toast.success('Submission started successfully!')
    } catch (error) {
      toast.error('Failed to start submission')
    }
  }

  return (
    <Button onClick={handleStartSubmission} disabled={isPending}>
      {isPending ? (
        <div className="flex items-center">
          <LoaderIcon className="mr-2" />
          Ending Submission...
        </div>
      ) : (
        'Start Submission'
      )}
    </Button>
  )
}
