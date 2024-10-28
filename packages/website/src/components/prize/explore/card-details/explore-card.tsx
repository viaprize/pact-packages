import { formatUnderscoreString } from '@/lib/utils'
import {
  IconCoins,
  IconMessageCircle,
  IconUsersGroup,
} from '@tabler/icons-react'
import type { selectPrizeType } from '@viaprize/core/database/schema/prizes'
import type { PrizeStages } from '@viaprize/core/lib/prizes'
import { Badge } from '@viaprize/ui/badge'
import { Card, CardContent } from '@viaprize/ui/card'
import { Separator } from '@viaprize/ui/separator'
import ToolTipSimple from '@viaprize/ui/tooltip-simple'

import Image from 'next/image'
import Link from 'next/link'

export default function ExploreCard(props: selectPrizeType) {
  const { tooltip, text } = getStageInfo(props.stage)

  return (
    <Link href={`/prize/${props.slug}`} className="block">
      <Card className=" h-full flex flex-col   hover:bg-muted-foreground/10">
        <Image
          src={props.imageUrl ?? ''}
          width={1250}
          height={1250}
          alt=""
          objectFit="cover"
          className="h-fit w-full rounded-t-md aspect-video object-cover"
        />
        <CardContent className="p-3 space-y-6">
          <div className="flex items-center justify-between ">
            <div className="text-lg  lg:text-xl text-primary/80 font-medium">
              {props.funds} USD
            </div>
            <Badge className="px-2 py-1  lowercase font-semibold">
              {formatUnderscoreString(props.stage ?? '')}
            </Badge>
          </div>
          <Separator className="my-3" />
          <h1 className="font-medium text-card-foreground/80 hover:underline">
            {props.title}
          </h1>
          <div className="mt-1 lg:mt-3 flex flex-wrap gap-2">
            {props.skillSets?.map((badge) => (
              <Badge
                key={badge}
                className="bg-primary/20 text-primary/70 hover:bg-primary/30 shadow-none"
              >
                {formatUnderscoreString(badge)}
              </Badge>
            ))}
          </div>
          <div className="flex h-5 items-center justify-between text-sm text-muted-foreground mt-5 ">
            <ToolTipSimple content="Number of contestants">
              <div className="flex items-center">
                <IconUsersGroup size={20} className="mr-1" />
                {props.numberOfContestants}
              </div>
            </ToolTipSimple>
            <Separator orientation="vertical" className="w-[2px]" />
            <ToolTipSimple content="Number of funders">
              <div className="flex items-center">
                <IconCoins className="mr-1" />
                {props.numberOfFunders}
              </div>
            </ToolTipSimple>
            <Separator orientation="vertical" className="w-[2px]" />
            <ToolTipSimple content={tooltip}>
              <div className="">{text} 1w 2d 8h</div>
            </ToolTipSimple>
            <Separator orientation="vertical" className="w-[2px]" />
            <ToolTipSimple content="Number of comments">
              <div className="flex items-center">
                <IconMessageCircle size={20} className="mr-1" />
                {props.numberOfComments}
              </div>
            </ToolTipSimple>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function getStageInfo(prizeStage: PrizeStages) {
  switch (prizeStage) {
    case 'NOT_STARTED':
      return {
        tooltip: 'Submission period has not started',
        text: 'start in',
      }
    case 'SUBMISSIONS_OPEN':
      return { tooltip: 'Submission period is open', text: 'Ends by' }
    case 'VOTING_OPEN':
      return {
        tooltip: 'Voting has not started',
        text: 'due in',
      }
    case 'REFUNDED':
      return { tooltip: 'Event has ended', text: 'Ended' }
    case 'WON':
      return { tooltip: 'Event has ended', text: 'Ended' }
    default:
      return { tooltip: 'Stage unknown', text: 'Check later' }
  }
}
