import { Avatar, AvatarImage } from '@viaprize/ui/avatar'
import { Button } from '@viaprize/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@viaprize/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { AnimatedGroup } from '../common/animated-group'
export default function IdeaMarket() {
  const cardData = [
    {
      title: 'For Visionaries',
      imageSrc: '/hero/avatar.png',
      description:
        "We know you have lot of ideas, but you don't have the resources to implement them.",
      listItems: [
        'You can get funding for your idea',
        'Find the right team to implement your idea',
        'And also Validate your idea with the community',
      ],
      link: '/prize/create',
      linkText: 'Create a Prize',
    },
    {
      title: 'For Builders',
      imageSrc: '/hero/avatar.png',
      description:
        'Are you an entrepreneur who wants to work on a project that you know has real demand?',
      listItems: [
        'Find projects that match your skills',
        'Know how much reward is there for completing a project',
        'Compete or join forces with others interested in completing the project',
      ],
      link: '/prize',
      linkText: 'Explore Prizes',
    },
    {
      title: 'For Funders',
      imageSrc: '/hero/avatar.png',
      description:
        'Want to fund projects with a guarantee of either success or a refund?',
      listItems: [
        'Crowdfund projects you believe in and want to see turned into reality',
        'Refunded by the deadline if no one successfully completes it',
        'Vote on winners'
      ],
      link: '/prize',
      linkText: 'Explore Prizes',
    },
  ]

  return (
    <section className="flex flex-col items-center gap-10  justify-center py-20 px-4">
      <div className="flex flex-col items-center text-center justify-center gap-3 max-w-3xl">
        <AnimatedGroup preset="blur-slide">
          <h2 className="text-4xl  font-medium">An Idea MarketPlace</h2>
          <p className="text-xl text-muted-foreground text-balance">
            A prize is a project proposal combined with a reward for anyone who
            completes the project
          </p>
        </AnimatedGroup>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-screen-2xl mx-auto gap-3">
        {cardData.map((card) => (
          <Card
            key={card.title}
            className="justify-between h-full flex flex-col"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarImage src={card.imageSrc} />
              </Avatar>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p>{card.description}</p>
              <ol className="list-none p-0 m-0">
                {card.listItems.map((item) => (
                  <li key={`${item}`} className="flex items-center gap-2">
                    <Check />
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={card.link}>{card.linkText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
