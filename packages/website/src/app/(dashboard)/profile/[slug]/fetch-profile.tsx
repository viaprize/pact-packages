import PrizeProfileTabs from '@/components/profile/prize-profile-tabs'
import UserPrizeStatus from '@/components/stats-cards/user-prize-status'
import { api } from '@/trpc/server'
import { IconArrowLeft } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Badge } from '@viaprize/ui/badge'
import { Button } from '@viaprize/ui/button'
import { Separator } from '@viaprize/ui/separator'

export default async function FetchProfile({
  params: { slug },
}: {
  params: { slug: string }
}) {
  const user = await api.users.getUserByUsername(slug)

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0  bg-gradient-to-r from-green-300 to-green-500 z-0 h-[45%]" />
        {/* <Button variant="outline" className="ml-2 mt-2 mb-4 z-10 relative">
          <IconArrowLeft className="mr-1" size={20} /> Back
        </Button> */}
        <div className="w-full flex justify-center items-center z-10 relative ">
          <div className="max-w-[90%] w-[900px]  rounded-xl z-10 relative bg-background">
            <div className="p-5">
              <div className="lg:flex items-center">
                <Avatar className="h-[70px] w-[70px] lg:h-[120px] lg:w-[120px] ring-2 ring-primary">
                  <AvatarImage
                    src={
                      user.image ||
                      'https://t4.ftcdn.net/jpg/04/73/25/49/360_F_473254957_bxG9yf4ly7OBO5I0O5KABlN930GwaMQz.jpg'
                    }
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="mt-2 lg:mt-0 lg:ml-7">
                  <div className="text-lg flex items-center text-card-foreground/90 font-medium">
                    <div>{user.name}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @{user.username}
                  </div>
                  <div className="mt-1 text-sm md:text-base">{user.bio}</div>
                  <div className="text-accent-foreground/80 flex space-x-2 mt-3">
                    <div>Skillset:</div>
                    <div>
                      {user.skillSets?.length ? (
                        user.skillSets.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="mb-1 mr-2"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span>No skills added yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <UserPrizeStatus userPrizeStatus={[]} />
            </div>
            <Separator className="mt-1 mb-4" />
            <PrizeProfileTabs username={slug} />
          </div>
        </div>
      </div>
    </>
  )
}
