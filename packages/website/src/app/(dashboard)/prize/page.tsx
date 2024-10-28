import FetchActivities from '@/components/prize/explore/activity-details/fetch-activities'
import FetchExploreCard from '@/components/prize/explore/card-details/fetch-explore-card'
import type { SearchParams } from '@/lib/utils'
import { ScrollArea } from '@viaprize/ui/scroll-area'

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <div className="flex h-full">
      <ScrollArea className="w-full  h-full   md:border-r-[0.5px]">
        <FetchExploreCard searchParams={searchParams} />
      </ScrollArea>
      <div className="w-[30%] mt-5 mx-3 lg:block hidden">
        <FetchActivities />
      </div>
    </div>
  )
}
