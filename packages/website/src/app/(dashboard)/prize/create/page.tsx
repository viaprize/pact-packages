import BountyCreationForm from '@/components/prize/create/ai-prize-create'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

export default async function ContestForm() {
  const session = await auth()
  console.log({ session })
  if (!session) {
    return redirect('/login')
  }

  return (
    <section className="container gird place-content-center w-full h-full">
      {/* <CreatePrizeForm imageUploadUrl={imageUrl} /> */}
      <BountyCreationForm />
    </section>
  )
}
