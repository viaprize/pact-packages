import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
} from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@viaprize/ui/avatar'
import { Card } from '@viaprize/ui/card'
import Link from 'next/link'
const team = [
  {
    name: 'Noah Chon Lee',
    role: 'Founder',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4E03AQEIl7Zcv2P6fA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1718251011461?e=1730937600&v=beta&t=3YKId4L0HumhNJn7vtDfXPyeXb8QlM4SQ8OtNoshoDs',
    weblink: 'https://noahchonlee.com',
    twitter: 'https://twitter.com/noahchonlee',
    linkedin: 'https://www.linkedin.com/in/noahchonlee/',
    instagram: 'https://www.instagram.com/noahchonlee/',
  },

  {
    name: 'Dipanshu Singh',
    role: 'CTO',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/C5603AQGXqAGj7Y9unw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1643900832409?e=1730937600&v=beta&t=vjr0WImKx7CvN5FLlhqhqgpc1SkDV_lnuybozniwgU0',
    twitter: 'https://x.com/dipanshuhappy',
    linkedin: 'https://www.linkedin.com/in/dipanshu-happy/',
    github: 'https://github.com/dipanshuhappy',
  },
  {
    name: 'Nithin Mengani',
    role: 'Smart Contract Developer',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4D03AQEmqK-2gsHTaA/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1676211040964?e=1730937600&v=beta&t=io1zSINJ5G04AZ7mspZ1K6hbQmjGiLskLm057lX-XKY',
    twitter: 'https://x.com/Nithin_Mengani',
    linkedin: 'https://www.linkedin.com/in/nithin-mengani-0a740a222/',
    github: 'https://github.com/Nithin-Varma',
  },
  {
    name: 'Swaraj Bachu',
    role: 'Senior Developer',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D4D03AQE3ulFkm99eFg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1666785728361?e=1730937600&v=beta&t=W3s9l3n15-r_8Rqm2EKh-ATgpjWqj7hSj6mcIQuhnVo',
    twitter: 'https://x.com/swarajbachu',
    linkedin: 'https://www.linkedin.com/in/swaraj/',
    github: 'https://github.com/swarajbachu',
  },
  {
    name: 'Aryan Tiwari',
    role: 'Senior Developer',
    imageUrl:
      'https://media.licdn.com/dms/image/v2/D5603AQGsnS_CgdZSrg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1727976181403?e=1735171200&v=beta&t=u3fZwphHDRTywRmzQ82Zmj9uuAgWw6iuXd99gTT3iAA',
    twitter: 'https://x.com/arry_tiwari',
    linkedin: 'https://www.linkedin.com/in/arrytiwari/',
    github: 'https://twitter.com/aryan',
  },
]

export default function TeamContent() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center text-2xl lg:text-4xl font-medium text-primary">
        The Team Assembles
      </div>
      <div className=" text-md lg:text-lg  font-medium text-center w-full lg:w-[70%] mt-2">
        Thanks to {'>'}2000 individuals donating to us, Noah funded
        “meta-prizes” for building features in our open-source code base. 30+
        developers worldwide contributed, especially Dipanshu, Nithin, Swaraj,
        and Aryan. We formed a full-time team at the start of 2024.
      </div>
      <div className="w-[90%] justify-center lg:flex items-center space-x-0  lg:space-x-4  space-y-5 lg:space-y-0 mt-7">
        {team.map((member) => (
          <Card
            key={member.name}
            className="w-full flex flex-col items-center rounded-md py-4 bg-background shadow-md border"
          >
            <Avatar className=" w-20 h-20  rounded-full">
              <AvatarImage src={member.imageUrl} alt={member.name} />
              <AvatarFallback>{member.name}</AvatarFallback>
            </Avatar>
            {/* <Image
                src={member.imageUrl}
                alt={member.name}
                width={100}
                height={100}
                className=" w-20 h-20 rounded-full"
              /> */}

            <div className="text-lg font-medium text-slate-700 mt-2">
              {member.name}
            </div>
            <div className="text-primary font-semibold">{member.role}</div>
            <div className="flex space-x-4 mt-4">
              {member.weblink && (
                <Link href={member.weblink} target="_blank" rel="noreferrer">
                  <IconWorld />
                </Link>
              )}
              {member.twitter && (
                <Link href={member.twitter} target="_blank" rel="noreferrer">
                  <IconBrandX />
                </Link>
              )}
              {member.linkedin && (
                <Link href={member.linkedin} target="_blank" rel="noreferrer">
                  <IconBrandLinkedin />
                </Link>
              )}
              {member.github && (
                <Link href={member.github} target="_blank" rel="noreferrer">
                  <IconBrandGithub />
                </Link>
              )}
              {member.instagram && (
                <Link href={member.instagram} target="_blank" rel="noreferrer">
                  <IconBrandInstagram />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
