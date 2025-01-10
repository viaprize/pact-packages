import Image from 'next/image'

import OnboardCard from '@/components/auth/onboard-card'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const session = await auth()
  console.log('session', session)
  if (!session) {
    return redirect('/login')
  }
  return (
    <>
      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <OnboardCard
          email={session?.user.email}
          name={session?.user.name}
          walletAddress={session.user.wallet?.address}
        />

        <div className="hidden bg-muted lg:block">
          <Image
            src="/lamp.jpg"
            alt="Image"
            width={2000}
            height={2000}
            className="h-full w-full object-cover "
          />
        </div>
      </div>
    </>
  )
}
