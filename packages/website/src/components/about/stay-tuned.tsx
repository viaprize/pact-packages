/* tslint:disable */
/* eslint-disable */
import { IconMail } from '@tabler/icons-react'
import { Button } from '@viaprize/ui/button'
import { Input } from '@viaprize/ui/input'
import Image from 'next/image'

export default function StayTuned() {
  return (
    <div className="w-full lg:flex lg:space-x-16 space-y-4 lg:space-y-0 justify-center items-center">
      <div className="lg:w-[30%]">
        <Image
          src="/about/stay-tune.png"
          layout="responsive"
          quality={100}
          width={200}
          height={200}
          alt="Our First Prizes"
          className="rounded-md"
        />
      </div>
      <div className="w-full lg:w-[30%]">
        <div className="text-2xl font-medium text-primary">Stay tuned!</div>
        <div className="mt-2 ">
          Get the latest articles and business updates that you need to know,
          you'll even get special recommendations weekly.
        </div>
        <div className="mt-3 lg:flex w-full items-center lg:space-x-2 space-y-3 lg:space-y-0">
          <div className="relative w-full">
            <IconMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
              type="email"
              placeholder="johndoe@gmail.com"
              className="pl-10 border-2 w-full"
            />
          </div>
          <Button type="submit" className="w-full lg:w-[30%]">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  )
}
