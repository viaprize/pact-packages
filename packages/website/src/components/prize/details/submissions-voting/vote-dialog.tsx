'use client'

import { WalletConnectButton } from '@/components/common/wallet-connect-button'
import { useAuth } from '@/hooks/useAuth'
import { voteMessageHash } from '@/lib/utils'
import { wagmiConfig } from '@/lib/wagmi'
import { api } from '@/trpc/react'
import { PRIZE_V2_ABI } from '@viaprize/core/lib/abi'
import { Button } from '@viaprize/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@viaprize/ui/dialog'
import { Input } from '@viaprize/ui/input'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { util } from 'zod'

interface VoteDialogProps {
  maxVotes: number
  submissionHash: string
  contractAddress: string
}
export default function VoteDialog({
  maxVotes,
  contractAddress,
  submissionHash,
}: VoteDialogProps) {
  const [open, setOpen] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const addVotes = api.prizes.addVotes.useMutation()
  const { session } = useAuth()
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const isCustodial = !!session?.user.wallet?.key
  const utils = api.useUtils()
  const handleVote = async () => {
    if (!session) {
      throw new Error('User not authenticated')
    }

    console.log('Voted', voteCount)
    const finalVotes = Math.floor(voteCount * 1_000_000)
    let signature: `0x${string}` | undefined
    if (!isCustodial) {
      if (!address) {
        throw new Error('No Wallet Connected')
      }
      if (
        session.user.wallet?.address.toLowerCase() !== address.toLowerCase()
      ) {
        throw new Error(
          `Connect wallet with this address ${session.user.wallet?.address}`,
        )
      }

      const nonce = await readContract(wagmiConfig, {
        abi: PRIZE_V2_ABI,
        address: contractAddress as `0x$string`,
        functionName: 'nonce',
      })
      signature = await signMessageAsync({
        message: {
          raw: voteMessageHash(
            submissionHash,
            finalVotes,
            Number.parseInt(nonce.toString() ?? '0') + 1,
            contractAddress,
          ) as `0x$string`,
        },
      })
    }
    await addVotes.mutateAsync({
      amountInUSDC: finalVotes,
      contractAddress,
      submissionHash,
      signature: signature,
    })
    console.log('Vote added')
    await new Promise((r) => setTimeout(r, 2000))
    console.log('Invalidating cache')
    await utils.prizes.getPrizeBySlug.invalidate()
    console.log('Invalidated cache 2')
    await utils.prizes.getTotalVotingDetail.invalidate()
    console.log('Invalidated cache 3')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Vote</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vote</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-lg font-bold bg-yellow-200 text-yellow-800 p-2 rounded-md inline-block">
            You have a maximum of ${maxVotes} votes
          </p>
          <div className="flex items-center gap-4">
            <Input
              id="vote"
              type="number"
              max={maxVotes}
              value={voteCount}
              onChange={(e) => setVoteCount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {!isCustodial && !isConnected ? (
              <WalletConnectButton />
            ) : (
              <Button
                onClick={handleVote}
                className="w-full"
                disabled={voteCount > maxVotes || addVotes.isPending}
              >
                Vote
              </Button>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
