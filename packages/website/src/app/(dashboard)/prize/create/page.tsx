import BountyCreationForm from '@/components/prize/create/ai-prize-create'
import { auth } from '@/server/auth'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import { redirect } from 'next/navigation'

export default async function ContestForm() {
  const session = await auth()
  console.log({ session })
  if (!session) {
    return redirect('/login')
  }

  return (
    <section className="container gird place-content-center w-full h-full  p-6">
      <ScrollArea className="h-full">
        {/* <CreatePrizeForm imageUploadUrl={imageUrl} /> */}
        <BountyCreationForm />
      </ScrollArea>
    </section>
  )
}
