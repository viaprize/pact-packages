'use client'

import { Button } from '@viaprize/ui/button'
import { Input } from '@viaprize/ui/input'
import { Label } from '@viaprize/ui/label'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useState } from 'react'
import { sendMagicMail } from './actions'

export function EmailAuthButton({ redirectTo = '/' }: { redirectTo?: string }) {
  const [isSent, setIsSent] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await sendMagicMail(email, redirectTo)
      setIsSent(true)
    } catch (err) {
      setError('Failed to send email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="sr-only">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          'Sending...'
        ) : isSent ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Email Sent
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Continue with Email
          </>
        )}
      </Button>
      {error && (
        <div className="flex items-center text-red-500 mt-2">
          <AlertCircle className="mr-2 h-4 w-4" />
          {error}
        </div>
      )}
    </form>
  )
}
