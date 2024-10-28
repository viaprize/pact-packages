import { REDIRECT_TO_AFTER_AUTH } from '@/lib/constant'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@viaprize/ui/card'
import { Separator } from '@viaprize/ui/separator'
import { EmailAuthButton } from './email-auth-button'
import GithubAuthButton from './github-auth-button'
import GoogleAuthButton from './google-auth-button'
import { WalletLogin } from './wallet-login'

// Define an arbitrary redirect URL
// const REDIRECT_TO_AFTER_AUTH = "/dashboard";

export default function LoginCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
      <Card className="w-[400px] shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Login or sign up to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-1">
            <GithubAuthButton redirectTo={REDIRECT_TO_AFTER_AUTH} />
            <GoogleAuthButton redirectTo={REDIRECT_TO_AFTER_AUTH} />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-card text-muted-foreground rounded-md">
                Or continue with
              </span>
            </div>
          </div>
          <EmailAuthButton redirectTo={REDIRECT_TO_AFTER_AUTH} />
          <Separator />
        </CardContent>
      </Card>
    </div>
  )
}
