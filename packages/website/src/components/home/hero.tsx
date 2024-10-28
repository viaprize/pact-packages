import { AnimatedGroup } from '@/components/common/animated-group'
import { Button } from '@viaprize/ui/button'
import { Card, CardFooter, CardHeader } from '@viaprize/ui/card'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import StatsCard from './card'

export default function HeroSection() {
  return (
    <section className="relative w-full container pt-[80px]  min-h-screen max-w-screen-2xl mx-auto flex flex-col justify-center gap-5 items-center">
      <Image
        src="/hero/test.svg"
        alt="Hero"
        width="1920"
        height="1080"
        className="h-screen absolute inset-0 w-screen z-10 dark:brightness-[0.2] dark:grayscale"
      />
      <AnimatedGroup
        preset="blur-slide"
        className="z-20 max-w-2xl gap-2 text-center"
      >
        <h2 className="text-2xl md:text-4xl font-bold">Build the Future</h2>
        <h1 className="text-5xl md:text-7xl font-bold">
          via <span className="text-primary text">Prizes</span>
        </h1>
        <p className="text-lg md:text-xl mt-4">
          List and build the world’s most needed product ideas
        </p>
        <div className="mt-8 flex flex-col md:flex-row gap-1 justify-center">
          <Button asChild className="px-5 py-4 md:px-7 md:py-6">
            <Link href="/prize">Explore Prizes</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="px-5 py-4 md:px-7 md:py-6"
          >
            <Link href="/prize/create">Create Prize</Link>
          </Button>
        </div>
      </AnimatedGroup>
      <StatsCard />
    </section>
  )
}
