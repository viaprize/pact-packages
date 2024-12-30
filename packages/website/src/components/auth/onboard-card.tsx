'use client'

import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ConnectButton, useAccountModal } from '@rainbow-me/rainbowkit'
import { Button } from '@viaprize/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@viaprize/ui/card'
import { Checkbox } from '@viaprize/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@viaprize/ui/form'
import { Input } from '@viaprize/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@viaprize/ui/tooltip'
import { LoaderIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { use, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAccount, useDisconnect } from 'wagmi'
import { z } from 'zod'
import { WalletConnectButton } from '../common/wallet-connect-button'

const formSchema = z.object({
  username: z
    .string()
    .min(4, { message: 'Username must be at least 4 characters' })
    .max(40, { message: 'Username must be at most 40 characters' })
    .refine((s) => !s.includes(' '), 'No spaces allowed')
    .refine((s) => !s.includes('@'), 'No @ symbol allowed')
    .refine(
      (s) => /^[a-z0-9_]+$/.test(s),
      'Username must contain only lowercase letters, numbers, or underscores',
    ),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  name: z.string().max(255).min(2, 'Name must be at least 2 characters'),
  shouldGenerateWallet: z.boolean().default(false),
  walletAddress: z.string().optional(),
})

interface OnBoardCardProps {
  name?: string | null
  email?: string | null
  walletAddress?: string | null
}

export default function OnboardCard({
  name,
  email,
  walletAddress,
}: OnBoardCardProps) {
  const { push } = useRouter()
  const { logOut } = useAuth()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: email || '',
      name: name || '',
      shouldGenerateWallet: !walletAddress,
      walletAddress: walletAddress || undefined,
    },
  })

  const mutation = api.users.onboardUser.useMutation({
    onSuccess: async () => {
      push('/prize')
    },
    onError: (error) => {
      if (error.data?.code === 'UNPROCESSABLE_CONTENT') {
        form.setError('username', {
          type: 'manual',
          message: error.message,
        })
      }
    },
  })

  const watchShouldGenerateWallet = form.watch('shouldGenerateWallet')

  useEffect(() => {
    if (!watchShouldGenerateWallet) {
      form.setValue('walletAddress', address)
    }
  }, [address, watchShouldGenerateWallet])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await mutation.mutateAsync({
      email: values.email,
      name: values.name,
      username: values.username,
      walletAddress: values.walletAddress,
    })
  }

  const handleRemoveWallet = () => {
    form.setValue('walletAddress', undefined)
    disconnect()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-[450px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Aboard!
          </CardTitle>
          <CardDescription className="text-center">
            Let's set up your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="cooluser123" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your unique identifier on the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        disabled={!!name}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        disabled={!!email}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shouldGenerateWallet"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        id="shouldGenerateWallet"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!!walletAddress}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="space-y-1 leading-none text-start"
                      onClick={() =>
                        !walletAddress && field.onChange(!field.value)
                      }
                    >
                      <FormLabel>Generate a new wallet</FormLabel>
                      <FormDescription>
                        Perfect for crypto newcomers. This will be a custodial
                        wallet.
                      </FormDescription>
                    </button>
                  </FormItem>
                )}
              />
              {!watchShouldGenerateWallet && (
                <FormField
                  control={form.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        {isConnected ? (
                          <div className="flex items-center">
                            <Input
                              value={field.value}
                              disabled
                              onChange={field.onChange}
                              className="flex-grow"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={handleRemoveWallet}
                              className="ml-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <WalletConnectButton />
                        )}
                      </FormControl>
                      <FormDescription>
                        Your EVM-compatible wallet address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
                {mutation.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="link" onClick={logOut}>
                  Changed your mind? Log out
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>You'll need to start over if you log out now</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  )
}
