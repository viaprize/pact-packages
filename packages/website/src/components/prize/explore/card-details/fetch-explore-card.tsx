import type { SearchParams } from '@/lib/utils'
import { api } from '@/trpc/server'
import { prizeFilterParamsSchema } from '@/validators/params'
import { IconArrowsSort, IconFilter } from '@tabler/icons-react'
import { Button } from '@viaprize/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@viaprize/ui/sheet'
import { FetchPrizesCsv } from '../../oldprizes/fetch-csv'
import OldPrizeCard from '../../oldprizes/oldprize-card'
import ExploreCard from './explore-card'
import PrizeFilterComponent from './prize-filter-component'

export default async function FetchExplorePrize({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = prizeFilterParamsSchema.parse(searchParams)

  const categoriesArray = params.categories
    ? params.categories.split(',').map((item) => item.trim())
    : undefined

  let minAmount: number | undefined
  let maxAmount: number | undefined
  if (params.prizeAmount) {
    const [min, max] = params.prizeAmount.split('-').map(Number)
    minAmount = min
    maxAmount = max
  }

  const filteredPrizes = await api.prizes.getFilteredPrizes({
    categories: categoriesArray,
    prizeStatus: params.prizeStatus,
    minAmount,
    maxAmount,
    sort: params.sort,
  })
  const activePrizes = await api.prizes.getActivePrizes()
  const deployedPrizes = await api.prizes.getDeployedPrizes()
  const data = await FetchPrizesCsv()
  return (
    <section>
      <div className="flex w-full justify-between items-center p-6">
        <h2 className="font-semibold">{activePrizes} Active Prizes</h2>
        {/* <div className="flex space-x-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">
                <IconFilter className="mr-2" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
              </SheetHeader>
              <PrizeFilterComponent />
            </SheetContent>
          </Sheet>
          <Button variant="secondary">
            <IconArrowsSort className="mr-2" /> Sort by
          </Button>
        </div> */}
      </div>

      <section
        className="grid gap-4 pb-3 px-7"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
      >
        {deployedPrizes?.map((prize) => (
          <ExploreCard key={prize.id} {...prize} />
        ))}

        {data.reverse().map((prize) => {
          if (
            (prize.Awarded && prize.PrizeName) ||
            prize.DatePosted ||
            prize.AwardedUSDe ||
            prize.WinnersAmount
          ) {
            const status = prize.WinnersAmount ? 'Won' : 'Refunded'
            return (
              <OldPrizeCard
                key={prize.Id}
                imageUrl={prize.CardImage}
                title={prize.PrizeName}
                funds={`${prize.AwardedUSDe} USD`}
                prizeStage={status}
                numberOfContestants={prize.ContestantsCount}
                datePosted={prize.DatePosted}
                category={prize.Category}
                href={`/prize/old/${prize.Id}`}
              />
            )
          }
          return null
        })}
      </section>
    </section>
  )
}
