import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'
import FetchPrize from './fetch-prize'

export default async function PrizeDetails({
  params,
}: { params: { slug: string } }) {
  const session = await auth()

  console.log(params.slug, 'params.slug')

  if (session && !session.user.username) {
    return redirect('/onboard')
  }

  return (
    <div className="w-full h-full">
      <FetchPrize params={params} />
    </div>
  )
}
