'use client'

import { env } from '@/env'
import { useAuth } from '@/hooks/useAuth'
import { wagmiConfig } from '@/lib/wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ERC20_PERMIT_SIGN_TYPE, NONCE_TOKEN_ABI } from '@viaprize/core/lib/abi'
import {
  CONTRACT_CONSTANTS_PER_CHAIN,
  type ValidChainIDs,
} from '@viaprize/core/lib/constants'

import { Badge } from '@viaprize/ui/badge'
import { Button } from '@viaprize/ui/button'
import { Card } from '@viaprize/ui/card'
import { parseSignature } from 'viem'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@viaprize/ui/dialog'

import { usdcSignTypeHash } from '@/lib/utils'
import { api } from '@/trpc/react'
import { Input } from '@viaprize/ui/input'
import { Label } from '@viaprize/ui/label'
import { RadioGroup, RadioGroupItem } from '@viaprize/ui/radio-group'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAccount, useSignTypedData } from 'wagmi'
import { readContract } from 'wagmi/actions'

// Define the props type
interface DonateCardProps {
  projectName: string
  funds: number
  projectImage: string
  contractAddress: string
}

export default function DonateCard({
  projectName,
  funds,
  contractAddress,
  projectImage,
}: DonateCardProps) {
  const [amount, setAmount] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (
      value === '' ||
      (/^\d*\.?\d*$/.test(value) && !Number.isNaN(Number.parseFloat(value)))
    ) {
      setAmount(value)
    }
  }

  const { openConnectModal } = useConnectModal()
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { session } = useAuth()
  const { signTypedDataAsync } = useSignTypedData()
  const addUsdcFundsForUsers =
    api.prizes.addUsdcFundsCryptoForUser.useMutation()
  const addUsdcFundsForUsersAnonymously =
    api.prizes.addUsdcFundsCryptoForAnonymousUser.useMutation()
  const addUsdcFundsFiatForAnonymousUser =
    api.prizes.addUsdcFundsFiatForAnonymousUser.useMutation()
  const addUsdcFundsFiatForUser =
    api.prizes.addUsdcFundsFiatForUser.useMutation()
  const generateSignature = async (
    address: `0x${string}`,
    spender: `0x${string}`,
  ) => {
    const chainId = Number.parseInt(env.NEXT_PUBLIC_CHAIN_ID) as ValidChainIDs
    const constants = CONTRACT_CONSTANTS_PER_CHAIN[chainId]

    const amountInUSDC = BigInt(Number.parseFloat(amount) * 1000000)
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 100_000)
    const nonce = await readContract(wagmiConfig, {
      abi: NONCE_TOKEN_ABI,
      address: constants.USDC,
      functionName: 'nonces',
      args: [address],
    })
    const { usdcSign, hash } = usdcSignTypeHash({
      chainId,
      deadline,
      nonce: BigInt(nonce),
      owner: address,
      spender: spender,
      value: amountInUSDC,
      usdcContract: constants.USDC,
    })
    const signature = await signTypedDataAsync({
      types: ERC20_PERMIT_SIGN_TYPE,
      primaryType: 'Permit',
      domain: usdcSign.domain,
      message: usdcSign.message,
    })

    const rsv = parseSignature(signature)
    return { rsv, hash, deadline, amountInUSDC, signature }
  }
  const utils = api.useUtils()

  const handleCryptoDonationAnonymously = async () => {
    console.log('Donation with wallet')
    try {
      if (!address) {
        throw new Error('No wallet connected found')
      }
      const { amountInUSDC, deadline, hash, rsv } = await generateSignature(
        address,
        contractAddress as `0x${string}`,
      )

      await addUsdcFundsForUsersAnonymously.mutateAsync({
        amount: Number.parseInt(amountInUSDC.toString()),
        deadline: Number.parseInt(deadline.toString()),
        ethSignedHash: hash,
        r: rsv.r,
        s: rsv.s,
        v: Number.parseInt(rsv.v?.toString() ?? '0'),
        contractAddress: contractAddress,
      })
      router.refresh()
    } catch (e) {
      console.log(e)
    }
  }
  const handleCardDonation = async () => {
    console.log('Donation with card')
    try {
      const amountInUSDC = BigInt(Number.parseFloat(amount) * 1_000_000)

      if (!session?.user?.wallet) {
        throw new Error('No user found')
      }
      const isCustodial = !!session.user.wallet.key
      let finalSignature: string | undefined
      let ethHash: string | undefined
      let finalDeadline = Math.floor(Date.now() / 1000) + 100_000
      if (!isCustodial) {
        const { amountInUSDC, deadline, hash, rsv, signature } =
          await generateSignature(
            address ?? '0x0000',
            contractAddress as `0x${string}`,
          )
        finalSignature = signature
        finalDeadline = Number.parseInt(deadline.toString())
        ethHash = hash
      }

      const url = await addUsdcFundsFiatForUser.mutateAsync({
        amount: Number.parseInt(amountInUSDC.toString()),
        cancelUrl: window.location.href,
        successUrl: window.location.href,
        spender: contractAddress,
        hash: ethHash,
        signature: finalSignature,
        deadline: finalDeadline,
      })
      window.open(url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }
  const handleCardDonationAnonymously = async () => {
    console.log('Donation with card anonymously')

    try {
      const amountInUSDC = BigInt(Number.parseFloat(amount) * 1_000_000)
      const url = await addUsdcFundsFiatForAnonymousUser.mutateAsync({
        amount: Number.parseInt(amountInUSDC.toString()),
        cancelUrl: window.location.href,
        successUrl: window.location.href,
        spender: contractAddress,
      })
      console.log({ url })
      window.open(url, '_blank')
    } catch (e) {
      console.error(e)
    }
  }
  const handleCryptoDonation = async () => {
    console.log('Donation with wallet')

    try {
      if (!address) {
        throw new Error('No wallet connected found')
      }
      if (!session?.user?.wallet) {
        throw new Error('No user found')
      }
      const { amountInUSDC, deadline, hash, rsv } = await generateSignature(
        address,
        contractAddress as `0x${string}`,
      )

      await addUsdcFundsForUsers.mutateAsync({
        amount: Number.parseInt(amountInUSDC.toString()),
        deadline: Number.parseInt(deadline.toString()),
        ethSignedHash: hash,
        r: rsv.r,
        s: rsv.s,
        v: Number.parseInt(rsv.v?.toString() ?? '0'),
        owner: address,
        contractAddress: contractAddress,
      })
      await utils.prizes.getPrizeBySlug.invalidate()
    } catch (e) {
      console.log(e)
    } finally {
      window.location.reload()
    }
  }

  const renderDonationOptions = () => {
    if (!session?.user) {
      return (
        <RadioGroup
          onValueChange={setSelectedOption}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="card-anonymously" id="card-anonymously" />
            <Label htmlFor="card-anonymously">Donate with Card</Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="crypto-anonymously"
              id="crypto-anonymously"
            />
            <Label htmlFor="crypto-anonymously">Donate with Wallet</Label>
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Log in to have voting rights on the winner
            </p>
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
          </div>
        </RadioGroup>
      )
    }

    return (
      <RadioGroup
        onValueChange={setSelectedOption}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card">Donate with Card</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="crypto" id="crypto" />
          <Label htmlFor="crypto">Donate with Crypto</Label>
        </div>
      </RadioGroup>
    )
  }

  const renderDonateButton = () => {
    if (!selectedOption) return null

    switch (selectedOption) {
      case 'card-anonymously':
        return (
          <Button
            onClick={handleCardDonationAnonymously}
            disabled={addUsdcFundsFiatForAnonymousUser.isPending}
          >
            Donate ${amount}
          </Button>
        )
      case 'card':
        return session?.user.wallet?.key ? (
          <Button onClick={handleCardDonation}>Donate ${amount}</Button>
        ) : isConnected ? (
          <Button onClick={handleCardDonation}>Donate ${amount}</Button>
        ) : (
          <Button onClick={openConnectModal}>Connect Wallet</Button>
        )
      case 'custodial':
        return (
          <Button onClick={() => console.log('Donating with custodial wallet')}>
            Donate ${amount}
          </Button>
        )
      case 'crypto':
        return isConnected ? (
          <Button
            onClick={handleCryptoDonation}
            disabled={addUsdcFundsForUsers.isPending}
          >
            Donate ${amount}
          </Button>
        ) : (
          <Button onClick={openConnectModal}>Connect Wallet</Button>
        )
      case 'crypto-anonymously':
        return isConnected ? (
          <Button onClick={handleCryptoDonationAnonymously}>
            Donate ${amount}
          </Button>
        ) : (
          <Button onClick={openConnectModal}>Connect Wallet</Button>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card className="w-full p-4 lg:flex items-center space-y-3 lg:space-y-0">
        <div className="w-full lg:w-[60%]">
          <div className="text-2xl text-primary font-medium">{funds}</div>
          <div>Total Raised</div>
        </div>
        <div className="w-full space-y-2">
          <div className="relative w-full">
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter Amount"
              className="w-full"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!amount || Number.parseFloat(amount) <= 0}
              >
                Donate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-normal text-xl">
                  {projectName}
                </DialogTitle>
              </DialogHeader>
              <div className="">
                <Image
                  alt={projectName}
                  src={projectImage}
                  quality={100}
                  width={100}
                  height={100}
                  className="w-full max-h-[200px] "
                />
              </div>
              <div className="grid gap-4 py-4">
                {!session?.user && (
                  <div className="font-semibold">
                    Donation without voting rights
                  </div>
                )}
                {renderDonationOptions()}
                {renderDonateButton()}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </>
  )
}
