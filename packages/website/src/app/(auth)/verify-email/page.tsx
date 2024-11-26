import { Button } from '@viaprize/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@viaprize/ui/card'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            A sign-in link has been sent to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Please check your inbox and click on the link to sign in. If you
            don't see the email, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Didn't receive the email?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Click here to try again
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
