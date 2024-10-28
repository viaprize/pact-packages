import { z } from 'zod'

export const formSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(1, 'Message is required.'),
  newsletter: z.boolean().default(false),
})
