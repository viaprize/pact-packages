'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'

import { api } from '@/trpc/react'
import { Button } from '@viaprize/ui/button'
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
import { Textarea } from '@viaprize/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { formSchema } from './contactform-schema'
import { handleFormSubmit } from './handleContact-form'

export default function ContactSection() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      newsletter: false,
    },
  })

  const subscribe = api.loops.subscribe.useMutation()

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically send the form data to your backend
    if (values.newsletter) {
      subscribe.mutate({
        email: values.email,
        subscribeToNewsletter: values.newsletter,
        firstname: values.name,
      })
    }
    console.log(values)
  }

  const onSubmitForm = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    toast.promise(handleFormSubmit(values), {
      loading: 'Submitting...',
      success: 'Submitted successfully',
      error: 'Something went wrong',
    })
    setTimeout(() => {
      toast.dismiss()
    }, 3000)
    form.reset()
    setIsLoading(false)
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-gray-600">
              Feedback? Questions?
              <br />
              Or simply just stay in the loop.
            </p>
          </div>
          <div className="md:w-1/2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitForm)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          className="border-none bg-muted"
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
                          className="border-none bg-muted"
                          placeholder="Your email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          className="border-none bg-muted"
                          placeholder="Your message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newsletter"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Subscribe to newsletter</FormLabel>
                        <FormDescription>
                          Receive updates and news from us.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} className="w-full" type="submit">
                  Submit
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}
