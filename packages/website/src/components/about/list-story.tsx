import Image from 'next/image'

const list = [
  {
    title: 'Our Origins',
    description:
      'During a tech entrepreneurs’ pop-up village called Zuzalu, Noah Chon Lee launched a crowdfunded prize to build an open-source AI voice for a river and various people tossed in $20 each.',
    imageURL: '/about/zuzalu.jpeg',
  },
  {
    title: 'Our First Prizes',
    description:
      'This prize incentivized 12 contributors to begin building in an impromptu hackathon. Five days later the first AI voice (https://airiverchat.com/) for a nature entity in history was presented to the Prime Minister of Montenegro.',
    imageURL: '/about/prize(1).png',
  },
  {
    title: 'Lives Saved',
    description:
      'Next, Noah watched a kamikaze drone driving towards him get shot down while driving into the frontlines of Ukraine to complete a crowdfunded prize for delivering medical supplies. The volunteer medics receiving the supplies used them to treat 45 injured and saved multiple lives.',
    imageURL: '/about/medics.png',
  },
]

export default function ListStory() {
  return (
    <div className="space-y-6">
      {list.map((item) => (
        <div
          key={item.title}
          className="lg:flex items-center justify-between space-y-4 lg:space-y-0"
        >
          <div className="w-full lg:w-[45%] space-y-2 text-center lg:text-left p-2">
            <div className="text-2xl lg:text-4xl font-medium text-primary text-start">
              {item.title}
            </div>
            <div className="text-md lg:text-lg  font-medium text-start">
              {item.description}
            </div>
          </div>
          <div className="w-full lg:w-[34%] ">
            <Image
              src={item.imageURL}
              layout="responsive"
              width={300}
              height={400}
              alt={item.title}
              className="rounded-lg"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
