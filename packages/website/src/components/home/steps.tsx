'use client'

import { cn } from '@viaprize/ui'
import { Card } from '@viaprize/ui/card'
import { Award, CheckCircle2, Circle, HandCoins, Medal } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { BorderBeam } from '../ui/border-beam'

const steps = [
  {
    title: 'Create a Prize',
    description: (
      <p>
        Post your project idea, define objectives, set judging criteria, and a
        submission deadline.
      </p>
    ),
    image: '/hero/step1.png',
    icon: <Award className="size-10" />,
  },
  {
    title: 'Fund a Prize',
    description: (
      <p>
        Fund a prize to attract talents and invite more funders to increase the
        prize pool.
      </p>
    ),
    image: '/hero/step2.png',
    icon: <HandCoins className="size-10" />,
  },
  {
    title: 'Vote for the Winner',
    description: (
      <p>
        Review submissions, select the best project, distribute the prize, and
        judges can vote for a refund.
      </p>
    ),
    image: '/hero/step2.png',
    icon: <Medal className="size-10" />,
  },
]

export default function StepsForFunders() {
  const [currentStep, setCurrentStep] = useState(3)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // useEffect(() => {
  //   // Clear any existing timer
  //   if (timerRef.current) {
  //     clearTimeout(timerRef.current)
  //   }
  //   // Set up a new timer for 4 seconds
  //   timerRef.current = setTimeout(() => {
  //     setCurrentStep((prevStep) => (prevStep + 1) % steps.length)
  //   }, 5000)

  //   // Clean up on unmount
  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current)
  //     }
  //   }
  // }, [currentStep])

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  return (
    <div className="flex flex-col w-full max-w-screen-2xl mx-auto gap-8 py-24 md:py-40 px-4">
      {/* Header */}
      <h2 className="text-4xl max-w-xl text-balance mx-auto font-medium text-center">
        Refundable Prizes,{' '}
        <span className="text-primary">Results-based Guarantees</span>
      </h2>

      {/* Steps */}
      <div className="w-full grid md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          return (
            <Card
              key={step.title}
              className={cn(
                'flex flex-col justify-between w-full p-6 gap-2 cursor-pointer transition-all duration-300 hover:shadow-md',
              )}
              onClick={() => handleStepClick(index)}
            >
              <div className="flex flex-col items-center text-center gap-5">
                {/* Icon */}
                <div className="p-3 rounded-full bg-primary text-primary-foreground">
                  {step.icon}
                </div>
                {/* Title and Description */}
                <div className="flex-grow">
                  <h3
                    className={cn(
                      'text-lg sm:text-2xl font-semibold transition-colors duration-300',
                      isActive ? 'text-primary' : 'text-foreground',
                    )}
                  >
                    {step.title}
                  </h3>
                  <div className="mt-1 max-w-80 text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              <div className="w-full h-2  relative bg-gray-300 rounded-full overflow-hidden mb-2">
                <div
                  key={currentStep === index ? currentStep : undefined}
                  className={`absolute h-full inset-0 rounded-full bg-primary ${
                    index === currentStep ? 'progress-bar' : ''
                  }`}
                  style={{
                    width: index < currentStep ? '100%' : '0%',
                  }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {/* Image */}
      <div className="w-full relative rounded-md h-[60vh]">
        <BorderBeam
          size={250}
          duration={12}
          delay={9}
          colorFrom="#00ff00"
          colorTo="#008000"
          borderWidth={3}
        />
        <Image
          src={steps[currentStep]?.image ?? ''}
          alt={`Step ${currentStep + 1}`}
          width={600}
          height={400}
          className="rounded-lg object-cover w-full h-full border-[3px] border-secondary/60"
        />
      </div>
      <style jsx>{`
        .progress-bar {
          animation: progressAnimation 4s linear forwards;
        }

        @keyframes progressAnimation {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
