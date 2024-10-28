import { AnimatedGroup } from '@/components/common/animated-group'
import ContactSection from '@/components/home/contact-us'
import HeroSection from '@/components/home/hero'
import IdeaMarket from '@/components/home/idea-market'
import StepsForFunders from '@/components/home/steps'
import Testimonials from '@/components/home/testimonials'

export default async function Home() {
  return (
    <main className="">
      <HeroSection />
      <IdeaMarket />
      <StepsForFunders />
      <Testimonials />
      <ContactSection />
    </main>
  )
}
