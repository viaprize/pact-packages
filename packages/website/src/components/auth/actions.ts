'use server'

import { signIn } from '@/server/auth'

export async function sendMagicMail(email: string, redirectTo: string) {
  await signIn('resend', {
    email,
    redirect: true,
    redirectTo,
  })
}
