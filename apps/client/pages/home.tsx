import useAppUser from '@/context/hooks/useAppUser';
import { Badge, Burger, Button, Card, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BiLogoLinkedin, BiSolidRightArrowCircle } from 'react-icons/bi';
import { BsTwitter } from 'react-icons/bs';
import { ImTelegram } from 'react-icons/im';
import type { RenderPhotoProps } from 'react-photo-album';
import { PhotoAlbum } from 'react-photo-album';

const photoSizes: number[][] = [
  [2160, 2160],
  [2160, 1170],
  [2160, 1076],
  [2160, 890],
  [2160, 984],
  [2160, 984],
  [2160, 4260],
  [2160, 1048],
  [2160, 1896],
  [2160, 3840],
  [2160, 1264],
];
interface FetchError extends Error {
  status?: number;
}
const breakpoints: number[] = [1080, 640, 384, 256, 128, 96, 64, 48];

const basePath = '/home/tweets/tweet';

const photos: {
  src: string;
  width: number;
  height: number;
  srcSet: { src: string; width: number; height: number }[];
}[] = photoSizes.map(([width, height], index) => ({
  src: `${basePath}${index + 1}.png`,
  width,
  height,
  srcSet: breakpoints.map((breakpoint) => {
    const scaledHeight = Math.round((height / width) * breakpoint);
    return {
      src: `${basePath}${index + 1}.png`,
      width: breakpoint,
      height: scaledHeight,
    };
  }),
}));

const navBarLinks = [
  {
    text: 'Home',
    link: '/',
  },
  {
    text: 'Explore Prizes',
    link: '/prize/explore',
  },
  // {
  //   text: 'Pacts',
  //   link: '/pact/home',
  // },
  // {
  //   text: 'about',
  //   link: '/about',
  // },
];

