import {
  IconCategory,
  IconCoins,
  IconMessageCircle,
  IconUsersGroup,
} from '@tabler/icons-react'
import { Badge } from '@viaprize/ui/badge'
import { Card } from '@viaprize/ui/card'
import { Separator } from '@viaprize/ui/separator'

import Image from 'next/image'
import Link from 'next/link'

interface OldCardProps {
  imageUrl: string
  title: string
  funds: string
  prizeStage: string
  numberOfContestants: number
  category: string
  datePosted: string
  href: string
}

export default function OldPrizeCard(props: OldCardProps) {
  return (
    <Link href={props.href} className="block">
      <Card className="p-3 flex  h-full flex-col space-x-0 hover:bg-muted-foreground/10">
        <div className="">
          <Image
            src={props.imageUrl}
            width={1250}
            height={1250}
            alt=""
            objectFit="cover"
            className="h-fit w-full rounded-md aspect-video object-cover"
          />
        </div>

        <div className="pt-5">
          <div className="flex items-center justify-between ">
            <div className="text-lg  lg:text-xl text-primary/80 font-medium">
              {props.funds}
            </div>
            <Badge
              variant="secondary"
              className="text-green-600 px-2 py-1 font-normal"
            >
              {props.prizeStage}
            </Badge>
          </div>
          <Separator className="my-3" />
          <h1 className="font-medium text-card-foreground/80 hover:underline">
            {props.title}
          </h1>

          <div className="flex h-5 items-center justify-between text-sm text-muted-foreground mt-5 ">
            <div className="flex items-center">
              <IconUsersGroup size={20} className="mr-1" />
              {props.numberOfContestants}
            </div>
            <Separator orientation="vertical" className="w-[2px]" />
            <div className="flex items-center">
              <IconCategory className="mr-1" />
              {props.category}
            </div>
            <Separator orientation="vertical" className="w-[2px]" />
            <div className="">{props.datePosted}</div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
