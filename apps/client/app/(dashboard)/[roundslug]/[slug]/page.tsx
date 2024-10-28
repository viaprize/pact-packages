// 'use client';
import { fetchApplicationById, fetchRoundForExplorer } from '@/lib/actions';
import { gitcoinRounds } from '@/lib/constants';
import { Text } from '@mantine/core';
import { notFound } from 'next/navigation';
import Description from './description';
import DetailCard from './detail-card';
import ImageTitleCard from './image-title-card';
import SocialCard from './social-card';

export const dynamic = 'force-dynamic';
export default async function GitcoinApplication({
  params,
}: {
  params: {
    roundslug: string;
    slug: string;
  };
}) {
  const getIds = gitcoinRounds.find((round) => round.roundSlug === params.roundslug);

  if (!getIds) {
    return notFound();
  }

  const applicationsInRound = await fetchApplicationById(
    params.slug,
    getIds.chainId,
    getIds.roundId,
  );
  const round = await fetchRoundForExplorer(getIds.chainId, getIds.roundId);
  console.log(applicationsInRound);

  return (
    <div className="my-10 px-3 sm:px-6 md:px-14 lg:px-20">
      <ImageTitleCard
        exploreUrl={`/${params.roundslug}`}
        title={applicationsInRound?.project?.metadata?.title}
        img={
          applicationsInRound.project.metadata.bannerImg
            ? `https://gitcoin.mypinata.cloud/ipfs/${applicationsInRound.project.metadata.bannerImg} `
            : '/bgimagenotfound.jpg'
        }
        logoURL={
          applicationsInRound.project.metadata.logoImg
            ? `https://gitcoin.mypinata.cloud/ipfs/${applicationsInRound.project.metadata.logoImg}`
            : '/bgimagenotfound.jpg'
        }
        application={applicationsInRound}
        applicationID={applicationsInRound.id}
        roundId={getIds.roundId}
        chainId={getIds.chainId}
        roundSlug={params.roundslug}
      />
      <div className="w-full lg:flex gap-4 justify-between mt-12">
        <SocialCard
          createdOn={applicationsInRound.project.metadata.createdAt}
          website={applicationsInRound.project.metadata.website}
          twitter={applicationsInRound.project.metadata.projectTwitter ?? ''}
        />
        <DetailCard
          fundingRecieved={applicationsInRound.totalAmountDonatedInUsd}
          daysLeft={round.donationsEndTime}
          contributors={applicationsInRound.uniqueDonorsCount}
        />
      </div>
      <Text size="xl" mt="md" fw="bold">
        About
      </Text>
      <Description description={applicationsInRound.project.metadata.description} />
    </div>
  );
}
