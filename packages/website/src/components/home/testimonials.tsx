import ClientTweetCard from '../ui/react-tweet-client'

const tweetids = [
  '1710215482505330948',
  '1710588223330890218',
  '1712643719063892425',
  '1823725952372744455',
  '1710150484034740626',
  '1829870083503763604',
  '1795682668224586139',
  '1716568517347352789',
  '1836353671031878100',
]

export default function Testimonials() {
  return (
    <section className="max-w-screen-2xl mx-auto w-full px-4 py-24 md:py-40 ">
      <h2 className="text-4xl font-medium text-center mb-8">
        Here is what our users are saying
      </h2>
      <div className="columns-[400px]  w-full px-4">
        {tweetids.map((tweetid) => (
          <ClientTweetCard key={tweetid} id={tweetid} className="mb-2 w-full" />
        ))}
      </div>
    </section>
  )
}
