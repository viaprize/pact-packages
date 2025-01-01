'use client'

import { useAuth } from '@/hooks/use-auth'
import { api } from '@/trpc/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@viaprize/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@viaprize/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@viaprize/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@viaprize/ui/form'
import { Input } from '@viaprize/ui/input'
import { Label } from '@viaprize/ui/label'
import { Textarea } from '@viaprize/ui/textarea'
import { LoaderIcon, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters long',
  }),
  link: z
    .string()
    .url({ message: 'Please enter a valid URL' })
    .optional()
    .or(z.literal('')),
})

export default function SubmissionDialog({
  totalFunds,
  prizeId,
}: {
  prizeId: string
  totalFunds: number
}) {
  const utils = api.useUtils()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      link: '',
    },
  })

  const addSubmission = api.prizes.addSubmission.useMutation()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addSubmission.mutateAsync({
        prizeId,
        submissionText: values.description,
        projectLink: values.link || undefined,
      })
      toast.success('Submission successful!')
      await utils.prizes.getPrizeBySlug.invalidate()
      setIsOpen(false)
    } catch (error) {
      toast.error('Submission failed. Please try again.')
    }
  }

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const { session } = useAuth()

  const Content = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h3 className="text-lg font-semibold">Prize: ${totalFunds}</h3>
      </div>
      <Form {...form}>
        <form className="space-y-4">
          {!session?.user.wallet?.key ? (
            <Label>
              Your wallet ID for receiving is {session?.user.wallet?.address}
            </Label>
          ) : null}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (required)</FormLabel>
                <FormControl>
                  <Textarea
                    id="description"
                    {...field}
                    placeholder="Describe your submission"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Project Link (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter link" {...field} type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            onClick={async (e) => {
              e.preventDefault()
              await onSubmit(form.getValues())
            }}

            className="w-full"
            disabled={addSubmission.isPending}
          >
            {addSubmission.isPending ? (
              <div className="flex items-center">
                <LoaderIcon className="mr-2" />
                Submitting Entry....
              </div>
            ) : (
              'Submit Entry'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button>Submit Your Work</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Submit Your Work</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <Content />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Submit Your Work</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Submit Your Work</DialogTitle>
        </DialogHeader>
        <Content />
      </DialogContent>
    </Dialog>
  )
}
