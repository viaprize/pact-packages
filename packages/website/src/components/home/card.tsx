import { api } from '@/trpc/server'
import { cn } from '@viaprize/ui'
import { Card, CardContent } from '@viaprize/ui/card'
import { ArrowRight } from 'lucide-react'

export default async function StatsCard() {
  const totalFunds = await api.prizes.getTotalFunds()
  const stats = [
    {
      number: '$3K+',
      description: 'Worth of Medical Supplies to Ukraine',
      subtext: 'A Life Saved',
      image:
        'https://images.unsplash.com/photo-1624638760852-8ede1666ab07?q=80&w=3540',
      grid: 'col-span-1 md:col-span-2 lg:col-span-1 row-span-1 lg:col-start-1 lg:row-start-1 lg:row-span-2',
    },
    {
      number: '10K+',
      description: 'Downloads of the Intenty App',
      image: '/hero/cards/2.jpeg',
      grid: 'col-span-1 md:col-span-1 md:row-span-1 lg:col-span-1 lg:col-start-1 lg:row-start-3',
    },
    {
      number: '$12K+',
      description: 'Nueva Esperanza Kids Shelter in Ecuador',
      subtext: 'A Child Adopted',
      image: '/hero/cards/4.jpeg',
      grid: 'col-span-1 md:col-span-2 md:row-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-2 lg:row-span-2',
    },
    {
      number:
        totalFunds !== null
          ? '$' + (Number.parseFloat(totalFunds) + 65000).toString()
          : '$50K+',
      description: 'Total contribution',
      grid: 'col-span-1 md:col-span-1 md:row-span-2  lg:col-start-2 lg:row-start-2 lg:row-span-2',
    },
    {
      number: '100+',
      description: 'Total Prizes',
      image: '/hero/cards/3.jpeg',
      grid: 'col-span-1 md:col-span-2 md:row-span-1  lg:col-start-4 lg:row-start-1 lg:row-span-2',
    },
    {
      number: '$2320',
      description: 'WON',
      subtext: 'Build an AI Voice for a River',
      image: '/hero/cards/5.jpeg',
      grid: 'col-span-1 md:col-span-1 md:row-span-1 lg:col-start-4 lg:row-start-3',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:grid-rows-3 lg:gap-3">
      {stats.map((stat, index) => (
        <Card
          key={stat.number}
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg relative',
            stat.grid,
          )}
        >
          {stat.image ? (
            <img
              src={stat.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-primary bg-opacity-50 transition-opacity duration-300 hover:bg-opacity-40" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 hover:bg-opacity-40" />
          <CardContent className="p-6 relative h-full flex flex-col justify-end">
            <ArrowRight className="absolute top-4 right-4 text-white h-6 w-6" />
            <div className="flex flex-col items-start">
              <span className="text-4xl font-bold text-white mb-2">
                {stat.number}
              </span>
              <p className="text-lg text-gray-200 mb-1">{stat.description}</p>
              {stat.subtext && (
                <p className="text-sm text-gray-300">{stat.subtext}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