export default function Home() {
  const router = useRouter();

  const { ready } = usePrivy();

  const { refreshUser } = useAppUser();

  useEffect(() => {
    if (ready) {
      void refreshUser()
        .catch((error: FetchError) => {
          console.log({ error }, 'errror');
          if (error.status === 404) {
            router.push('/onboarding').catch(console.error);
          }
        })
        .then(console.log);
    }
  }, [ready]);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center relative overflow-clip"
      style={{
        background: `radial-gradient(243.55% 153.69% at 23.48% -1.07%, #EBF3F5 6.99%, #C5E2F0 100%)`,
      }}
    >
      {/*Nav bar*/}
      <NavBar />
      <div className="max-w-screen-2xl px-8 pt-4 pb-8 w-full bg-transparent">
        {/* Hero Section */}
        <section className="md:flex justify-betweem items-center h-screen">
          <div className="relative z-50 md:w-1/2 px-4 py-2">
            {/* <h2 className="font-normal text-lg text-black uppercase my-0">
              Crowdfund the future
            </h2> */}
            <h1 className="font-bold text-5xl text-black my-6">
              Trustworthy crowdfunding
            </h1>
            {/* <p className="text-lg text-gray-600 my-4">
              Simple and sleek design with users in mind. viaPrize is a platform that
              allows
            </p> */}
            <Button className="bg-gradient-to-r from-[#005A6D] to-[#147EA3]">
              <Link href="/prize/explore">Explore Prizes</Link>
            </Button>
            <Flex
              className="backdrop-blur-md rounded-lg py-6 px-5 my-4 text-black w-[70%]"
              style={{
                background: `rgba(125, 185, 206, 0.15)`,
              }}
              justify="space-between"
              align="center"
            >
              <div>
                <h3 className="my-0">$32,460</h3>
                <p className="my-0">Total contributions</p>
              </div>
              <div>
                <h3 className="my-0">62</h3>
                <p className="my-0">Prize winners</p>
              </div>
              <div>
                <h3 className="my-0">16</h3>
                <p className="my-0">Prizes won</p>
              </div>
            </Flex>
          </div>
          <div className="md:w-1/2">
            <div
              className="absolute right-[-30%] top-[-40%] w-[80vw] h-[80vw] rounded-full"
              style={{
                background: `linear-gradient(136deg, #D8E6EF 27.28%, #B4D8E4 87.37%)`,
              }}
            />
            <div className="hidden sm:block absolute h-screen w-16 right-0 top-0">
              <div className="h-1/2 w-full bg-gradient-to-t from-[#35A7A0] to-[#8ee8d8]" />
              <div className="h-1/2 w-full bg-gradient-to-t from-[#89C8DD] to-[#73ADC1]" />
            </div>
            <Image
              alt="hero image"
              height={500}
              width={500}
              className="relative z-10 object-cover w-full"
              src="/home/hero.png"
            />
          </div>
        </section>
        {/* How it works */}
        <div className="flex flex-col items-center">
          <h1 className="text-black capitalize">Why viaPrize?</h1>
          <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
            <ReasonCard
              Title="Reason 1"
              Description="30B is wasted annually on crowdfunding campaigns that never deliver"
              image="https://img.freepik.com/free-photo/piggy-bank-was-thrown-broke-gold-coins-flowed-out_35913-3161.jpg?w=2000&t=st=1699282904~exp=1699283504~hmac=e46f0c2043992af865d65686b9f5f909ec1fe85fc01f83a50ae4b00cd376ccd3"
            />
            <ReasonCard
              Title="Reason 2"
              Description="With viaPrize Either the campaign delivers or you receive a refund"
              image="https://img.freepik.com/free-photo/3d-cryptocurrency-rendering-design_23-2149074550.jpg?w=2000&t=st=1699283400~exp=1699284000~hmac=d294cc280e87f50abd42aa22260ba7acd215464ec003659fb7067d535dbc5136"
            />
            <ReasonCard
              Title="Reason 3"
              Description="Win prizes!"
              image="https://img.freepik.com/free-photo/team-working-animation-project_23-2149269903.jpg?w=2000&t=st=1699283321~exp=1699283921~hmac=2c2cb20d21db38dcfcf08834445cc9087d7a33ba58dc0aadd75187156eda9062"
            />
          </div>
          {/* <h2 className="text-black mt-6">Some More Stats</h2>
          <Flex
            className="backdrop-blur-md rounded-lg py-6 px-5 mb-4 text-black w-full"
            style={{
              background: `rgba(125, 185, 206, 0.15)`,
            }}
            justify="space-evenly"
            align="center"
          >
            <div>
              <h3 className="my-0">$50 million</h3>
              <p className="my-0">Total Prize Money</p>
            </div>
            <div>
              <h3 className="my-0">100+</h3>
              <p className="my-0">Total Prizes</p>
            </div>
            <div>
              <h3 className="my-0">500+</h3>
              <p className="my-0">Total Participants</p>
            </div>
            <div>
              <h3 className="my-0">500+</h3>
              <p className="my-0">Total Participants</p>
            </div>
          </Flex> */}
        </div>
        {/* viaPrize’s Core Functions  */}
        {/* <section className="my-24 flex items-center flex-col gap-3">
          <h1 className="text-3xl font-bold text-black">
            viaPrize&apos;s Core Functions
          </h1>
          <FunctionCard
            Title="Prize"
            Description="Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl"
            know="linking"
            explore="sadlfsafasd"
          />
          <FunctionCard
            Title="Pact"
            Description="Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl"
            know="linking"
            explore="sadlfsafasd"
          />
          <FunctionCard
            Title="Go Fund Me"
            Description="Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing 
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello 
          sadlkfjlajsl Hey testing is the one of the hello sadlkfjlajsl Hey testing
          is the one of the hello sadlkfjlajsl Hey testing is the one of the hello
          sadlkfjlajsl"
            know="linking"
            explore="sadlfsafasd"
          />
        </section> */}

        {/* How it works */}
        <section className="flex flex-col items-center my-14">
          <h1 className="text-3xl font-bold text-black">How it works</h1>
          <Image
            src="/home/howItWorks.png"
            width={1000}
            height={500}
            alt="How it works"
            className="rounded-md max-w-full h-60 sm:h-80 md:h-96 lg:h-120 xl:h-160"
          />
        </section>
        {/* 3 roles in a prize */}
        <section className="flex flex-col items-center my-14">
          <h1 className="text-3xl font-bold text-black">3 Roles in a Prize</h1>
          <Image
            src="/home/rolesInPrize.png"
            width={1000}
            height={500}
            alt="How it works"
            className="rounded-md"
          />
        </section>
        {/* Community */}
        <section className="my-12 gap-3 ">
          <div className=" flex flex-col items-center">
            <h1 className="w-96 text-3xl text-center font-bold text-black">
              See what our community is saying
            </h1>
            <Button className="bg-gradient-to-r from-[#005A6D] to-[#147EA3]">
              <Link href="https://t.me/viaPrize">Join Community</Link>
            </Button>
          </div>
          <div className="my-4" />
          <PhotoAlbum
            layout="masonry"
            photos={photos}
            renderPhoto={NextJsImage}
            columns={(containerWidth) => {
              if (containerWidth < 400) return 1;
              if (containerWidth < 800) return 2;
              return 3;
            }}
          />
        </section>
        {/* Footer */}
      </div>
      <footer className="text-white w-full bg-slate-950">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <Link href="/" className="flex items-center mb-4 sm:mb-0">
              <Image
                src="/viaprizeBg.png"
                className="h-8 mr-3"
                alt="viaPrize Logo"
                width={32}
                height={32}
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                viaPrize
              </span>
            </Link>
            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
              <li>
                <Link href="#" className="mr-4 hover:underline md:mr-6 ">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="mr-4 hover:underline md:mr-6">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="mr-4 hover:underline md:mr-6 ">
                  Licensing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div className="my-4">
            <Link href="https://twitter.com/viaPrize">
              <BsTwitter className="inline-block mr-4 text-2xl text-blue-400 " />
            </Link>
            <Link href="https://www.linkedin.com/company/viaPrize/">
              <BiLogoLinkedin className="inline-block mr-4 text-2xl text-white " />
            </Link>
            <Link href="https://t.me/viaPrize">
              <ImTelegram className="inline-block mr-4 text-2xl text-blue-400 bg-white rounded-full" />
            </Link>
          </div>

          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2023{' '}
            <a href="/" className="hover:underline">
              viaPrize™
            </a>
            . All Rights Reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

function NavBarLinks({ text, link }: { text: string; link: string }) {
  return (
    <Link
      href={link}
      className="font-semibold text-lg text-gray-700 capitalize hover:text-black"
    >
      {text}
    </Link>
  );
}

function NavBar() {
  const [opened, { toggle }] = useDisclosure();
  const { user } = usePrivy();

  const { loginUser } = useAppUser();

  return (
    <>
      <nav className="relative z-10 hidden md:flex justify-between w-full md:px-14 pt-2 ">
        <div className="flex gap-3 items-center">
          <Image
            src="/viaprizeBg.png"
            alt="viaPrize Logo"
            width={40}
            height={40}
            priority
            className="rounded-full"
          />
          <h3 className="font-bold text-2xl text-black">viaPrize</h3>
        </div>
        <div className="flex gap-10 justify-between items-center">
          {navBarLinks.map((data) => (
            <NavBarLinks key={data.text} text={data.text} link={data.link} />
          ))}
          <Button
            className="rounded-lg px-6 bg-gradient-to-r from-[#32a9c0] to-[#2794bc]"
            component="a"
            href="/prize/create"
          >
            Create Prize
          </Button>
          {user ? (
            <Badge variant="gradient" className="py-4">
              {user.wallet?.address.slice(0, 6)}...{user.wallet?.address.slice(-6, -1)}
            </Badge>
          ) : (
            <Button
              className="rounded-lg px-6 bg-gradient-to-r from-[#32a9c0] to-[#2794bc]"
              onClick={() => {
                loginUser()
                  .then(() => {
                    console.log('logging in ');
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }}
            >
              Login
            </Button>
          )}
        </div>
      </nav>
      <nav className="md:hidden flex w-full justify-between px-5 py-5">
        <Image
          src="/viaprizeBg.png"
          alt="viaPrize Logo"
          width={40}
          height={40}
          priority
        />
        <Burger
          opened={opened}
          onClick={toggle}
          aria-label="Toggle navigation"
          className="z-[1000]"
        />
        {opened ? (
          <div
            className=" flex flex-col items-center gap-3 absolute top-3 right-3 rounded-lg backdrop-blur-md py-24 px-24 z-[999]"
            style={{
              background: `rgba(125, 185, 206, 0.15)`,
            }}
          >
            {navBarLinks.map((data) => (
              <NavBarLinks key={data.text} text={data.text} link={data.link} />
            ))}
          </div>
        ) : null}
      </nav>
    </>
  );
}

function ReasonCard({
  Title,
  Description,
  image,
}: {
  Title: string;
  Description: string;
  image: string;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="lg" className="bg-[#486B78]">
      <Card.Section className="p-4 rounded-lg">
        <Image
          src={image}
          height={200}
          alt="Reason 1"
          width={160}
          className="w-full object-cover rounded-lg"
        />
      </Card.Section>

      <h3 className="text-xl text-white font-bold my-0">{Title}</h3>

      <p className="text-base text-white">{Description}</p>
      {/* //TODO: Add read more button  */}

      {/* <Button className="bg-[#DFEDF2] text-black rounded-lg" fullWidth mt="md">
        Read More
      </Button> */}
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- will use it later
function FunctionCard({
  Title,
  Description,
  explore,
  know,
}: {
  Title: string;
  Description: string;
  explore: string;
  know: string;
}) {
  return (
    <Card className="bg-[#486B78] rounded-2xl p-10">
      <h1 className="my-0 text-white ">{Title}</h1>
      <p className="text-white md:max-w-[80%] text-lg lg:font-semibold leading-7">
        {Description}
      </p>
      <Flex gap="sm">
        <Button
          className="bg-[#E5F1F5] text-black font-bold gap-5 items-center"
          rightSection={<BiSolidRightArrowCircle size={14} />}
        >
          <Link href={know}>Know More</Link>
        </Button>
        <Button
          className="bg-[#E5F1F5] text-black font-bold flex gap-5 items-center"
          rightSection={<BiSolidRightArrowCircle size={14} />}
        >
          <Link href={explore}>explore prizes</Link>
        </Button>
      </Flex>
    </Card>
  );
}

function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, onClick },
  wrapperStyle,
}: RenderPhotoProps) {
  return (
    <div style={{ ...wrapperStyle, position: 'relative' }}>
      <Image
        fill
        className="rounded-lg"
        src={photo}
        placeholder={'blurDataURL' in photo ? 'blur' : undefined}
        {...{ alt, title, sizes, onClick }}
      />
    </div>
  );
}
